import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailyascent.app',
  appName: '每日攀升',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher_round',
      iconColor: '#38bdf8'
    }
  }
};

export default config;
