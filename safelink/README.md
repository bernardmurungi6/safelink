# SafeLink

A registry platform for reducing mobile phone theft: register a phone by IMEI, report it lost or stolen, and let anyone verify an IMEI's status before buying a used device.

This is the MVP scope: user accounts, phone registration, lost/stolen reporting, public IMEI verification, a user dashboard, and an admin dashboard.

## Stack

- **Backend:** Node.js, Express, PostgreSQL (`backend/`)
- **Frontend:** Next.js (Pages Router), Tailwind CSS (`frontend/`)
- **Auth:** JWT, bcrypt password hashing

## Project structure

```
safelink/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # PostgreSQL connection pool
│   │   ├── db/schema.sql         # Full DB schema
│   │   ├── db/migrate.js         # Applies schema + seeds an admin user
│   │   ├── middleware/           # auth (JWT) + error handling
│   │   ├── utils/                # IMEI Luhn validation, JWT helpers
│   │   ├── controllers/          # auth, phones, reports, verify, admin
│   │   ├── routes/
│   │   └── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── pages/
    │   ├── index.js               # Public IMEI verification (homepage)
    │   ├── register.js / login.js
    │   ├── dashboard.js           # User's registered phones + reporting
    │   ├── admin.js               # Admin report review + stats
    │   └── contact.js
    ├── components/
    │   ├── StatusStamp.js         # Signature "verification stamp" UI element
    │   ├── PhoneCard.js
    │   ├── Navbar.js / Footer.js
    ├── lib/
    │   ├── api.js                 # Fetch wrapper for the backend API
    │   └── authContext.js         # React auth context
    ├── tailwind.config.js         # Design tokens (colors, type)
    └── package.json
```

## Getting started

### 1. Database

You need a running PostgreSQL instance. Create a database and user:

```sql
CREATE DATABASE safelink;
CREATE USER safelink_user WITH PASSWORD 'safelink_pass';
GRANT ALL PRIVILEGES ON DATABASE safelink TO safelink_user;
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # then edit .env with your real DB URL, JWT secret, etc.
npm install
npm run db:migrate        # applies schema.sql and seeds an admin user
npm run dev                # starts the API on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                # starts the site on http://localhost:3000
```

Visit `http://localhost:3000`. Register an account, register a phone by IMEI, then try the public verification form on the homepage with that same IMEI.

To access the admin dashboard, log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env` before running the migration.

## API reference (MVP)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, returns a JWT |
| GET | `/api/auth/me` | user | Current user profile |
| GET | `/api/verify?imei=` | — | Public IMEI status check |
| POST | `/api/phones` | user | Register a phone |
| GET | `/api/phones` | user | List your phones |
| DELETE | `/api/phones/:id` | user | Remove a phone |
| POST | `/api/reports` | user | File a lost/stolen report |
| POST | `/api/reports/recover` | user | Mark a phone recovered |
| GET | `/api/reports` | user | List your own reports |
| GET | `/api/admin/stats` | admin | Dashboard counts |
| GET | `/api/admin/reports` | admin | All reports, filterable by status |
| PATCH | `/api/admin/reports/:id` | admin | Resolve / dispute a report |
| GET | `/api/admin/users` | admin | List all users |
| PATCH | `/api/admin/users/:id/active` | admin | Deactivate/reactivate a user |

## Design decisions worth knowing about

- **IMEI validation** uses the real Luhn checksum algorithm (`backend/src/utils/imei.js`), so typos are caught before hitting the database, both client- and server-side.
- **Public verification is unauthenticated on purpose** — it's the feature most likely to drive first-time traffic (someone checking a used phone before buying), so it has no signup wall, just IP rate limiting to prevent scraping.
- **Disputed reports auto-restore phone status to `active`** so a wrongly-flagged phone doesn't stay publicly marked stolen while under review — this is the beginning of the abuse-mitigation layer flagged in the MVP roadmap discussion; you'll want to expand this before public launch (e.g. requiring a police report number for `stolen` reports, or a cool-down before a disputed report can be re-filed).
- **Every "lost/stolen" flag changes are logged as `reports`, not just a status field** — so there's a full history per device, which matters both for admin review and for building trust with future police/telecom partners.

## Not yet built (see future features)

AI theft detection, live GPS tracking, community alerts, QR registration, reward system, native mobile apps, and police/telecom integrations are intentionally out of scope for this MVP — see the roadmap discussion for sequencing.
