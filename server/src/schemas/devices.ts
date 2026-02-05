import { z } from 'zod';

export const registerDeviceSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  deviceName: z.string().max(100).optional(),
  fcmToken: z.string().optional(),
  voipPushToken: z.string().optional(),
});
