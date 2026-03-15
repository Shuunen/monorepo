/* v8 ignore file */
// oxlint-disable max-nested-callbacks
import {
  dateIso10,
  downloadFile,
  isBrowserEnvironment,
  nbSpacesIndent,
  Result,
  toastError,
  toastSuccess,
} from "@monorepo/utils";
import PouchDB from "pouchdb";
import type { Task, TaskDocument } from "../types";
import { logger } from "./logger.utils";
import { state, watchState } from "./state.utils";

const testWorkerId = globalThis.process?.env?.VITEST_WORKER_ID ?? "0";
const testDatabaseBasePath = globalThis.process?.env?.TMPDIR ?? "/tmp";
const localDatabaseName = isBrowserEnvironment() ? "what-now" : `${testDatabaseBasePath}/what-now-test-${testWorkerId}`;
let localDatabase: PouchDB<TaskDocument> | undefined = undefined;
let remoteDatabase: PouchDB<TaskDocument> | undefined = undefined;

export const couchDbWritesEnabled = false;

function createRemoteDatabaseUrl() {
  const { couchUrl, couchDb } = state;
  const normalizedCouchUrl = couchUrl.replace(/\/+$/u, "");
  return `${normalizedCouchUrl}/${couchDb}`;
}

watchState("isSetup", (updatedKey, isSetup) => {
  logger.info(`${updatedKey} is now ${isSetup}`);
  if (!isSetup) {
    logger.info("prevent db instance creation, app is not setup");
    return;
  }
  logger.info("creating pouchdb instances", { localDatabaseName, remoteDatabaseUrl: createRemoteDatabaseUrl(), state });
  localDatabase = new PouchDB<PouchTaskDocument>(localDatabaseName);
  remoteDatabase = new PouchDB<PouchTaskDocument>(createRemoteDatabaseUrl(), {
    auth: {
      password: state.couchPass,
      username: state.couchUser,
    },
  });

  /* v8 ignore start */
  if (isBrowserEnvironment())
    localDatabase
      .sync(remoteDatabase, { live: true, retry: true })
      .on("change", function handleSyncChange() {
        logger.info("couchdb sync change received");
      })
      .on("paused", function handleSyncPaused() {
        logger.info("couchdb sync paused");
      })
      .on("active", function handleSyncActive() {
        logger.info("couchdb sync resumed");
      })
      .on("error", function handleSyncError(error) {
        logger.error("couchdb sync failed", error);
      });
  /* v8 ignore stop */
});

export type PouchTaskDocument = TaskDocument;

export function modelToLocalTask(task: Readonly<PouchTaskDocument>) {
  return {
    completedOn: task.completedOn,
    id: task._id,
    isDone: task.isDone,
    minutes: task.minutes,
    name: task.name,
    once: task.once,
    reason: task.reason,
  } satisfies Task;
}

export function modelToRemoteTask(model: Readonly<PouchTaskDocument>) {
  return {
    _id: model._id,
    _rev: model._rev,
    completedOn: model.completedOn,
    isDone: model.isDone,
    minutes: model.minutes,
    name: model.name,
    once: model.once,
    reason: model.reason,
    type: "task",
  } satisfies PouchTaskDocument;
}

export function localToRemoteTask(task: Readonly<Task>) {
  return {
    _id: task.id,
    completedOn: task.completedOn,
    isDone: task.isDone,
    minutes: task.minutes,
    name: task.name,
    once: task.once,
    reason: task.reason,
    type: "task",
  } satisfies PouchTaskDocument;
}

function createWriteSkippedResult(action: string) {
  logger.info(`${action} skipped, couchdb writes are disabled`);
  return Result.ok({ skipped: true });
}

/* v8 ignore next */
function ensureTaskDocumentType(taskDocument: Readonly<PouchTaskDocument>) {
  return { ...taskDocument, type: "task" } satisfies PouchTaskDocument;
}

export function addTask(data: Readonly<PouchTaskDocument>) {
  if (!localDatabase) return Result.error("Local database is not initialized");
  if (!couchDbWritesEnabled) return createWriteSkippedResult("addTask");
  /* v8 ignore next */
  const documentToInsert = ensureTaskDocumentType(data);
  /* v8 ignore next */
  return Result.trySafe(localDatabase.put(documentToInsert));
}

export async function updateTask(task: Readonly<Task>) {
  if (!localDatabase) return Result.error("Local database is not initialized");
  if (!couchDbWritesEnabled) return createWriteSkippedResult("updateTask");
  /* v8 ignore start */
  const currentResult = await Result.trySafe(localDatabase.get(task.id));
  if (!currentResult.ok) return currentResult;
  const documentToUpdate = {
    ...localToRemoteTask(task),
    _rev: currentResult.value._rev,
  } satisfies PouchTaskDocument;
  return Result.trySafe(localDatabase.put(documentToUpdate));
  /* v8 ignore stop */
}

/* v8 ignore next */
function isTaskDocument(document: unknown): document is PouchTaskDocument {
  if (typeof document !== "object" || document === null) return false;
  if (!("type" in document) || document.type !== "task") return false;
  if (!("_id" in document) || typeof document._id !== "string") return false;
  return true;
}

async function getTaskDocuments() {
  if (!localDatabase) return Result.error("Local database is not initialized");
  const result = await Result.trySafe(localDatabase.allDocs({ include_docs: true }));
  logger.info("fetched task documents from database", result);
  if (!result.ok) return result;
  /* v8 ignore start */
  const taskDocuments = result.value.rows
    .map((row: { doc?: PouchTaskDocument }) => row.doc)
    .filter((document): document is PouchTaskDocument => isTaskDocument(document))
    .map((document: PouchTaskDocument) => modelToRemoteTask(document));
  /* v8 ignore stop */
  return Result.ok(taskDocuments);
}

export async function getTasks() {
  const result = await getTaskDocuments();
  if (!result.ok) return result;
  const tasks = result.value.map<Task>((task: PouchTaskDocument) => modelToLocalTask(task));
  logger.info(`found ${tasks.length} tasks on db`, tasks);
  return Result.ok(tasks);
}

/* v8 ignore next */
export async function downloadData() {
  const result = await getTaskDocuments();
  if (!result.ok) {
    toastError("Failed to download data");
    logger.error("failed to download data", result.error);
    return;
  }
  const json = JSON.stringify(result.value, undefined, nbSpacesIndent);
  const blob = new Blob([json], { type: "application/json" });
  downloadFile(blob, `${dateIso10()}_what-now_tasks.json`);
  toastSuccess("Data downloaded");
}
