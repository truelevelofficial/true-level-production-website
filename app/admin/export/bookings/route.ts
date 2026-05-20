import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getBookings } from "@/lib/admin-data";
import { toCsv } from "@/lib/csv";

export async function GET() {
  if (!(await isAdminAuthenticated())) return new NextResponse("Unauthorized", { status: 401 });
  const bookings = await getBookings();
  const csv = toCsv(bookings.map((booking) => ({
    id: booking.id,
    type: booking.type,
    status: booking.status,
    client: booking.client.fullName,
    email: booking.client.email,
    phone: booking.client.phone,
    service: booking.serviceType,
    studioSetup: booking.studioSetup,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    price: booking.price,
    deposit: booking.deposit,
    paymentStatus: booking.paymentStatus,
  })));
  return new NextResponse(csv, { headers: { "content-type": "text/csv", "content-disposition": "attachment; filename=bookings.csv" } });
}
