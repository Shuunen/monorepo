/* c8 ignore start */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { green, Logger, nbSpacesIndent, nbThird } from "@monorepo/utils";

// use me like : bun bin/add-app.cli.ts <app-name>
// or pnpm run add:app <app-name>

const logger = new Logger();
const filesToUse = [
  "index.html",
  "netlify.toml",
  "package.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.spec.json",
  "vite.config.ts",
  "public/favicon.ico",
  "src/main.tsx",
  "src/styles.css",
  "src/assets/.gitkeep",
  "src/app/app.tsx",
  "src/app/app.test.tsx",
];
const appName = process.argv.slice()[nbThird];

function copyFile(sourceFile: string, targetFile: string, name: string): void {
  const content = readFileSync(sourceFile, "utf8");
  const updatedContent = content.replaceAll("sample-web-app", name);
  const dir = dirname(targetFile);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(targetFile, updatedContent);
  logger.debug(`Copied: ${targetFile}`);
}

function copyFiles(name: string): void {
  const sourceDir = join(process.cwd(), "apps", "sample-web-app");
  const targetDir = join(process.cwd(), "apps", name);
  logger.info(`Creating app...`);
  for (const file of filesToUse) copyFile(join(sourceDir, file), join(targetDir, file), name);
}

function updateTsConfig(name: string): void {
  logger.info("Updating tsconfig.json...");
  const tsConfigPath = join(process.cwd(), "tsconfig.json");
  const tsConfig = JSON.parse(readFileSync(tsConfigPath, "utf8"));
  tsConfig.references.push({ path: `./apps/${name}` });
  // sort the references array for nicer git diffs
  tsConfig.references.sort((referenceA: { path: string }, referenceB: { path: string }) =>
    referenceA.path.localeCompare(referenceB.path),
  );
  writeFileSync(tsConfigPath, JSON.stringify(tsConfig, undefined, nbSpacesIndent));
  logger.debug(`Updated tsconfig.json`);
}

function installDependencies(): void {
  logger.info("Installing dependencies...");
  execSync("pnpm install");
  logger.debug("Dependencies installed successfully");
}

function addApp(name: string): void {
  copyFiles(name);
  updateTsConfig(name);
  installDependencies();
  logger.success(`Created a new app in ${green(`apps/${name}`)} 👌`);
  logger.info(
    `You can now run your app with ${green(`nx dev ${name}`)} or do any other usual command you like : build, test, etc.`,
  );
}

if (appName) addApp(appName);
else {
  logger.error("Usage: pnpm run add:app <app-name>");
  process.exit(1);
}
