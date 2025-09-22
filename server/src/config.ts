const config = {
  nodeEnvironment: process.env.NODE_ENVIRONMENT,
  port: parseInt(process.env.PORT ?? '3001', 10),
  host: process.env.HOST ?? 'localhost',
  ssl: {
    keyPath: process.env.SSL_KEY_PATH ?? '../certs/key.pem',
    certPath: process.env.SSL_CERT_PATH ?? '../certs/cert.pem'
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim())
      ?? ['https://localhost:5173']
  }
};

console.log('🔧 Server configuration:');
console.log(`   Environment: ${config.nodeEnvironment}`);
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   SSL Key: ${config.ssl.keyPath}`);
console.log(`   SSL Cert: ${config.ssl.certPath}`);
console.log(`   CORS Origins: ${config.cors.origins.join(', ')}`);


export default config;