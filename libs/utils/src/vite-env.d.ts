interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly VITE_DEV_SUBDOMAIN?: string;
  readonly VITE_DEV_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
