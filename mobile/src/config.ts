import { Platform as RNPlatform } from 'react-native';
import { getServerConfigIos } from './native/server-config-ios';

// android reaches the dev server via `adb reverse tcp:3003 tcp:3003` (see
// package.json), so `localhost` on-device correctly tunnels to the mac.
// ios has no equivalent automatic forward for a physical device, so it
// needs the mac's actual lan ip — same one metro already uses for this phone.
// those hosts live in ServerConfigIos.swift; js reads the native constants.
export const DEV_HOST =
  RNPlatform.OS === 'ios' ? getServerConfigIos().devHost : 'localhost';

export const PROD_HOST =
  RNPlatform.OS === 'ios' ? getServerConfigIos().prodHost : 'voice.k.vu';

export const BASE_URL = __DEV__
  ? `https://${DEV_HOST}:3003`
  : `https://${PROD_HOST}`;

export const WEB_URL = __DEV__
  ? `https://${DEV_HOST}:5173`
  : `https://${PROD_HOST}`;

export const TURN_PORT = '3478';

export const TURN_SERVER_CONFIG = {
  credentialsUrl: `${BASE_URL}/api/turn-credentials`,
  host: PROD_HOST,
  port: TURN_PORT,
};

export const HEALTH_URL = `${BASE_URL}/health`;

export const PRIVACY_POLICY_URL = `https://${PROD_HOST}/privacy`;
