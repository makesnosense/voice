import { z } from 'zod';

export const callSchema = z.object({ targetUserId: z.uuid() });

export type CallTarget = z.infer<typeof callSchema>;

export const declineCallSchema = z
  .object({
    callId: z.uuid(),
    declinerFcmToken: z.string().min(1).optional(),
    declinerVoipToken: z.string().min(1).optional(),
  })
  .refine(
    (data) => Number(Boolean(data.declinerFcmToken)) + Number(Boolean(data.declinerVoipToken)) === 1
  );
