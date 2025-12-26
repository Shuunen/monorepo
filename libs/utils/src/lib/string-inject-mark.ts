/**
 * Inject a mark in a string at a specific placeholder locations like
 * `__placeholder__` or `<div id="placeholder">...</div>` or `<meta name="placeholder" content="..." />`
 * @param content the string to inject the mark in
 * @param placeholder the placeholder to replace
 * @param mark the mark to inject
 * @returns the new string with the mark injected
 */
export function injectMark(content: string, placeholder: string, mark: string) {
  return content
    .replaceAll(new RegExp(`__${placeholder}__`, "gu"), mark)
    .replaceAll(new RegExp(`{{1,2} ?${placeholder} ?}{1,2}`, "g"), mark)
    .replace(new RegExp(`(<[a-z.]+\\b[^>]*id="${placeholder}"[^>]*>)[^<]*(</[a-z.]+>)`, "u"), `$1${mark}$2`)
    .replace(new RegExp(`(<meta\\b[^>]*name="${placeholder}"[^>]*content=")[^"]*(")`, "u"), `$1${mark}$2`)
    .replace(new RegExp(`(<meta\\b[^>]*content=")[^"]*(" [^>]*name="${placeholder}")`, "u"), `$1${mark}$2`)
    .replace(new RegExp(`(\\w+\\.jsx\\([^,]+,\\{[^}]*id:"${placeholder}"[^}]*)(\\})`, "u"), `$1,children:"${mark}"$2`);
}
