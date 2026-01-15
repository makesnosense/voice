import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await resend.emails.send({
    from: 'Voice <onboarding@resend.dev>',
    to: email,
    subject: 'Your Voice verification code',
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
}
