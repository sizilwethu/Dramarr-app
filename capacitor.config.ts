import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dramarr.app',
  appName: 'dramarr',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;