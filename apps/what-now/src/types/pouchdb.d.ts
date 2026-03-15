declare module "pouchdb" {
  export type AllDocsResult<TDocument> = {
    rows: Array<{ doc?: TDocument }>;
  };

  export type PutResult = {
    id: string;
    ok: true;
    rev: string;
  };

  export type SyncOptions = {
    live?: boolean;
    retry?: boolean;
  };

  export type DatabaseOptions = {
    auth?: {
      password: string;
      username: string;
    };
  };

  export type SyncController<TDocument> = {
    on(event: "active" | "change" | "paused", callback: () => void): SyncController<TDocument>;
    on(event: "error", callback: (error: unknown) => void): SyncController<TDocument>;
  };

  export default class PouchDB<TDocument extends { _id: string; _rev?: string }> {
    constructor(name: string, options?: DatabaseOptions);
    allDocs(options: { include_docs: true }): Promise<AllDocsResult<TDocument>>;
    get(id: string): Promise<TDocument>;
    put(document: TDocument): Promise<PutResult>;
    sync(remoteDatabase: PouchDB<TDocument>, options?: SyncOptions): SyncController<TDocument>;
  }
}
