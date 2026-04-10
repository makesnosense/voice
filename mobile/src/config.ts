export const DEV_HOST = 'localhost';
export const PROD_HOST = 'voice.k.vu';
export const HOST = __DEV__ ? DEV_HOST : PROD_HOST;

export const BASE_URL = __DEV__
  ? `https://${DEV_HOST}:3003`
  : `https://${PROD_HOST}`;

export const TURN_HOST = PROD_HOST;
export const TURN_PORT = '3478';
