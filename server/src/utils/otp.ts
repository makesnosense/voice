import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await resend.emails.send({
    from: 'Voice <verify@odnokreslo.ru>',
    to: email,
    subject: 'Your Voice verification code',
    html: `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f0f0;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 40px 20px">
          <table width="600" cellpadding="0" cellspacing="0" border="0">
            <!-- logo header -->
            <tr>
              <td align="center" style="padding-bottom: 30px">
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="background: #fff; border: 1px solid #dae0e8; border-radius: 16px"
                >
                  <tr>
                    <td style="padding: 19px 26px">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <!-- waves -->
                            <table
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                              style="display: inline-block; vertical-align: middle"
                            >
                              <tr>
                                <td style="padding: 0 1px">
                                  <div
                                    style="
                                      width: 3px;
                                      height: 8px;
                                      background: #1e293b;
                                      border-radius: 2px;
                                    "
                                  ></div>
                                </td>
                                <td style="padding: 0 1px">
                                  <div
                                    style="
                                      width: 3px;
                                      height: 16px;
                                      background: #1e293b;
                                      border-radius: 2px;
                                    "
                                  ></div>
                                </td>
                                <td style="padding: 0 1px">
                                  <div
                                    style="
                                      width: 3px;
                                      height: 12px;
                                      background: #1e293b;
                                      border-radius: 2px;
                                    "
                                  ></div>
                                </td>
                                <td style="padding: 0 1px">
                                  <div
                                    style="
                                      width: 3px;
                                      height: 20px;
                                      background: #1e293b;
                                      border-radius: 2px;
                                    "
                                  ></div>
                                </td>
                                <td style="padding: 0 1px">
                                  <div
                                    style="
                                      width: 3px;
                                      height: 6px;
                                      background: #1e293b;
                                      border-radius: 2px;
                                    "
                                  ></div>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="padding-left: 12px">
                            <!-- voice text -->
                            <span
                              style="
                                font-size: 20px;
                                font-weight: 600;
                                letter-spacing: -0.025em;
                                color: #1e293b;
                                white-space: nowrap;
                              "
                              >Voice</span
                            >
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- code section -->
            <tr>
              <td
                style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center"
              >
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px">
                  Your verification code is:
                </p>
                <div
                  style="
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 8px;
                    color: #2c3e50;
                    margin: 16px 0;
                  "
                >
                  ${code}
                </div>
                <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px">
                  This code expires in 10 minutes.
                </p>
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td style="padding-top: 24px; text-align: center">
                <p style="margin: 0; color: #64748b; font-size: 12px">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });
}
