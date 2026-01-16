/** biome-ignore-all lint/style/useNamingConvention: it'ok here */
export type CodeVersionLabel = Readonly<{
  Code: string;
  Version: string;
  label: string;
}>;

export type CodeVersion = Omit<CodeVersionLabel, "label">;
