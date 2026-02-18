import { z } from 'zod';

export const callSchema = z.object({
  targetEmail: z.email(),
});
