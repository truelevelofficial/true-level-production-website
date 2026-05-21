import { calendar_v3, auth } from "@googleapis/calendar";

export function getGoogleCalendarConfigStatus() {
  const missing = [
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL],
    ["GOOGLE_PRIVATE_KEY", process.env.GOOGLE_PRIVATE_KEY],
    ["CALENDAR_ID_OR_ADMIN_EMAIL", process.env.CALENDAR_ID || process.env.ADMIN_EMAIL],
  ].filter(([, value]) => !value).map(([key]) => key);
  return { configured: missing.length === 0, missing };
}

export function hasGoogleConfig() {
  return getGoogleCalendarConfigStatus().configured;
}

function logCalendarFailure(action: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Google Calendar ${action} failed`, { message });
}

function getPrivateKey() {
  const trimmed = (process.env.GOOGLE_PRIVATE_KEY || "").trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as { private_key?: string };
      if (parsed.private_key) return parsed.private_key.replace(/\\n/g, "\n");
    } catch {
      return trimmed;
    }
  }

  const unquoted = ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) ? trimmed.slice(1, -1) : trimmed;
  return unquoted.replace(/\\n/g, "\n");
}

function getJwt() {
  return new auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function getCalendar() {
  return new calendar_v3.Calendar({ auth: getJwt() });
}

function getCalendarId() {
  return process.env.CALENDAR_ID || process.env.ADMIN_EMAIL!;
}

export async function createCalendarEventWithMeet(params: {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail?: string;
}) {
  if (!hasGoogleConfig()) return null;
  try {
    const calendar = getCalendar();
    const res = await calendar.events.insert({
      calendarId: getCalendarId(),
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.startTime.toISOString(), timeZone: "Africa/Cairo" },
        end: { dateTime: params.endTime.toISOString(), timeZone: "Africa/Cairo" },
        conferenceData: { createRequest: { requestId: `tl-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
      },
      conferenceDataVersion: 1,
    });
    return { hangoutLink: res.data.hangoutLink || null, eventId: res.data.id || null };
  } catch (error) {
    logCalendarFailure("create event", error);
    return null;
  }
}

export async function updateCalendarEvent(params: {
  eventId: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail?: string;
}) {
  if (!hasGoogleConfig()) return false;
  try {
    const calendar = getCalendar();
    await calendar.events.update({
      calendarId: getCalendarId(),
      eventId: params.eventId,
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: { dateTime: params.startTime.toISOString(), timeZone: "Africa/Cairo" },
        end: { dateTime: params.endTime.toISOString(), timeZone: "Africa/Cairo" },
      },
    });
    return true;
  } catch (error) {
    logCalendarFailure("update event", error);
    return false;
  }
}

export async function cancelCalendarEvent(eventId: string) {
  if (!hasGoogleConfig()) return false;
  try {
    const calendar = getCalendar();
    await calendar.events.update({
      calendarId: getCalendarId(),
      eventId,
      requestBody: { status: "cancelled" },
    });
    return true;
  } catch (error) {
    logCalendarFailure("cancel event", error);
    return false;
  }
}
