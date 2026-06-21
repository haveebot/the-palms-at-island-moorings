import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "./site";

/**
 * Shared email transport — Google Workspace on thepalms.dev via SMTP
 * (smtp.gmail.com:465, app password on the sender mailbox). Gated entirely on
 * env: with no WORKSPACE_SENDER_EMAIL / WORKSPACE_SMTP_PASSWORD this is a no-op
 * and emailReady() is false. No third-party ESP, no borrowed creds.
 */
let cached: Transporter | null = null;

export function emailReady(): boolean {
  return Boolean(process.env.WORKSPACE_SENDER_EMAIL && process.env.WORKSPACE_SMTP_PASSWORD);
}

function transport(): Transporter | null {
  const user = process.env.WORKSPACE_SENDER_EMAIL;
  const pass = process.env.WORKSPACE_SMTP_PASSWORD;
  if (!user || !pass) return null;
  if (!cached) {
    cached = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      pool: true, // reuse connections for broadcast fan-out
      maxConnections: 5, // bound concurrency — stay friendly with Gmail
      maxMessages: 100,
      auth: { user, pass },
    });
  }
  return cached;
}

export async function sendMail(opts: {
  to?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}): Promise<void> {
  const t = transport();
  const from = process.env.WORKSPACE_SENDER_EMAIL;
  if (!t || !from) throw new Error("Workspace email not configured");
  const name = process.env.WORKSPACE_SENDER_NAME || SITE.name;
  await t.sendMail({
    from: `"${name}" <${from}>`,
    to: opts.to,
    bcc: opts.bcc,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
