import { FloatingMenu } from "@monorepo/components";
import { Credentials } from "../components/credentials";
import { useActions } from "../utils/pages.utils";

export function PageSettings() {
  const actions = useActions();
  return (
    <div className="flex grow flex-col items-center justify-center" data-testid="page-settings">
      <h1>Settings</h1>
      <Credentials />
      <FloatingMenu actions={actions} />
    </div>
  );
}
