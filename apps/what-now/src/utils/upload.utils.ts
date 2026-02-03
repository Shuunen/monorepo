import { parseJson, Result, toastError, toastSuccess } from "@monorepo/utils";
import {
  type AppWriteTaskModel,
  addTask,
  getTasks,
  modelToLocalTask,
  modelToRemoteTask,
  updateTask,
} from "./database.utils";
import { logger } from "./logger.utils";

/**
 * Open a file picker to select a JSON file
 * @returns Promise that resolves with the selected file or undefined if cancelled
 */
export function selectJsonFile(): Promise<File | undefined> {
  return new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      void resolve(file);
    };
    input.addEventListener("change", handleChange);
    input.click();
  });
}

/**
 * Read and parse a JSON file
 * @param file - The file to read
 * @returns Promise that resolves with parsed JSON data
 */
export async function readJsonFile(file: File) {
  const text = await file.text();
  const result = parseJson<AppWriteTaskModel[]>(text);
  if (!result.ok) return Result.error(result.error);
  // Validate each task has required properties
  for (const [index, task] of result.value.entries())
    if (!task.name || !task.once || typeof task.minutes !== "number")
      return Result.error(`Task at index ${index} is missing required properties (name, once, minutes)`);
  return Result.ok(result.value);
}

/**
 * Update existing task
 * @param task - The uploaded task
 * @param results - Results object to update
 */
async function updateExistingTask(
  task: AppWriteTaskModel,
  results: { created: number; errors: string[]; updated: number },
) {
  const localTask = modelToLocalTask(task);
  const result = await updateTask(localTask);
  if (result.ok) {
    results.updated += 1;
    logger.info(`updated task: ${task.name}`);
  } else results.errors.push(`Failed to update task "${task.name}": ${result.error}`);
}

/**
 * Create new task
 * @param task - The uploaded task
 * @param results - Results object to update
 */
async function createNewTask(task: AppWriteTaskModel, results: { created: number; errors: string[]; updated: number }) {
  const appWriteTask = modelToRemoteTask(task);
  const result = await addTask(appWriteTask);
  if (result.ok) {
    results.created += 1;
    logger.info(`created task: ${task.name}`);
  } else results.errors.push(`Failed to create task "${task.name}": ${result.error}`);
}

/**
 * Process single task upload (create or update)
 * @param task - The task to process
 * @param existingTaskIds - Set of existing task IDs
 * @param results - Results object to update
 */
async function processTaskUpload(
  task: AppWriteTaskModel,
  existingTaskIds: Set<string>,
  results: { created: number; errors: string[]; updated: number },
) {
  const taskExists = existingTaskIds.has(task.$id);
  if (taskExists) await updateExistingTask(task, results);
  else await createNewTask(task, results);
}

/**
 * Upload tasks from JSON file to the database
 * @param uploadTasks - Array of tasks from the uploaded JSON
 * @returns Result with success/failure information
 */
export async function uploadTasksToDatabase(uploadTasks: AppWriteTaskModel[]) {
  logger.info(`starting upload of ${uploadTasks.length} tasks...`);

  const existingTasksResult = await getTasks();
  if (!existingTasksResult.ok) return Result.error("Failed to load existing tasks for comparison");

  const existingTaskIds = new Set(existingTasksResult.value.map(task => task.id));
  const results = { created: 0, errors: [] as string[], updated: 0 };

  await Promise.all(uploadTasks.map(task => processTaskUpload(task, existingTaskIds, results)));
  return Result.ok(results);
}

/**
 * Show upload results to user
 * @param created - Number of created tasks
 * @param updated - Number of updated tasks
 * @param errors - Array of error messages
 */
function showUploadResults(created: number, updated: number, errors: string[]) {
  if (errors.length > 0) {
    toastError(`Upload completed with ${errors.length} errors. Check console for details.`);
    logger.error("upload errors:", errors);
  } else toastSuccess(`Upload successful! Created: ${created}, Updated: ${updated}`);
  logger.info(`upload completed: ${created} created, ${updated} updated, ${errors.length} errors`);
}

/**
 * Process file selection and parsing
 * @returns Result with uploaded tasks or error
 */
async function processFileUpload() {
  const file = await selectJsonFile();
  if (!file) return Result.error("No file selected");
  const { error, value: tasks } = Result.unwrap(await readJsonFile(file));
  if (error) return Result.error(error);
  logger.info(`parsed ${tasks.length} tasks from file`);
  return Result.ok(tasks);
}

/**
 * Handle the complete task upload process
 * @returns Promise that resolves when upload is complete
 */
export async function handleTasksUpload(): Promise<void> {
  const { error, value: tasks } = Result.unwrap(await processFileUpload());
  if (error) return toastError(error);

  const uploadResult = await uploadTasksToDatabase(tasks);
  if (!uploadResult.ok) return toastError(`Upload failed: ${uploadResult.error}`);

  const { created, errors, updated } = uploadResult.value;
  showUploadResults(created, updated, errors);
}
