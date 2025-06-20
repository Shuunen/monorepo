/* eslint-disable @typescript-eslint/naming-convention */
import 'preact'

declare module '@camwiegert/typical'

declare module 'preact' {
  // biome-ignore lint/style/noNamespace: don't have the choice
  // biome-ignore lint/style/useNamingConvention: don't have the choice
  namespace JSX {
    interface IntrinsicElements {
      'app-form': unknown
      'app-modal': unknown
    }
  }
}
