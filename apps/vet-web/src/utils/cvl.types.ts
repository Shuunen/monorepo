export type CodeVersionLabel = Readonly<{
  Code: string;
  Version: string;
  label: string;
}>;

export type CodeVersion = Omit<CodeVersionLabel, "label">;
