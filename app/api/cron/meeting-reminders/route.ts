import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { bookingHtml, sendAdminNotification, sendClientNotification } from "@/lib/email";
import { displayDate } from "@/lib/dates";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ sent: 0, skipped: "Database is not configured." });

  const now = new Date();
  const windowStart = new Date(now.getTime() - 5 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 15 * 60 * 1000);
  const meetings = await prisma.booking.findMany({
    where: {
      type: { in: ["GOOGLE_MEETING", "COMPANY_MEETING"] },
      status: { in: ["PENDING", "APPROVED"] },
      startTime: { gte: windowStart, lte: windowEnd },
    },
    include: { client: true },
    orderBy: { startTime: "asc" },
    take: 25,
  });

  let sent = 0;
  for (const meeting of meetings) {
    const existingReminder = await prisma.notification.findFirst({
      where: { type: "meeting_reminder", bookingId: meeting.id },
      select: { id: true },
    });
    if (existingReminder) continue;

    const title = `Meeting reminder: ${meeting.client.fullName}`;
    const linkHtml = meeting.meetingLink ? `<p>Google Meet: <a href="${meeting.meetingLink}" style="color:#0B7CFF">${meeting.meetingLink}</a></p>` : "";
    const body = bookingHtml(`<p><strong>${meeting.client.fullName}</strong> has a meeting at <strong>${displayDate(meeting.startTime)}</strong>.</p>${linkHtml}<p>Service: ${meeting.serviceType || "Meeting"}</p>`);

    try {
      await prisma.notification.create({
        data: {
          type: "meeting_reminder",
          title,
          message: `${meeting.client.fullName} meeting starts at ${displayDate(meeting.startTime)}.`,
          clientId: meeting.clientId,
          bookingId: meeting.id,
        },
      });
      await sendAdminNotification(title, body);
      await sendClientNotification(meeting.client.email, "Meeting Reminder - True Level Production", body);
      sent += 1;
    } catch (error) {
      console.error("Meeting reminder failed", error instanceof Error ? error.message : "Unknown error");
    }
  }

  return NextResponse.json({ sent });
}
