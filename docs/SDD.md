# Dental Clinic Platform — Technical Specification (SRS / SRD / TDD)

This document defines requirements (SRS/SRD) and implementation design (TDD) for the platform described in the PRD. Feature-level detail (fields, functions) lives there — this covers architecture, data design, and delivery, so nothing is repeated twice.

## 1. Guiding Constraints

- **Budget:** minimize recurring cost — prefer managed free/low tiers over a self-run server.
- **Longevity:** mature, boring technology; avoid anything that needs a dedicated ops person to keep alive for a decade.
- **SEO:** public site must be crawlable and fast — server-rendered, not a client-only SPA.
- **Hosting:** GoDaddy already owns the domain. Keep it there for DNS only; the app runs elsewhere.
- **Real-time:** slots, bookings, and notifications update live, not on page refresh.
- **Dev context:** solo developer, comfortable with MERN, Next.js, Postgres, Supabase.

## 2. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + API | Next.js 14+ (App Router) | SSR/SSG → SEO; React skills carry over from MERN; Route Handlers replace Express |
| Database | PostgreSQL (via Supabase) | Relational integrity for bookings/payments — the one place Mongo would actually hurt you |
| Auth | Supabase Auth — Email OTP | Matches "Email OTP Login" natively, nothing custom to build |
| Realtime | Supabase Realtime | Streams Postgres row changes over websockets — fits slot/booking/notification updates directly |
| Storage | Supabase Storage | Gallery images, invoice PDFs |
| Scheduled jobs | Supabase `pg_cron` | Reminders, expiring unpaid slot-holds — runs inside the DB, no separate cron service |
| Payments | Razorpay | India-standard, UPI + cards, ~2% + GST per transaction, no fixed fee |
| Email | Resend | Booking/payment emails; free tier comfortably covers one clinic |
| App hosting | Vercel | Built by the Next.js team; zero-config SSR/ISR |
| Domain | GoDaddy (DNS only) | Point DNS at Vercel — no migration, no downtime |

Swapping Express+MongoDB for Next.js Route Handlers+Supabase keeps every skill you listed, removes a server you'd otherwise patch and monitor yourself, and is cheaper once you price in hosting a 24/7 Node process.

## 3. Why Not Host on GoDaddy Directly?

GoDaddy's shared/cPanel hosting is built for PHP, not a Node.js SSR app — it can't reliably run Next.js's server rendering, which undercuts both real-time features and SEO, your two explicit priorities. Keep GoDaddy for the domain and DNS records only; host the app on Vercel + Supabase and point an A/CNAME record at it. That's a DNS change, not a migration — zero disruption to the domain.

## 4. System Architecture

```
GoDaddy (DNS only)
        │
        ▼
Vercel — one Next.js app
  ├─ Public Website     (SSG/ISR, SEO-optimized)
  ├─ Patient Portal     (client-rendered, OTP auth)
  ├─ Admin Panel         (client-rendered, role auth)
  └─ Route Handlers      (custom backend logic, payment init)
        │
        ▼  Supabase JS client
Supabase
  ├─ Postgres (+ Row Level Security)
  ├─ Auth (Email OTP + email/password)
  ├─ Realtime (slots, bookings, notifications)
  ├─ Storage (gallery, invoices)
  └─ pg_cron (reminders, hold-expiry)
        │
        ▼  webhook / API calls
Razorpay (payments)  +  Resend (email)
```

One codebase, one database, no server for you to babysit.

## 5. Real-Time Design

- **Slot availability:** clients subscribe to the `slots` table via Supabase Realtime, filtered by date/service — a slot taken by one patient disappears from every other open browser instantly, no polling.
- **Double-booking prevention:** `UNIQUE(service_id, date, time)` on `slots`; booking runs inside a DB transaction; a unique-violation is caught and returned as "slot no longer available."
- **Booking hold:** selecting a slot inserts a `pending` appointment with `expires_at = now() + 10 min`; a `pg_cron` job every minute releases expired holds back to `available`.
- **Admin dashboard:** subscribes to `appointments` and `payments` — new bookings/payments appear live, no refresh.
- **Notifications:** sent via Resend, triggered on insert/update (booking confirmed) and by `pg_cron` (24h-before reminder, payment webhook receipt).

## 6. Core Schema

