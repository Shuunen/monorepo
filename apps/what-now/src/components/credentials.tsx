import { Button } from "@monorepo/components";
import { on, readClipboard } from "@monorepo/utils";
// oxlint-disable-next-line no-restricted-imports
import { ExternalLinkIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { parseClipboard, validateCredentials } from "../utils/credentials.utils";
import { logger } from "../utils/logger.utils";
import { type CredentialField, state } from "../utils/state.utils";

const fields = [
  {
    href: "https://github.com/Shuunen/monorepo/blob/master/apps/what-now/src/bin/couchdb.env.exemple",
    label: "Couch URL",
    link: "example",
    maxlength: 300,
    name: "couchUrl",
    pattern: "^https?://.+$",
  },
  {
    href: "https://github.com/Shuunen/monorepo/blob/master/apps/what-now/src/bin/couchdb.env.exemple",
    label: "Couch User",
    link: "example",
    maxlength: 120,
    name: "couchUser",
    pattern: "^.+$",
  },
  {
    href: "https://github.com/Shuunen/monorepo/blob/master/apps/what-now/src/bin/couchdb.env.exemple",
    label: "Couch Pass",
    link: "example",
    maxlength: 150,
    name: "couchPass",
    pattern: "^.+$",
  },
  {
    href: "https://github.com/Shuunen/monorepo/blob/master/apps/what-now/src/bin/couchdb.env.exemple",
    label: "Couch DB",
    link: "example",
    maxlength: 120,
    name: "couchDb",
    pattern: "^[\\w-]+$",
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
  couchDb: string;
  couchPass: string;
  couchUrl: string;
  couchUser: string;
  webhook: string;
};

type CredentialsFormProps = {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  onSubmit: (event: React.SyntheticEvent) => void;
};

function CredentialsForm({ formData, onInputChange, onSubmit }: CredentialsFormProps) {
  return (
    <form onSubmit={onSubmit}>
      {fields.map(field => {
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
              onChange={event => onInputChange(field.name, event.target.value)}
              pattern={field.pattern}
              type="text"
              value={formData[field.name]}
            />
          </div>
        );
      })}
      <div className="flex justify-center gap-4">
        <Button name="save-credentials" type="submit">
          Save Settings
        </Button>
      </div>
    </form>
  );
}

function useCredentialsLogic() {
  const [formData, setFormData] = useState<FormData>({
    couchDb: state.couchDb,
    couchPass: state.couchPass,
    couchUrl: state.couchUrl,
    couchUser: state.couchUser,
    webhook: state.webhook,
  });

  const fillForm = useCallback((data: Readonly<Record<CredentialField, string>>) => {
    logger.info("credentials, fill form", data);
    setFormData({
      couchDb: data.couchDb,
      couchPass: data.couchPass,
      couchUrl: data.couchUrl,
      couchUser: data.couchUser,
      webhook: data.webhook,
    });
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(previous => ({ ...previous, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      const { couchDb, couchPass, couchUrl, couchUser, webhook } = formData;
      const isOk = validateCredentials(couchUrl, couchUser, couchPass, couchDb, webhook);
      state.statusError = isOk ? "" : "Invalid settings";
      if (!isOk) return;
      logger.info("settings submitted", { couchDb, couchPass, couchUrl, couchUser, webhook });
      state.couchDb = couchDb;
      state.couchPass = couchPass;
      state.couchUrl = couchUrl;
      state.couchUser = couchUser;
      state.webhook = webhook;
      state.isSetup = true;
      globalThis.location.href = "/";
    },
    [formData],
  );

  return { fillForm, formData, handleInputChange, handleSubmit };
}

// oxlint-disable-next-line react/no-multi-comp
export function Credentials() {
  const { fillForm, formData, handleInputChange, handleSubmit } = useCredentialsLogic();

  const handleFocus = useCallback(async () => {
    if (state.isSetup) return;
    const read = await readClipboard();
    if (!read.ok) return logger.error("failed to read clipboard", read.error);
    logger.info("clipboard contains :", read.value);
    const data = parseClipboard(read.value);
    if (data.ok && data.value.couchUrl) fillForm(data.value);
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
