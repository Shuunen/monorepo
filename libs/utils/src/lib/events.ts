type ListenerMedia = Element | HTMLElement | typeof globalThis | Window;

export type Listener = {
  callback: (event: Event) => unknown;
  media: ListenerMedia;
  name: string;
};

/**
 * Emit an event on a media, window by default
 * @param name the name of the event
 * @param data the data to emit
 * @param media the media to emit the event from, like window or a dom element
 */
export function emit<Data>(name: string, data?: Readonly<Data>, media: ListenerMedia = globalThis) {
  /* v8 ignore start */
  if (data === undefined) {
    media.dispatchEvent(new CustomEvent(name));
  } else {
    media.dispatchEvent(new CustomEvent(name, { detail: data }));
  }
  /* v8 ignore stop */
}

/**
 * Listen to an event on a media, window by default
 * @param name the name of the event to listen to
 * @param callback the callback to call when the event is emitted
 * @param media the media to listen to the event, like window or a dom element
 * @returns false if the event cannot be not listened to or a listener object if it can
 */
export function on(
  name: string,
  callback: (data: unknown, event: Event) => unknown,
  media: ListenerMedia = globalThis,
) {
  /**
   * The callback to call when the event is emitted
   * @param event the event
   * @returns the result of the callback
   */
  function onCallback(event: Event) {
    const eventData = event instanceof CustomEvent ? (event.detail as unknown) : (event as unknown);
    // oxlint-disable-next-line prefer-await-to-callbacks
    return callback(eventData, event);
  }
  media.addEventListener(name, onCallback, { passive: true });
  return { callback: onCallback, media, name };
}

/**
 * Remove a listener from a media, window by default
 * @param listener the listener to remove
 * @param listener.media the media to remove the listener from, like window or a dom element
 * @param listener.name the name of the event to remove the listener from
 * @param listener.callback the callback to remove
 */
export function off({ callback, media, name }: Readonly<Listener>) {
  media.removeEventListener(name, callback);
}
