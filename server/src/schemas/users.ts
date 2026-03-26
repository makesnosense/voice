import { z } from 'zod';

export const byEmailSchema = z.object({ email: z.email() });
