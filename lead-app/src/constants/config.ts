import { Platform } from 'react-native';

const LOCAL_SERVER_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export const SERVER_URL = 'https://mariam-unequable-frumpily.ngrok-free.dev';


