import nodemailer from "nodemailer";
import { getPublicSiteOrigin } from "@/lib/site-url";

type SendContactNotificationInput = {
  to: string;
  contactName: string;
  adderName: string;
};

export async function sendContactNotificationEmail(
  input: SendContactNotificationInput,
): Promise<{
  sent: boolean;
  reason?: string;
}> {
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

  const subject = `${input.adderName} added you as a contact on ShareMates`;
  const contactsUrl = `${getPublicSiteOrigin()}/contacts`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">You've been added as a contact</h2>
      <p style="margin: 0 0 12px;">
        <strong>${escapeHtml(input.adderName)}</strong> has added you as a contact on ShareMates for tracking IOUs and personal expenses.
      </p>
      <p style="margin: 0 0 16px;">
        You can now track shared expenses and balances with ${escapeHtml(input.adderName)}.
      </p>
      <p style="margin: 0 0 20px;">
        <a href="${contactsUrl}" style="background:#111827;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;display:inline-block;">
          View your contacts
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">
        If you haven't signed up for ShareMates yet, you can create an account to start tracking expenses with your contacts.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        This is an automated message from ShareMates. If you believe this was sent in error, you can ignore this email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
