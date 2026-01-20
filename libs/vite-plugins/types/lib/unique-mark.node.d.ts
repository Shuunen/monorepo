/**
 * Wrap a string with a color code
 * @param {number} from the color code to start the color
 * @param {number} to the color code to end the color
 * @param {string} string the string to wrap
 * @returns the string with the color code
 */
export function addColorCode(from: number, to: number, string: string): string;
/**
 * Render a yellow string for the terminal
 * @param {string} string the string to render
 * @returns the string with the yellow color
 */
export function yellow(string: string): string;
/**
 * Inject a mark in a string at a specific placeholder locations like
 * `__placeholder__` or `<div id="placeholder">...</div>` or `<meta name="placeholder" content="..." />`
 * @param {string} content the string to inject the mark in
 * @param {string} placeholder the placeholder to replace
 * @param {string} mark the mark to inject
 * @returns the new string with the mark injected
 */
export function injectMark(content: string, placeholder: string, mark: string): string;
/**
 * Generate the mark to inject
 * @param {object} root0 the options
 * @param {string} [root0.commit] the commit hash to use, if empty, will use the last git commit hash
 * @param {Date}   [root0.date] the date to use, if empty, will use the current date
 * @param {string} [root0.version] the version to use, if empty, will use the version from package.json
 * @returns the mark to inject, like "4.2.0 - 123abc45 - 01/01/2021 12:00"
 */
export function generateMark({ commit, date, version }: {
    commit?: string | undefined;
    date?: Date | undefined;
    version?: string | undefined;
}): string;
/**
 * Injects a unique mark into the provided asset content at the specified placeholder.
 * @param {object} params - The parameters for injection.
 * @param {Record<string,string>} params.asset - The asset record containing the content to modify.
 * @param {string} params.fileName - The name of the file being processed.
 * @param {string} params.mark - The unique mark to inject.
 * @param {string} params.placeholder - The placeholder string to be replaced by the mark.
 */
export function injectMarkInAsset({ asset, fileName, mark, placeholder }: {
    asset: Record<string, string>;
    fileName: string;
    mark: string;
    placeholder: string;
}): void;
/**
 * Injects a unique mark into specified asset files (HTML, JS, and CSS) by replacing a placeholder.
 * @param {Record<string, Record<string,string>>} assets - An object mapping file names to asset contents.
 * @param {string} placeholder - The placeholder string to be replaced with the unique mark.
 * @param {string} version - The version string to include in the generated mark.
 */
export function injectMarkInAssets(assets: Record<string, Record<string, string>>, placeholder: string, version: string): void;
/**
 * Retrieves the version of a project from its package.json file.
 * @param {string} projectRoot - The root directory of the project.
 * @returns {string} The version specified in package.json, or an empty string if not found or on error.
 */
export function getProjectVersion(projectRoot: string): string;
/**
 * Vite plugin to inject a unique mark (such as a version string) into build assets.
 * @param {object} [options] - Plugin options.
 * @param {string} [options.placeholder] - Placeholder string to be replaced in assets.
 * @returns {import('vite').Plugin} Vite plugin object.
 */
export function uniqueMark(options?: {
    placeholder?: string | undefined;
}): import("vite").Plugin;
//# sourceMappingURL=unique-mark.node.d.ts.map