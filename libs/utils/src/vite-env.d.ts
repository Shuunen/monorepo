interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly DEV_SUBDOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
