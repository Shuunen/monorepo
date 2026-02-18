interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly VITE_DEV_SUBDOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
