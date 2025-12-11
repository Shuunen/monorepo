import { daysFromNow } from "./date-relative.js";
import { dateIso10 } from "./dates.js";

it("daysFromNow A without param", () => {
  expect(daysFromNow().toISOString()).toContain(dateIso10());
});
