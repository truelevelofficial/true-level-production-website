import { calendar_v3, auth } from "@googleapis/calendar";

export function hasGoogleConfig() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) && Boolean(process.env.GOOGLE_PRIVATE_KEY);
}

function getJwt() {
  return new auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

function getCalendar() {
  return new calendar_v3.Calendar({ auth: getJwt() });
}

function getCalendarId() {
  return process.env.CALENDAR_ID || "primary";
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
        attendees: params.attendeeEmail ? [{ email: params.attendeeEmail }] : [],
        conferenceData: { createRequest: { requestId: `tl-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
      },
      conferenceDataVersion: 1,
    });
    return { hangoutLink: res.data.hangoutLink || null, eventId: res.data.id || null };
  } catch (error) {
    console.error("Google Calendar create event failed", error instanceof Error ? error.message : "Unknown error");
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
        attendees: params.attendeeEmail ? [{ email: params.attendeeEmail }] : [],
      },
    });
    return true;
  } catch (error) {
    console.error("Google Calendar update event failed", error instanceof Error ? error.message : "Unknown error");
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
    console.error("Google Calendar cancel event failed", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}
