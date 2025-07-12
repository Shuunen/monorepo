import 'preact'

declare module '@camwiegert/typical'

declare module 'preact' {
  // biome-ignore lint/style/useNamingConvention: don't have the choice
  namespace JSX {
    interface IntrinsicElements {
      'app-form': unknown
      'app-modal': unknown
    }
  }
}
