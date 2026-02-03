import { Button } from "@monorepo/components";
import { nbFirst, nbSecond, on, readClipboard } from "@monorepo/utils";
// oxlint-disable-next-line no-restricted-imports
import { ExternalLinkIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { parseClipboard, validateCredentials } from "../utils/credentials.utils";
import { logger } from "../utils/logger.utils";
import { type CredentialField, state } from "../utils/state.utils";

const fields = [
  {
    href: "https://cloud.appwrite.io/",
    label: "AppWrite database id",
    link: "dashboard",
    maxlength: 100,
    name: "appwrite-database-id",
    pattern: String.raw`^\w+$`,
  },
  {
    href: "https://cloud.appwrite.io/",
    label: "AppWrite collection id",
    link: "dashboard",
    maxlength: 100,
    name: "appwrite-collection-id",
    pattern: String.raw`^\w+$`,
  },
  {
    href: "https://github.com/Shuunen/monorepo/blob/master/apps/what-now/docs/webhook.md",
    label: "Webhook",
    link: "webhook",
    maxlength: 150,
    name: "webhook",
    pattern: "^https?://.+$",
  },
] as const;

type FormData = {
  apiCollection: string;
  apiDatabase: string;
  webhook: string;
};

function getFieldValue(index: number, formData: FormData): string {
  if (index === nbFirst) return formData.apiDatabase;
  if (index === nbSecond) return formData.apiCollection;
  return formData.webhook;
}

function getFieldKey(index: number): keyof FormData {
  if (index === nbFirst) return "apiDatabase";
  if (index === nbSecond) return "apiCollection";
  return "webhook";
}

type CredentialsFormProps = {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

function CredentialsForm({ formData, onInputChange, onSubmit }: CredentialsFormProps) {
  return (
    <form onSubmit={onSubmit}>
      {fields.map((field, index) => {
        const inputId = `input-${field.name}`;
        return (
          <div className="mb-5" key={field.name}>
            <label className="mb-1 flex gap-2 text-sm font-medium" htmlFor={inputId}>
              {field.label}
              <a className="flex items-center" href={field.href} rel="noopener noreferrer" target="_blank">
                {field.link}
                <ExternalLinkIcon className="ml-1 size-4" />
              </a>
            </label>
            <input
              className="w-full rounded-md border border-accent/50 px-3 py-2 focus:ring-2 focus:outline-none"
              id={inputId}
              maxLength={field.maxlength}
              name={field.name}
              onChange={event => {
                const fieldKey = getFieldKey(index);
                onInputChange(fieldKey, event.target.value);
              }}
              pattern={field.pattern}
              type="text"
              value={getFieldValue(index, formData)}
            />
          </div>
        );
      })}

      <div className="flex justify-center gap-4">
        <Button name="save-credentials" type="submit">
          Save Credentials
        </Button>
      </div>
    </form>
  );
}

function useCredentialsLogic() {
  const [formData, setFormData] = useState<FormData>({
    apiCollection: state.apiCollection,
    apiDatabase: state.apiDatabase,
    webhook: state.webhook,
  });

  const fillForm = useCallback((data: Readonly<Record<CredentialField, string>>) => {
    logger.info("credentials, fill form", data);
    setFormData({
      apiCollection: data.apiCollection || "",
      apiDatabase: data.apiDatabase || "",
      webhook: data.webhook || "",
    });
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(previous => ({ ...previous, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const { apiCollection, apiDatabase, webhook } = formData;
      const isOk = validateCredentials(apiDatabase, apiCollection);
      state.statusError = isOk ? "" : "Invalid credentials";
      if (!isOk) return;
      logger.info("credentials submitted", { apiCollection, apiDatabase, webhook });
      state.apiDatabase = apiDatabase;
      state.apiCollection = apiCollection;
      state.webhook = webhook;
      state.isSetup = true;
      // navigate to home to see the tasks
      globalThis.location.href = "/";
    },
    [formData],
  );

  return { fillForm, formData, handleInputChange, handleSubmit };
}

export function Credentials() {
  const { fillForm, formData, handleInputChange, handleSubmit } = useCredentialsLogic();

  const handleFocus = useCallback(async () => {
    if (state.isSetup) return;
    const result = await readClipboard();
    if (!result.ok) return logger.error("failed to read clipboard", result.error);
    logger.info("clipboard contains :", result.value);
    const data = parseClipboard(result.value);
    if (data.apiCollection) fillForm(data);
  }, [fillForm]);

  useEffect(() => {
    on("focus", handleFocus);
  }, [handleFocus]);

  return (
    <div data-testid="credentials">
      <CredentialsForm formData={formData} onInputChange={handleInputChange} onSubmit={handleSubmit} />
    </div>
  );
}
