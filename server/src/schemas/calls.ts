import { z } from 'zod';

export const callSchema = z.object({ targetUserId: z.uuid() });

export type CallTarget = z.infer<typeof callSchema>;
