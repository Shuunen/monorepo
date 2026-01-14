export function isEmpty(obj: Record<string, unknown>) {
  return Object.keys(obj).length === 0;
}
