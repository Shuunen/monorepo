import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { alignForSnap } from "./testing-align-for-snap.js";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register();
}

describe("testing-align-for-snap", () => {
  it("alignForSnap A Windows filepath", () => {
    const result = alignForSnap({ value: String.raw`\documents\my-file.pdf` });
    expect(result).toMatchInlineSnapshot(`
    "{
      "value": "/documents/my-file.pdf"
    }"
  `);
  });

  it("alignForSnap B French date", () => {
    const result = alignForSnap("Lu et approuvé le 16/05/2024 17:36:32");
    expect(result).toMatchInlineSnapshot('"Lu et approuvé le xx/xx/xxxx xx:xx:xx"');
  });

  it("alignForSnap C American date", () => {
    const result = alignForSnap("Read & approved on 6/25/2024, 11:21:23 AM");
    expect(result).toMatchInlineSnapshot('"Read & approved on xx/xx/xxxx xx:xx:xx"');
  });

  it("alignForSnap D Date instance", () => {
    expect(alignForSnap(new Date("2024-05-16T17:36:32"))).toMatchInlineSnapshot('""xxxx-xx-xxTxx:xx:xx.xxxZ""');
  });

  it("alignForSnap E kind of ISO date string", () => {
    expect(alignForSnap("2024-05-16 15:36:32.000Z")).toMatchInlineSnapshot('"xxxx-xx-xx xx:xx:xx.xxxZ"');
  });

  it("alignForSnap F kind of ISO date string without timezone", () => {
    expect(alignForSnap("2024-05-16T15:36:32")).toMatchInlineSnapshot('"xxxx-xx-xxTxx:xx:xx"');
  });

  it("alignForSnap G HTMLElement", () => {
    const div = document.createElement("div");
    div.textContent = "Generated on 16/05/2024 17:36:32";
    expect(alignForSnap(div)).toMatchInlineSnapshot('"Generated on xx/xx/xxxx xx:xx:xx"');
  });

  it("alignForSnap H Array of mixed content", () => {
    const div1 = document.createElement("div");
    div1.textContent = "File created on 16/05/2024 17:36:32";
    const div2 = document.createElement("div");
    div2.textContent = String.raw`Path: \\documents\\file.pdf`;
    const array = ["Date: 6/25/2024, 11:21:23 AM", null, undefined, div1, div2];
    expect(alignForSnap(array)).toMatchInlineSnapshot(`"Date: xx/xx/xxxx xx:xx:xx | null | undefined | File created on xx/xx/xxxx xx:xx:xx | Path: /documents/file.pdf"`);
  });
});
