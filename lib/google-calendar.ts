import { calendar_v3, auth } from "@googleapis/calendar";

export function hasGoogleConfig() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) && Boolean(process.env.GOOGLE_PRIVATE_KEY);
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
    const jwt = new auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = new calendar_v3.Calendar({ auth: jwt });
    const res = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID || "primary",
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
    return res.data.hangoutLink || null;
  } catch {
    return null;
  }
}
