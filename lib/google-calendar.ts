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

function extractErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const gaxios = error as Record<string, unknown>;
    const parts: string[] = [];
    if (gaxios.message) parts.push(String(gaxios.message));
    if (gaxios.code) parts.push(`code=${gaxios.code}`);
    if (gaxios.status) parts.push(`status=${gaxios.status}`);
    if (gaxios.errors) parts.push(`errors=${JSON.stringify(gaxios.errors)}`);
    if (gaxios.response && typeof gaxios.response === "object") {
      const resp = gaxios.response as Record<string, unknown>;
      if (resp.data) parts.push(`responseData=${JSON.stringify(resp.data)}`);
    }
    return parts.join(" | ") || "Unknown error";
  }
  return String(error);
}

function logCalendarFailure(action: string, error: unknown) {
  const details = extractErrorDetails(error);
  console.error(`Google Calendar ${action} failed`, { details });
}

export type CalendarDiagnosticStep = {
  step: string;
  success: boolean;
  detail: string;
};

export async function diagnoseGoogleCalendar(): Promise<CalendarDiagnosticStep[]> {
  const results: CalendarDiagnosticStep[] = [];

  const config = getGoogleCalendarConfigStatus();
  if (!config.configured) {
    results.push({ step: "Environment variables", success: false, detail: `Missing: ${config.missing.join(", ")}` });
    return results;
  }
  results.push({ step: "Environment variables", success: true, detail: "All variables are set" });

  try {
    const jwt = getJwt();
    await jwt.authorize();
    results.push({ step: "JWT Authentication", success: true, detail: "Service account key is valid" });
  } catch (error) {
    results.push({ step: "JWT Authentication", success: false, detail: extractErrorDetails(error) });
    return results;
  }

  try {
    const calendar = getCalendar();
    const list = await calendar.calendarList.list();
    const target = list.data.items?.find(c => c.id === getCalendarId());
    if (target) {
      results.push({ step: "Calendar access", success: true, detail: `Found: "${target.summary}" (${target.id})` });
    } else {
      results.push({ step: "Calendar access", success: false, detail: `Calendar "${getCalendarId()}" not found. Share it with ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} with "Make changes to events" permission.` });
      return results;
    }
  } catch (error) {
    results.push({ step: "Calendar access", success: false, detail: extractErrorDetails(error) });
    return results;
  }

  try {
    const calendar = getCalendar();
    const now = new Date();
    const startTime = new Date(now.getTime() + 60000);
    const endTime = new Date(startTime.getTime() + 300000);
    const res = await calendar.events.insert({
      calendarId: getCalendarId(),
      requestBody: {
        summary: "TEST EVENT - please delete (auto-diagnostic)",
        description: "Auto-generated test for True Level diagnostics",
        start: { dateTime: startTime.toISOString(), timeZone: "Africa/Cairo" },
        end: { dateTime: endTime.toISOString(), timeZone: "Africa/Cairo" },
      },
    });
    const eventId = res.data.id;
    results.push({ step: "Basic event creation", success: true, detail: `Event created (${eventId})` });
    try { await calendar.events.delete({ calendarId: getCalendarId(), eventId: eventId! }); } catch { /* cleanup */ }
  } catch (error) {
    results.push({ step: "Basic event creation", success: false, detail: extractErrorDetails(error) });
    return results;
  }

  try {
    const calendar = getCalendar();
    const now = new Date();
    const startTime = new Date(now.getTime() + 120000);
    const endTime = new Date(startTime.getTime() + 300000);
    const res = await calendar.events.insert({
      calendarId: getCalendarId(),
      requestBody: {
        summary: "TEST MEET EVENT - please delete (auto-diagnostic)",
        description: "Auto-generated test with Meet for True Level diagnostics",
        start: { dateTime: startTime.toISOString(), timeZone: "Africa/Cairo" },
        end: { dateTime: endTime.toISOString(), timeZone: "Africa/Cairo" },
        conferenceData: { createRequest: { requestId: `diag-${Date.now()}` } },
      },
      conferenceDataVersion: 1,
    });
    const eventId = res.data.id;
    const hangoutLink = res.data.hangoutLink;
    results.push({ step: "Meet conference creation", success: true, detail: `Event created (${eventId}), hangoutLink: ${hangoutLink || "N/A"}` });
    try { await calendar.events.delete({ calendarId: getCalendarId(), eventId: eventId! }); } catch { /* cleanup */ }
  } catch (error) {
    results.push({ step: "Meet conference creation", success: false, detail: extractErrorDetails(error) });
  }

  return results;
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
        conferenceData: { createRequest: { requestId: `tl-${Date.now()}` } },
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
