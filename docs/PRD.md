# Dental Clinic Digital Platform — PRD

**Purpose:** Give the practice a public web presence, let patients discover services and self-book/pay for appointments, and give the doctor and staff one panel to run bookings, patients, payments, and site content.

## 1. Client-Facing Applications — 3 total

| # | App | Users | Auth | Features |
|---|-----|-------|------|----------|
| 1 | Public Website | Anonymous visitors | None | 6 |
| 2 | Patient Portal | Registered patients | Email OTP | 6 |
| 3 | Admin Panel | Doctor + staff | Email/password + role | 7 |

All three are responsive web apps on one shared backend/database. No native mobile app in v1.

## 2. Public Website (PW) — 6 features, no login

| ID | Feature | Fields | Function |
|----|---------|--------|----------|
| PW-1 | Home | hero_title, hero_subtitle, cta_link, testimonials[], highlights[] | Landing page; drives visitors to Book Appointment |
| PW-2 | About Us | doctor_name, photo, bio, qualifications[], certifications[], clinic_history, milestones[] | Establishes doctor's credibility |
| PW-3 | Services | name, category, description, icon, duration_min, price? | Lists treatments (General, Root Canal, Implants, Whitening, Ortho, Cosmetic, Pediatric, custom); links to booking, service pre-selected |
| PW-4 | Our Team | name, photo, role, qualification, department | Displays doctor + staff profiles |
| PW-5 | Gallery | image, caption, category | Visual proof of clinic / infrastructure / treatment |
| PW-6 | Contact Us | name, email, phone, message (input) + address, phone, email, map_lat/lng (static) | Lead-capture form + embedded Google Map |

> Services, Team, and Gallery content is managed from the Admin Panel — no dev needed to update the site.

## 3. Patient Portal (PP) — 6 features, OTP login

| ID | Feature | Fields | Function |
|----|---------|--------|----------|
| PP-1 | Register / Login | name, email, phone (signup); email, otp_code (login) | Passwordless auth — OTP emailed, expires 5–10 min |
| PP-2 | Profile | dob, gender, phone, email, address, medical_history | Self-service profile + medical intake |
| PP-3 | Book Appointment | service_id, date, time_slot, amount, payment_status | Checks live slot availability → holds slot → payment → confirms booking |
| PP-4 | My Appointments | appointment_id, date, time, service, status | Lists upcoming/past visits; cancel within policy window |
| PP-5 | Payment History | transaction_id, amount, date, method, status, invoice_link | Read-only payment ledger |
| PP-6 | Auto-Emails | booking_confirmation, reminder_24h, payment_receipt | Fired on booking, T-24h cron job, and payment webhook |

## 4. Admin Panel (AP) — 7 features, role-based login

| ID | Feature | Fields | Function |
|----|---------|--------|----------|
| AP-1 | Dashboard | total_appointments, today_appointments, revenue, new_patients | Operational snapshot on login |
| AP-2 | Appointments | patient, service, date, time, status, notes | View / filter / reschedule / cancel any booking |
| AP-3 | Slot Management | working_days, open_time, close_time, slot_duration, blocked_dates[] | Defines the bookable calendar patients see |
| AP-4 | Patients | profile, appointment_history, payment_history | Search and manage patient records |
| AP-5 | Payments | transaction_list, amount, method, status, invoice_pdf | Reconcile payments; generate/download invoices |
| AP-6 | Content Management *(doctor-only)* | services[], team[], gallery[] — CRUD | Updates the public site without a developer |
| AP-7 | Roles | role: doctor \| staff | Staff can be excluded from Payments and Content modules |

## 5. Core Data Model

- **Patient** — id, name, dob, gender, phone, email, address, medical_history
- **Staff** — id, name, role, department, photo
- **Service** — id, name, category, description, duration, price
- **Slot** — id, date, time, status
- **Appointment** — id, patient_id, service_id, slot_id, status, notes
- **Payment** — id, appointment_id, amount, method, status, invoice_url
- **ContactMessage** — id, name, email, phone, message, created_at
- **GalleryItem** — id, image_url, caption, category

## 6. Technical Notes

- **Frontend:** Public Website — SSR/SSG for SEO. Patient Portal & Admin Panel — SPA. One shared component library.
- **Backend:** Single REST API, stateless, JWT sessions.
- **Database:** PostgreSQL/MySQL — relational, needed for transactional integrity on appointments/payments.
- **Slot locking:** Row-lock or optimistic concurrency at booking time to prevent double-booking.
- **Payments:** Gateway integration (e.g. Razorpay/Stripe) with webhook confirmation before a booking is finalized.
- **Email:** Transactional provider (SES/SendGrid/Postmark) for OTP, confirmations, and reminders (scheduled job).
- **Maps:** Google Maps Embed API.
- **Hosting:** Cloud VM/PaaS + object storage/CDN for gallery images.

## 7. Non-Functional Requirements

- HTTPS everywhere; PII/medical data encrypted at rest.
- RBAC enforced server-side, not just hidden in the UI.
- Audit log on all admin actions.
- Slot-availability check < 2s; page load < 3s.
- Confirm local patient-data protection rules before storing medical history.

## 8. Assumptions / Out of Scope (v1)

- Single clinic location.
- Responsive web only — no native app.
- Full payment collected at booking (switch to partial deposit if preferred).
- No insurance-claim processing.
