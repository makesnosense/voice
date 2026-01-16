import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import fs from 'node:fs';
import config from './config';
import type { Application } from 'express';

export function createServer(app: Application) {
  return config.isProduction
    ? createHttpServer(app)
    : createHttpsServer(
        {
          key: fs.readFileSync(config.ssl.keyPath),
          cert: fs.readFileSync(config.ssl.certPath),
        },
        app
      );
}
