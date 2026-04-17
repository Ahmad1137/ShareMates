import nodemailer from "nodemailer";

type SendInviteInput = {
  to: string;
  groupName: string;
  inviteUrl: string;
};

export async function sendInviteEmail(input: SendInviteInput): Promise<{
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
  const subject = `You're invited to join ${input.groupName} on ShareMates`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">You've been invited to ShareMates</h2>
      <p style="margin: 0 0 12px;">
        Someone invited you to join the group <strong>${escapeHtml(input.groupName)}</strong>.
      </p>
      <p style="margin: 0 0 16px;">
        Click below to accept the invitation:
      </p>
      <p style="margin: 0 0 20px;">
        <a href="${input.inviteUrl}" style="background:#111827;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;display:inline-block;">
          Accept invitation
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">
        If you don't have an account yet, sign up first with this same email, then open the invite link again.
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        If the button does not work, copy and paste this link:<br />
        ${input.inviteUrl}
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: input.to,
      subject,
      html,
      text:
        `You've been invited to join ${input.groupName} on ShareMates.\n\n` +
        `Accept invitation: ${input.inviteUrl}\n\n` +
        `If you don't have an account yet, sign up first with this same email, then open the invite link again.`,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
