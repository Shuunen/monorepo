import { nbSecond } from "@monorepo/utils";
import { useXmlValidator, type ValidationState, type SchemaConfig } from "@monorepo/xml-validator";
import { useCallback, useMemo, useRef, useState } from "react";
import addressXsd from "./fixture/complex/address.xsd?raw";
import commonXsd from "./fixture/complex/common-types.xsd?raw";
import complexMainXsd from "./fixture/complex/main.xsd?raw";
import signatureXsd from "./fixture/complex/signature.xsd?raw";
import mainXsd from "./fixture/simple/main.xsd?raw";

// oxlint-disable-next-line max-lines-per-function
export function XmlValidation() {
  const [xml, setXml] = useState("");

  const config = useMemo(
    () =>
      ({
        dependenciesXsdById: {
          "address.xsd": addressXsd,
          "common-types.xsd": commonXsd,
          "https://www.w3.org/TR/xmldsig-core/xmldsig-core-schema.xsd": signatureXsd,
        },
        mainXsdById: { complex: complexMainXsd, simple: mainXsd },
        xmlRootNodeToMainXsdId: {
          contact: "complex",
          note: "simple",
        },
      }) satisfies SchemaConfig,
    [],
  );

  const { state, validate, isReady } = useXmlValidator(config);

  // Debounced validation on input change
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const handleChange = useCallback(
    (value: string) => {
      setXml(value);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (value.trim().length > 0) validate(value);
      }, nbSecond);
    },
    [validate],
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">XML Validator</h1>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <StatusBadge state={state} isReady={isReady} />
        {state.status === "success" && state.schemaId && (
          <span className="text-sm text-gray-500">Detected schema: {state.schemaId}</span>
        )}
      </div>

      {/* XML input */}
      <textarea
        className="h-80 w-full rounded border p-3 font-mono text-sm"
        placeholder="Paste your XML here..."
        value={xml}
        onChange={event => handleChange(event.target.value)}
        disabled={!isReady}
      />

      {/* Error list */}
      {state.status === "success" && !state.valid && (
        <div className="rounded border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 font-semibold text-red-800">
            {state.errors.length} validation error{state.errors.length > 1 ? "s" : ""}
          </h2>
          <ul className="flex flex-col gap-1">
            {state.errors.map((err, index) => (
              <li key={index} className="text-sm text-red-700">
                <span className="font-mono text-red-500">Line {err.line}</span>
                {" — "}
                {err.message.trim()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Valid state */}
      {state.status === "success" && state.valid && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">XML is valid.</p>
        </div>
      )}

      {/* Worker/schema error */}
      {state.status === "error" && (
        <div className="rounded border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-orange-800">{state.message}</p>
        </div>
      )}
    </div>
  );
}

// oxlint-disable-next-line react/no-multi-comp
function StatusBadge({ state, isReady }: { state: ValidationState; isReady: boolean }) {
  if (!isReady) return <span className="rounded bg-gray-200 px-2 py-1 text-xs">Loading schemas...</span>;

  if (state.status === "validating")
    return <span className="rounded bg-blue-200 px-2 py-1 text-xs">Validating...</span>;

  if (state.status === "success" && state.valid)
    return <span className="rounded bg-green-200 px-2 py-1 text-xs">Valid</span>;

  if (state.status === "success" && !state.valid)
    return <span className="rounded bg-red-200 px-2 py-1 text-xs">Invalid</span>;

  if (state.status === "error") return <span className="rounded bg-orange-200 px-2 py-1 text-xs">Error</span>;

  return <span className="rounded bg-gray-200 px-2 py-1 text-xs">Ready</span>;
}
