import { Textarea } from "@monorepo/components";
import { decodeFromUrl, encodeForUrl } from "@monorepo/utils";
import { useEffect, useId, useState } from "react";
import { emptyHistory, sampleInput } from "./constants";
import { Rules } from "./rules";
import type { Rule } from "./types";
import { applyRules } from "./utils";

function getSearchParams(): URLSearchParams {
  /* v8 ignore next -- @preserve */
  return globalThis.URLSearchParams === undefined
    ? new globalThis.window.URLSearchParams(globalThis.location.search)
    : new globalThis.URLSearchParams(globalThis.location.search);
}

export function Converter() {
  const [input, setInput] = useState(sampleInput);
  const defaultRules: Rule[] = [
    { enabled: true, id: useId(), pattern: "\\.", replacement: "🐱" },
    { enabled: true, id: useId(), pattern: "right", replacement: "" },
    { enabled: false, id: useId(), pattern: "([A-Z])", replacement: "- $1" },
    { enabled: false, id: useId(), pattern: "", replacement: "" },
  ];
  const [rules, setRules] = useState<Rule[]>(() => {
    const params = getSearchParams();
    const rulesParam = params.get("rules");
    if (rulesParam) {
      const loaded = decodeFromUrl(rulesParam);
      /* v8 ignore if -- @preserve */
      if (Array.isArray(loaded) && loaded.length > 0) return loaded;
    }
    return defaultRules;
  });
  useEffect(() => {
    const params = getSearchParams();
    params.set("rules", encodeForUrl(rules));
    const newUrl = `${globalThis.location.pathname}?${params.toString()}`;
    globalThis.history.replaceState(emptyHistory, "", newUrl);
  }, [rules]);
  const output = applyRules(input, rules);
  /* v8 ignore next -- @preserve */
  return (
    <div className="flex flex-col">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mt-2 mb-2">input</h2>
          <Textarea
            className="h-80 w-full rounded-xl border bg-white p-3 shadow"
            name="input"
            onChange={event => setInput(event.target.value)}
            placeholder="Paste your text here..."
            value={input}
          />
        </div>
        <div>
          <h2 className="mt-2 mb-2 text-secondary">output</h2>
          <Textarea
            className="h-80 w-full rounded-xl border bg-white p-3 shadow"
            name="output"
            readOnly
            value={output}
          />
        </div>
      </div>
      <div className="col-span-2 mt-8">
        <Rules rules={rules} setRules={setRules} />
      </div>
    </div>
  );
}
