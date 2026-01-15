import { z } from 'zod';

export const requestOtpSchema = z.object({
  email: z.email(),
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
