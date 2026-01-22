/* c8 ignore start */
/**
 * Download a file from a `File` instance.
 * @param file the `File` instance.
 */
export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
