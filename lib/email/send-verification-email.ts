import nodemailer from "nodemailer";
import { getPublicSiteOrigin } from "@/lib/site-url";

type SendVerificationInput = {
  to: string;
  verificationUrl: string;
};

export async function sendVerificationEmail(
  input: SendVerificationInput,
): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.INVITE_FROM_EMAIL;

  if (!host || !port || !user || !pass || !from) {
    return {
      sent: false,
      reason:
        "Email provider is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and INVITE_FROM_EMAIL.",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const siteOrigin = getPublicSiteOrigin();
  const logoUrl = `${siteOrigin}/logo.svg`;

  const html = `
    <div style="margin:0;background:#f3f4f6;padding:24px 12px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;font-family:Inter,Arial,sans-serif;color:#111827;">
        <div style="padding:18px 22px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:10px;">
          <img src="${logoUrl}" alt="ShareMates" width="28" height="28" style="display:block;border-radius:8px;" />
          <span style="font-size:16px;font-weight:700;">ShareMates</span>
        </div>
        <div style="padding:24px 22px;">
          <p style="margin:0 0 10px;font-size:13px;color:#0f766e;font-weight:600;letter-spacing:0.3px;">EMAIL VERIFICATION</p>
          <h2 style="margin:0 0 12px;font-size:24px;line-height:1.3;">Confirm your email</h2>
          <p style="margin:0 0 18px;color:#374151;line-height:1.6;">
            Click below to verify your ShareMates account.
          </p>
          <p style="margin:0 0 18px;">
            <a href="${input.verificationUrl}" style="background:#0f766e;color:#ffffff;padding:12px 16px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:600;">
              Verify email
            </a>
          </p>
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;word-break:break-all;">
            If the button does not work, copy this link:<br />
            ${input.verificationUrl}
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject: "Verify your ShareMates account",
      html,
      text: `Verify your ShareMates account: ${input.verificationUrl}`,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
