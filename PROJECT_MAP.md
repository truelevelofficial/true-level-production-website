# PROJECT_MAP

## [TECH_STACK]
- Date verified from system shell: 2026-05.
- Package versions verified from npm registry: Next.js 16.2.6, React 19.2.6, React DOM 19.2.6, Tailwind CSS 4.3.0, @tailwindcss/postcss 4.3.0, lucide-react 1.16.0, TypeScript 6.0.3.
- Runtime target: Vercel static frontend deployment for https://production.true-level.org.

## [SYSTEM_FLOW]
- Visitor lands on homepage.
- Navbar anchor links scroll to Services, Studio, Work, and Packages.
- CTAs route to the final contact section.
- Contact actions expose phone, email, and location only.

## [ARCHITECTURE]
- `app/layout.tsx`: Root layout and SEO metadata.
- `app/page.tsx`: Single static marketing page with feature-local data arrays and presentational components.
- `app/globals.css`: Tailwind import, global background, and smooth anchor scrolling.
- No backend, authentication, database, CMS, payments, or external integrations.

## [ORPHANS & PENDING]
- Replace portfolio placeholders with real media when approved.
- Confirm final production contact email/phone/location before launch if these values change.
