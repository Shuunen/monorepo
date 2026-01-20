/**
 * Sleep let you "pause" or delay processes
 * @param ms the time to wait in milliseconds, default 1000ms / 1 sec
 * @returns promise that resolve in the provided time
 */
export function sleep(ms = 1000) {
  return new Promise(resolve => {
    setTimeout(() => resolve(ms), ms);
  });
}
