# PROJECT_MAP

## [TECH_STACK]
- Date verified from system shell: 2026-05.
- Package versions verified from npm registry: Next.js 16.2.6, React 19.2.6, React DOM 19.2.6, Tailwind CSS 4.3.0, @tailwindcss/postcss 4.3.0, lucide-react 1.16.0, TypeScript 6.0.3, Prisma 7.8.0, @prisma/client 7.8.0, Zod 4.4.3, date-fns 4.2.1, react-hook-form 7.76.0, bcryptjs 3.0.3.
- Runtime target: Vercel full-stack deployment with Supabase PostgreSQL for https://production.true-level.org.

## [SYSTEM_FLOW]
- Visitor lands on homepage.
- Navbar anchor links scroll to Services, Studio, Work, and Packages.
- CTAs route to `/book`, `/book/meeting`, or `/book/studio`.
- Client submits meeting or studio booking request.
- Server validates input with Zod, upserts client, prevents studio time overlap, and stores pending booking.
- Admin logs in at `/admin`, reviews bookings, updates status/pricing/payment notes, tracks clients, accounting, and contracts.

## [ARCHITECTURE]
- `app/layout.tsx`: Root layout and SEO metadata.
- `app/page.tsx`: Existing marketing homepage, preserved and connected to booking routes.
- `app/book/*`: Public booking flow and success page.
- `app/admin/*`: Protected operations dashboard for bookings, meetings, studio, clients, accounting, contracts, settings, and CSV exports.
- `lib/actions.ts`: Server actions for booking, admin updates, accounting, contracts, login/logout.
- `lib/auth.ts`: Signed httpOnly cookie admin session using env credentials.
- `lib/prisma.ts`: Prisma client helper with setup-safe runtime guard.
- `prisma/schema.prisma`: PostgreSQL schema for admin users, clients, bookings, accounting, contracts, templates, and settings.

## [ORPHANS & PENDING]
- Replace portfolio placeholders with real media when approved.
- Confirm final production contact email/phone/location before launch if these values change.
- Email: Add `RESEND_API_KEY` and `ADMIN_NOTIFY_EMAIL` for live email notifications on booking creation and status changes.
- Google Meet: Add `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` to auto-generate Meet links when approving Google Meeting bookings. Otherwise, the admin can enter links manually.
- Run `npm.cmd run db:push` to add the `Notification` table to the existing database.
