import { connect } from 'node:http2';
import jwt from 'jsonwebtoken';
import config from '../config';
import type { CallNotificationPayload } from '../../../shared/types/calls';
import type { ObjectValues } from '../../../shared/types/core';

export const VOIP_PUSH_TYPE = {
  INCOMING_CALL: 'incoming_call',
  CALL_DECLINED: 'call_declined',
  CALL_CANCELLED: 'call_cancelled',
} as const;

export type VoipPushType = ObjectValues<typeof VOIP_PUSH_TYPE>;

const APNS_JWT_TTL_MS = 50 * 60 * 1000;
const APNS_HOST = config.isProduction ? 'api.push.apple.com' : 'api.sandbox.push.apple.com';

let cachedJwt: { token: string; expiresAt: number } | null = null;

function getApnsJwt(): string {
  if (!config.apns.enabled) {
    throw new Error('APNs is disabled');
  }

  const now = Date.now();
  if (cachedJwt && cachedJwt.expiresAt > now) return cachedJwt.token;

  const privateKey = config.apns.privateKey.replace(/\\n/g, '\n');
  const token = jwt.sign({ iss: config.apns.teamId }, privateKey, {
    algorithm: 'ES256',
    header: { alg: 'ES256', kid: config.apns.keyId },
  });

  cachedJwt = { token, expiresAt: now + APNS_JWT_TTL_MS };
  return token;
}

export function sendVoipPush(
  voipToken: string,
  type: VoipPushType,
  payload: CallNotificationPayload | { callId: string }
): Promise<void> {
  if (!config.apns.enabled) return Promise.resolve();

  const topic = `${config.apns.bundleId}.voip`;
  const authorization = `bearer ${getApnsJwt()}`;
  const body = JSON.stringify({ type, ...payload });

  return new Promise((resolve, reject) => {
    const client = connect(`https://${APNS_HOST}`);
    let settled = false;

    const succeed = () => {
      if (settled) return;
      settled = true;
      client.close();
      resolve();
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      client.close();
      reject(error);
    };

    client.on('error', fail);

    const request = client.request({
      ':method': 'POST',
      ':path': `/3/device/${voipToken}`,
      authorization,
      'apns-topic': topic,
      'apns-push-type': 'voip',
      'apns-priority': '10',
      'apns-expiration': '0',
      'content-type': 'application/json',
    });

    let status = 0;
    let responseBody = '';

    request.on('response', (headers) => {
      status = Number(headers[':status']);
    });
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      responseBody += chunk;
    });
    request.on('error', fail);
    request.on('end', () => {
      if (status === 200) {
        succeed();
        return;
      }
      fail(new Error(`APNs rejected VoIP push (${status}): ${responseBody}`));
    });

    request.end(body);
  });
}