```sql

users           (id, auth_user_id, first_name, last_name, email, phone, dob, gender, address, medical_history, photo_url,
                role, department, created_at, updated_at)
services        (id, name, category, description, duration_min, price, icon_url, created_at, updated_at)
slots           (id, service_id, date, time, status, created_at)
appointments    (id, patient_id, doctor_id, service_id, slot_id, status, notes, created_at, updated_at)
payments        (id, appointment_id, amount, method, status, razorpay_order_id, razorpay_payment_id, 
                invoice_url,created_at, updated_at)
contact_messages(id, name, email, phone, message, created_at)
gallery_items   (id, image_url, caption, category, created_at)

-- key constraints
PK: users.id
FK: users.auth_user_id → auth.users.id
UNIQUE: users.auth_user_id
role: patient | doctor | staff | admin
auth_user_id: nullable

PK: services.id
CONSTRAINTS: duration_min > 0 & price >= 0

PK: slots.id
FK: slots.service_id → services.id
UNIQUE (service_id, date, time)              -- blocks double-booking
status: available | held | booked

PK: appointments.id
FK: appointments.patient_id → users.id
FK: appointments.doctor_id → users.id
FK: appointments.service_id → services.id
FK: appointments.slot_id → slots.id
status: pending | confirmed | completed | cancelled | no_show

-- role constraints
patient_id → users.role = patient
doctor_id  → users.role = doctor

PK: payments.id
FK: payments.appointment_id → appointments.id
CONSTRAINTS: amount >= 0
status: pending | paid | failed | refunded
method: razorpay | cash | upi | card

PK: contact_messages.id
PK: gallery_items.id





```

Row Level Security on every table: patients read/write only their own rows (`auth.uid() = patient_id`); `staff.role = 'doctor'` gets full access, `'staff'` gets a narrower policy that excludes `payments` and content tables. Enforce this in Postgres policies, not just in the UI.

## 7. SEO Implementation (Public Website)

- Render with SSG/ISR (`generateStaticParams` + `revalidate`) — no client-only rendering on public pages.
- `next/image` for automatic image optimization (Core Web Vitals).
- `sitemap.xml` + `robots.txt` via Next.js metadata routes.
- JSON-LD structured data (`Dentist`/`MedicalBusiness` schema) on Home and Services.
- Per-page `<title>`/meta description via the Metadata API.
- Register the clinic on Google Business Profile — outside the codebase, but required for local search ranking.

## 8. Security

- HTTPS everywhere (free via Vercel).
- RLS on all Supabase tables — never trust a client-side role check alone.
- Razorpay webhook signature verified server-side before a payment is marked confirmed.
- Medical history and PII encrypted at rest (Supabase/Postgres default), never returned in public API responses.
- Admin actions logged to an `audit_log` table (who changed what, when).

## 9. Non-Functional Requirements

- Slot availability reflects reality within ~1s of a change (Realtime, not polling).
- Public pages: Lighthouse performance/SEO score ≥ 90.
- 99.5%+ uptime, inherited from Vercel/Supabase SLAs on paid tiers.
- Stack limited to widely-adopted, actively-maintained tools — avoid niche libraries that might not exist in 10 years.

## 10. Estimated Monthly Cost

*Verified against vendor pricing pages, Aug 2026 — confirm current rates before committing, SaaS pricing shifts.*

| Service | Free tier | Production tier |
|---|---|---|
| Vercel | Non-commercial use only | Pro — $20/mo (1TB bandwidth, 10M edge requests included) |
| Supabase | Pauses after 7 days idle | Pro — $25/mo (no pausing, backups included) |
| Resend | 3,000 emails/mo | Free tier likely sufficient for one clinic; $20/mo past ~50k/mo |
| Razorpay | — | ~2% + 18% GST per successful transaction, no fixed fee |
| GoDaddy | — | ~$12–20/yr, domain only, already owned |

**Fixed cost once live: ~$45/mo** (Vercel + Supabase), plus Razorpay's per-transaction cut on actual payments. Free tiers work fine for build/demo — Supabase's pausing behavior is the one thing that forces the upgrade before real patients start booking.

*Cheaper-but-riskier option:* self-hosting Next.js on a ~$8/mo VPS is possible, but you take on patching, SSL renewal, and uptime monitoring yourself. For one developer supporting this for years, $45/mo managed is the safer trade for "robust for decades."

## 11. Out of Scope (unchanged from PRD)

Single clinic location, web-only, full payment at booking, no insurance-claim processing.
