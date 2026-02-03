import { Button } from "@monorepo/components";
import TuneIcon from "@mui/icons-material/Tune";
import { useCallback } from "react";
import { AppForm } from "../components/app-form";
import { AppPageCard } from "../components/app-page-card";
import { downloadItems } from "../utils/database.utils";
import { logger } from "../utils/logger.utils";
import { settingsForm } from "../utils/settings.utils";
import { state } from "../utils/state.utils";

export function PageSettings({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug("PageSettings", { properties });
  type Form = typeof settingsForm;
  const onSubmit = useCallback((form: Form) => {
    logger.debug("onSubmit", { form });
    state.credentials = {
      bucketId: form.fields.bucketId.value,
      collectionId: form.fields.collectionId.value,
      databaseId: form.fields.databaseId.value,
      wrap: "",
    };
    logger.showSuccess("credentials saved, reloading...", { credentials: state.credentials });
    document.location.reload();
  }, []);

  return (
    <AppPageCard cardTitle="Settings" icon={TuneIcon} pageCode="settings" pageTitle="Settings">
      <div className="flex flex-col">
        <p>
          Stuff-Finder need credentials to access your Airtable base, data will be saved in your browser local storage.
        </p>
        <AppForm initialForm={settingsForm} onSubmit={onSubmit}>
          <Button name="download" onClick={downloadItems} type="button" variant="secondary">
            Download items
          </Button>
        </AppForm>
      </div>
    </AppPageCard>
  );
}
