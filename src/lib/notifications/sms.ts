import twilio from "twilio";
import {
  buildConfirmationSms,
  buildReminderSms,
} from "./templates";
import type { Booking } from "../types";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendConfirmationSms(booking: Booking): Promise<boolean> {
  const message = buildConfirmationSms(booking);
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !from) {
    console.log("[sms:confirmation]", { to: booking.customerPhone, message });
    return true;
  }

  try {
    await client.messages.create({
      body: message,
      from,
      to: normalizePhone(booking.customerPhone),
    });
    return true;
  } catch (error) {
    console.error("[sms:confirmation:error]", error);
    return false;
  }
}

export async function sendReminderSms(booking: Booking): Promise<boolean> {
  const message = buildReminderSms(booking);
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !from) {
    console.log("[sms:reminder]", { to: booking.customerPhone, message });
    return true;
  }

  try {
    await client.messages.create({
      body: message,
      from,
      to: normalizePhone(booking.customerPhone),
    });
    return true;
  } catch (error) {
    console.error("[sms:reminder:error]", error);
    return false;
  }
}
