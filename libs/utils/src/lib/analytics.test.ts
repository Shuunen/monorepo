import { createAnalytics } from "./analytics.js";
import { Result } from "./result.js";

it("analytics A defaults", () => {
  const analytics = createAnalytics();
  const track = Result.unwrap(analytics.track("event-test"));
  expect(track.value).toMatchInlineSnapshot(`"analytics : track event "event-test" for app "app-default""`);
  expect(track.error).toBeUndefined();
  const page = Result.unwrap(analytics.page());
  expect(page.value).toMatchInlineSnapshot(`"analytics : track page for app "app-default""`);
  expect(page.error).toBeUndefined();
  const identify = Result.unwrap(analytics.identify("id-test"));
  expect(identify.value).toMatchInlineSnapshot(`"analytics : identify user "id-test" on app "app-default""`);
  expect(identify.error).toBeUndefined();
});

it("analytics B with pile", () => {
  const analytics = createAnalytics({ app: "unit-pile", willPile: true });
  analytics.track("event-name");
  analytics.page();
  analytics.identify("user-id");
  expect(analytics.pile.join(", ")).toMatchInlineSnapshot(`"track:event-name, page, identify:user-id"`);
});

it("analytics C with callbacks", () => {
  const onIdentify = vi.fn();
  const onPage = vi.fn();
  const onTrack = vi.fn();
  const analytics = createAnalytics({ app: "unit-callbacks", onIdentify, onPage, onTrack });
  analytics.track("event-name");
  expect(onTrack).toHaveBeenNthCalledWith(1, "event-name", undefined);
  analytics.track("event-alt", { year: 2025 });
  expect(onTrack).toHaveBeenNthCalledWith(2, "event-alt", { year: 2025 });
  analytics.page();
  expect(onPage).toHaveBeenCalledOnce();
  analytics.identify("user-id");
  expect(onIdentify).toHaveBeenNthCalledWith(1, "user-id", undefined);
  analytics.identify("user-id", { age: 35 });
  expect(onIdentify).toHaveBeenNthCalledWith(2, "user-id", { age: 35 });
});

it("analytics D with willLog", () => {
  const analytics = createAnalytics({ willLog: true });
  const result = Result.unwrap(analytics.track("log-event"));
  expect(result.value.includes("analytics : track event")).toBe(true);
});

it("analytics E with willPile and willLog", () => {
  const analytics = createAnalytics({ willLog: true, willPile: true });
  analytics.track("event1");
  analytics.page();
  analytics.identify("user1");
  expect(analytics.pile).toEqual(["track:event1", "page", "identify:user1"]);
});
