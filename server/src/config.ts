const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};


const nodeEnv = getRequiredEnv('NODE_ENVIRONMENT');
const port = parseInt(getRequiredEnv('SERVER_PORT'), 10);
const host = getRequiredEnv('SERVER_HOST');
const corsOrigins = getRequiredEnv('CORS_ORIGINS')
  .split(',')
  .map(origin => origin.trim());

const isProduction = nodeEnv === 'production';

const config = {
  nodeEnvironment: nodeEnv,
  port,
  host,
  corsOrigins,
  isProduction,
  ssl: {
    keyPath: isProduction ? '' : getRequiredEnv('SSL_KEY_PATH'),
    certPath: isProduction ? '' : getRequiredEnv('SSL_CERT_PATH')
  }
};


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


export default config;