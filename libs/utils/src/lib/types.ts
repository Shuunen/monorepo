type NavigatorUserAgentBrandVersion = {
  readonly brand: string;
  readonly version: string;
};

type UserAgentDataValues = {
  readonly architecture?: string;
  readonly bitness?: string;
  readonly brands?: NavigatorUserAgentBrandVersion[];
  readonly mobile?: boolean;
  readonly model?: string;
  readonly platform?: string;
  readonly platformVersion?: string;
  readonly uaFullVersion?: string;
};

type UserAgentLowEntropyJson = {
  readonly brands: NavigatorUserAgentBrandVersion[];
  readonly mobile: boolean;
  readonly platform: string;
};

type NavigatorUserAgentData = {
  getHighEntropyValues: (hints: readonly string[]) => Promise<UserAgentDataValues>;
  // biome-ignore lint/style/useNamingConvention: can't change this
  toJSON: () => UserAgentLowEntropyJson;
} & UserAgentLowEntropyJson;

// below types from https://github.com/lukewarlow/user-agent-data-types/blob/master/index.d.ts
export declare type NavigatorUserAgent = {
  readonly userAgentData?: NavigatorUserAgentData;
};

export type NavigatorExtract = {
  language: string;
  platform: string;
  userAgent: string;
};

export type RecursivePartial<Type> = {
  [Key in keyof Type]?: Type[Key] extends (infer Under)[]
    ? RecursivePartial<Under>[]
    : Type[Key] extends Record<string, unknown>
      ? RecursivePartial<Type[Key]>
      : Type[Key];
};

export type PackageJson = {
  description: string;
  name: string;
  version: string;
};

export type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

// source : https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
// oxlint-disable-next-line ban-types
export type Simplify<Input> = { [KeyType in keyof Input]: Input[KeyType] } & {}; // NOSONAR
