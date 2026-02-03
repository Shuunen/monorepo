import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { green, Logger, nbThird, Result, type ResultType, yellow } from "../../utils/src";

const logger = new Logger();

function exitWithError(message: string) {
  logger.error(message);
  process.exit(1);
}

function moveAllShadcnComponents() {
  const shadcnDir = join(process.cwd(), "libs", "components", "@shadcn");
  const targetDir = join(process.cwd(), "libs", "components", "src", "shadcn");

  if (!existsSync(shadcnDir)) {
    return;
  }

  const files = readdirSync(shadcnDir).filter(file => file.endsWith(".tsx"));
  for (const componentFile of files) {
    const sourceFile = join(shadcnDir, componentFile);
    const targetFile = join(targetDir, componentFile);
    try {
      renameSync(sourceFile, targetFile);
      logger.success(`Component ${componentFile} moved`);
    } catch (error) {
      logger.error(`Failed to move ${componentFile}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  rmSync(shadcnDir, { force: true, recursive: true });
}

const useClientRegex = /"use client"\n*/;

function fixAllImports() {
  const targetDir = join(process.cwd(), "libs", "components", "src", "shadcn");
  const files = readdirSync(targetDir).filter(file => file.endsWith(".tsx"));
  for (const componentFile of files) {
    const filePath = join(targetDir, componentFile);
    let content = readFileSync(filePath, "utf8");
    content = content.replaceAll("@shadcn/", "./").replace(useClientRegex, "");
    writeFileSync(filePath, content, "utf8");
    logger.success(`Imports fixed for ${componentFile}`);
  }
}

function setupComponent(component: string): void {
  logger.success("Downloaded successfully");
  logger.info("Setup component...");
  moveAllShadcnComponents();
  fixAllImports();
  // TODO : add the related story if it exists
  // https://github.com/lloydrichards/shadcn-storybook-registry/tree/main/registry/ui
  logger.success(`ShadCn component ${green(component)} is now available to use 🚀`);
  logger.info("Next steps : create an atom that will expose it to monorepo apps, then create a story for it.");
  logger.info(
    "Check for an existing story online https://github.com/lloydrichards/shadcn-storybook-registry/tree/main/registry/ui",
  );
}

function createCloseHandler(
  component: string,
  errorOutput: string[],
  resolve: (value: ResultType<string, string>) => void,
) {
  return (code: number | null) => {
    if (code === 0) {
      setupComponent(component);
      resolve(Result.ok("component setup"));
    } else {
      const exitCode = code ?? "unknown";
      const errorMessage =
        errorOutput.length > 0 ? errorOutput.join("\n") : `Command failed with exit code ${exitCode}`;
      resolve(Result.error(errorMessage));
    }
  };
}

function setupOutputHandlers(child: ReturnType<typeof spawn>, errorOutput: string[]) {
  child.stdout?.on("data", data => {
    const message = data.toString().trim();
    if (message) {
      errorOutput.push(message.replaceAll("\n", " "));
    }
  });
  child.stderr?.on("data", data => {
    const message = data.toString().trim();
    if (message) {
      errorOutput.push(message.replaceAll("\n", " "));
    }
    logger.debug("ShadCn cli", message.slice(nbThird).toLowerCase());
  });
}

function executeCommand(component: string) {
  return new Promise<ResultType<string, string>>(resolve => {
    const args = ["dlx", "shadcn@latest", "add", "--yes", "--overwrite", `--cwd=libs/components`, component];
    const command = [`pnpm`, ...args].join(" ");
    logger.debug("Executing download command :", yellow(command));
    const child = spawn("pnpm", args, { stdio: "pipe" }); //NOSONAR
    const errorOutput: string[] = [];
    setupOutputHandlers(child, errorOutput);
    child.on("close", createCloseHandler(component, errorOutput, resolve));
    child.on("error", error => void resolve(Result.error(`Command failed: ${error.message}`)));
  });
}

async function downloadComponent(component: string) {
  logger.info(`Downloading ShadCn component ${green(component)}...`);
  const result = await executeCommand(component);
  if (!result.ok) {
    exitWithError(result.error);
  }
}

export async function updateComponent(component: string) {
  logger.info(`Updating ShadCn component ${green(component)}...`);
  logger.disable();
  const result = await executeCommand(component);
  logger.enable();
  if (result.ok) {
    logger.success(`Component ${green(component)} updated successfully 🚀`);
  } else {
    logger.error(result.error);
  }
  return result;
}

async function main() {
  const component = process.argv.slice(nbThird)[0];
  if (!component) {
    exitWithError("Please provide a component name to add, ex : pnpm add:shadcn breadcrumb");
  }
  await downloadComponent(component);
}

if (import.meta.main) {
  await main();
}
