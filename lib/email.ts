import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!client && process.env.RESEND_API_KEY) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export function hasEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.ADMIN_NOTIFY_EMAIL);
}

const from = "True Level Production <noreply@true-level.org>";

export async function sendAdminNotification(subject: string, html: string) {
  const c = getClient();
  if (!c || !process.env.ADMIN_NOTIFY_EMAIL) return;
  await c.emails.send({ from, to: [process.env.ADMIN_NOTIFY_EMAIL], subject, html });
}

export async function sendClientNotification(to: string, subject: string, html: string) {
  const c = getClient();
  if (!c) return;
  await c.emails.send({ from, to: [to], subject, html });
}

export function bookingHtml(text: string) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f8fb"><div style="background:#0B7CFF;padding:20px;border-radius:16px;text-align:center"><h1 style="color:#fff;margin:0;font-size:24px">True Level Production</h1></div><div style="background:#fff;padding:24px;border-radius:16px;margin-top:16px"><p style="font-size:16px;line-height:1.6;color:#333">${text}</p></div></div>`;
}
