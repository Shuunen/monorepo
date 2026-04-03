import { AutoForm, Button } from "@monorepo/components";
import TuneIcon from "@mui/icons-material/Tune";
import { AppPageCard } from "../components/app-page-card";
import { downloadItems } from "../utils/database.utils";
import { logger } from "../utils/logger.utils";
import { state } from "../utils/state.utils";
import { settingsSchemas, type SettingsFormData } from "./page-settings.schemas";

export function PageSettings() {
  function onSubmit(formData: SettingsFormData) {
    state.credentials = {
      bucketId: formData.bucketId,
      collectionId: formData.collectionId,
      databaseId: formData.databaseId,
      wrap: "",
    };
    logger.showSuccess("credentials saved...");
    document.location.reload();
  }

  return (
    <AppPageCard cardTitle="Settings" icon={TuneIcon} pageCode="settings" pageTitle="Settings">
      <AutoForm initialData={state.credentials} onSubmit={onSubmit} schemas={settingsSchemas} />
      <Button className="absolute bottom-6" name="download" onClick={downloadItems} type="button" variant="secondary">
        Download items
      </Button>
    </AppPageCard>
  );
}
