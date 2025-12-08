import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  android: {
    loggingBehavior: 'debug',
  },
  appId: 'shuunen.whatnow.app',
  appName: 'what-now',
  server: {
    androidScheme: 'http',
  },
  webDir: 'dist',
}

export default config
