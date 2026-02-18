import type { Server } from 'http';
import type { Server as HttpsServer } from 'https';

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvBoolean = (key: string): boolean => {
  const value = process.env[key];

  if (value === undefined) {
    throw new Error(`missing environment variable: ${key}`);
  }

  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`${key} must be 'true' or 'false', got: ${value}`);
};

const nodeEnv = getRequiredEnv('NODE_ENVIRONMENT');
const port = parseInt(getRequiredEnv('SERVER_PORT'), 10);
const host = getRequiredEnv('SERVER_HOST');
const corsOrigins = getRequiredEnv('CORS_ORIGINS')
  .split(',')
  .map((origin) => origin.trim());
const rateLimitingEnabled = getEnvBoolean('RATE_LIMITING_ENABLED');

const isProduction = nodeEnv === 'production';

const config = {
  nodeEnvironment: nodeEnv,
  port,
  host,
  corsOrigins,
  isProduction,
  ssl: {
    keyPath: isProduction ? '' : getRequiredEnv('SSL_KEY_PATH'),
    certPath: isProduction ? '' : getRequiredEnv('SSL_CERT_PATH'),
  },
  turnSecret: getRequiredEnv('COTURN_SECRET'),
  rateLimiting: {
    enabled: rateLimitingEnabled,
    trustProxy: isProduction, // trust proxy headers in production
  },
  fcm: {
    projectId: getRequiredEnv('FCM_PROJECT_ID'),
    privateKey: getRequiredEnv('FCM_PRIVATE_KEY'),
    clientEmail: getRequiredEnv('FCM_CLIENT_EMAIL'),
  },
};

export function getProtocol(server: Server | HttpsServer): string {
  const isHttps = 'cert' in server && 'key' in server;
  return isHttps ? 'https' : 'http';
}

// logging
console.log('🔧 Server configuration:');
console.log(`   Environment: ${config.nodeEnvironment}`);
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
if (!config.isProduction && config.ssl) {
  console.log(`   SSL Key: ${config.ssl.keyPath}`);
  console.log(`   SSL Cert: ${config.ssl.certPath}`);
}
console.log(`   CORS Origins: ${config.corsOrigins.join(', ')}`);
console.log(`   Rate Limiting: ${config.rateLimiting.enabled ? 'enabled' : 'disabled'}`);

export default config;
