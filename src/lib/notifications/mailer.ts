import { Resend } from "resend";
import nodemailer from "nodemailer";
import {
  isEmailConfigured,
  isSmtpConfigured,
  resolveEmailFrom,
  resolveEmailProvider,
  resolveResendApiKey,
  resolveSmtpConfig,
} from "./config";

export type SendEmailResult =
  | { ok: true; provider: "resend" | "smtp" }
  | { ok: false; error: string; provider: "resend" | "smtp" | "none" };

function getResendClient(): Resend | null {
  const key = resolveResendApiKey();
  if (!key) return null;
  return new Resend(key);
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, error: "Resend API key not configured", provider: "resend" };
  }

  const { error } = await resend.emails.send({
    from: resolveEmailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    return { ok: false, error: error.message, provider: "resend" };
  }

  return { ok: true, provider: "resend" };
}

async function sendViaSmtp(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  if (!isSmtpConfigured()) {
    return {
      ok: false,
      error: "SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)",
      provider: "smtp",
    };
  }

  const smtp = resolveSmtpConfig();
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  try {
    await transport.sendMail({
      from: resolveEmailFrom(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return { ok: true, provider: "smtp" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SMTP send failed";
    return { ok: false, error: message, provider: "smtp" };
  }
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return {
      ok: false,
      error: "No email provider configured (Resend or SMTP)",
      provider: "none",
    };
  }

  const provider = resolveEmailProvider();
  if (provider === "smtp") {
    return sendViaSmtp(input);
  }
  return sendViaResend(input);
}
