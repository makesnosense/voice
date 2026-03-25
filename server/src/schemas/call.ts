import { z } from 'zod';

export const callSchema = z.union([
  z.object({ targetEmail: z.email() }),
  z.object({ targetUserId: z.uuid() }),
]);

export type CallTarget = z.infer<typeof callSchema>;
