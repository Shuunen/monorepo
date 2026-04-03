import { field, section, step } from "@monorepo/components";
import { z } from "zod";

const appwriteIdPattern = /^[\w-]{20,100}$/u;

const settingsSchema = step(
  z.object({
    description: section({
      description: "Don't worry, they are only stored in your browser and never sent to any server.",
      subtitle: "Stuff-Finder needs your Appwrite credentials to access your data.",
    }),
    bucketId: field(z.string().regex(appwriteIdPattern, "Appwrite storage bucket id is invalid"), {
      label: "Appwrite storage bucket id",
    }),
    collectionId: field(z.string().regex(appwriteIdPattern, "Appwrite collection id is invalid"), {
      label: "Appwrite collection id",
    }),
    databaseId: field(z.string().regex(appwriteIdPattern, "Appwrite database id is invalid"), {
      label: "Appwrite database id",
    }),
  }),
);

export const settingsSchemas = [settingsSchema];

export type SettingsFormData = z.infer<typeof settingsSchema>;
