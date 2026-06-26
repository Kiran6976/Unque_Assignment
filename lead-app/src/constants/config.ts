import { Platform } from 'react-native';

/**
 * Backend server URL (socket.io uses HTTP/HTTPS, not ws://).
 *
 * Android emulator: 10.0.2.2 maps to host machine's localhost
 * iOS simulator:    localhost works directly
 *
 * ⚡ Swap SERVER_URL to your ngrok URL when doing Meta testing:
 *    export const SERVER_URL = 'https://your-ngrok-url.ngrok-free.app';
 */
const LOCAL_SERVER_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

// Since you are testing, use your active ngrok URL so the physical device/emulator can connect properly
export const SERVER_URL = 'https://mariam-unequable-frumpily.ngrok-free.dev';


