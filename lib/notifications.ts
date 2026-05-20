import { getPrisma } from "./prisma";
import { sendAdminNotification, sendClientNotification, bookingHtml } from "./email";

export async function notifyNewBooking(clientName: string, bookingType: string, clientEmail: string) {
  const prisma = getPrisma();
  try {
    if (prisma) {
    await prisma.notification.create({ data: { type: "new_booking", title: `New ${bookingType} booking`, message: `${clientName} submitted a ${bookingType} booking.` } });
    }
  } catch {
    // Notifications should never block a booking request.
  }
  try {
    await sendAdminNotification("New Booking Received", bookingHtml(`<p><strong>${clientName}</strong> submitted a <strong>${bookingType}</strong> booking.</p><p>Client email: ${clientEmail}</p><p><a href="https://production.true-level.org/admin/bookings" style="color:#0B7CFF">View in admin dashboard</a></p>`));
  } catch {
    // Email is optional and depends on Resend/domain configuration.
  }
}

export async function notifyBookingStatusChange(clientEmail: string, clientName: string, bookingType: string, status: string, meetingLink?: string) {
  const prisma = getPrisma();
  try {
    if (prisma) {
    await prisma.notification.create({ data: { type: "status_change", title: `Booking ${status}`, message: `${clientName}'s ${bookingType} booking is now ${status}.` } });
    }
  } catch {
    // Notifications should never block admin booking updates.
  }
  try {
    await sendClientNotification(clientEmail, `Booking ${status} - True Level Production`, bookingHtml(`<p>Hello <strong>${clientName}</strong>,</p><p>Your <strong>${bookingType}</strong> booking has been <strong>${status}</strong>.${meetingLink ? `<br/>Meeting link: <a href="${meetingLink}" style="color:#0B7CFF">${meetingLink}</a>` : ""}</p>`));
  } catch {
    // Email is optional and depends on Resend/domain configuration.
  }
}
