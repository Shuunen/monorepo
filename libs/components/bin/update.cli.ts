import { readdirSync } from "node:fs";
import { join } from "node:path";
import { green, Logger, nbThird } from "../../utils/src";
import { updateComponent } from "./add.cli";

const logger = new Logger();

function listComponents(startFrom?: string): string[] {
  const targetDir = join(process.cwd(), "libs", "components", "src", "shadcn");
  const files = readdirSync(targetDir);
  const components = files
    .filter(file => file.endsWith(".tsx") && file !== "utils.ts")
    .map(file => file.replace(".tsx", ""));
  if (!startFrom) {
    return components;
  }
  const startIndex = components.indexOf(startFrom);
  return components.slice(startIndex);
}

async function processAll(components: string[]) {
  let successCount = 0;
  let errorCount = 0;
  for (const component of components) {
    // oxlint-disable-next-line no-await-in-loop
    const result = await updateComponent(component);
    if (result.ok) {
      successCount += 1;
    } else {
      errorCount += 1;
    }
  }
  logger.info("ShadCn components update completed, here is the summary :");
  logger.info(`- ${components.length} components processed`);
  if (successCount > 0) {
    logger.success(`- ${successCount} components updated`);
  }
  if (errorCount > 0) {
    logger.error(`- ${errorCount} components failed to update`);
  }
}

async function updateAll(startFrom?: string) {
  logger.info("Starting ShadCn components update...");
  const components = listComponents(startFrom);
  logger.info(`Found ${green(String(components.length))} components to update`);
  await processAll(components);
}

const component = process.argv.slice(nbThird)[0];
await updateAll(component);
