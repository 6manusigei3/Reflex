# Reflex Delivery Management

Reflex is a role-based delivery operations platform. Retailers create delivery requests, Dispatchers assign Riders, Riders complete the controlled status lifecycle, and recipients confirm receipt through a secure public QR link.

Admin was added as a platform-governance layer without changing the required Retailer → Dispatcher → Rider workflow. The recipient is not an account or marketplace customer.

## Architecture

```text
Browser → Next.js → FastAPI REST → JWT + RBAC → SQLAlchemy → Supabase PostgreSQL
                         └──── authenticated role-aware WebSockets ────┘
```

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, SQLAlchemy, Alembic, psycopg 3
- Persistence: Supabase-hosted PostgreSQL through server-side `DATABASE_URL`
- Authentication: Reflex JWT authentication; Supabase Auth is not used
- Production: Vercel frontend, Render or equivalent backend, Supabase PostgreSQL

The browser never receives `DATABASE_URL`, `JWT_SECRET`, or `ADMIN_SETUP_TOKEN`.

## Transactional email

Reflex uses Gmail SMTP from the FastAPI backend for five transactional events: account created/awaiting approval, account approved, Rider assigned (Retailer and Rider messages), delivery marked Delivered/awaiting confirmation, and recipient-confirmed delivery completion. Emails are branded HTML with plain-text fallbacks. Recipients are read from the Reflex database; no recipient addresses are configured in environment variables.

Configure these backend-only variables in `backend/.env`:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_APP_PASSWORD=
EMAIL_FROM_NAME=LightM Candle
EMAIL_ENABLED=true
```

Turn on 2-Step Verification for the LightM Candle Google account, create a Google App Password for Reflex, and store that 16-character value in `SMTP_APP_PASSWORD` (not the account's normal password). `SMTP_USERNAME` is both the authenticated Gmail address and the visible sender address; `EMAIL_FROM_NAME` controls only the display name. Reflex connects to `smtp.gmail.com:587` using STARTTLS. If email is disabled, incomplete, or temporarily fails, Reflex logs the result and preserves the successful account or delivery operation.

## Delivery maps and geocoding

Delivery detail pages use Leaflet with OpenStreetMap tiles to show stored pickup and destination coordinates. New delivery addresses are geocoded server-side through OpenStreetMap Nominatim; geocoding failures never block delivery creation. Configure the backend in `backend/.env`:

```dotenv
GEOCODING_ENABLED=true
GEOCODING_BASE_URL=https://nominatim.openstreetmap.org
GEOCODING_USER_AGENT=Reflex-Delivery-Management/1.0 (operations@yourdomain.com)
GEOCODING_EMAIL=operations@yourdomain.com
GEOCODING_TIMEOUT_SECONDS=5
```

Use a real monitored contact in the User-Agent. Reflex serializes public Nominatim requests to one per second and caches successful lookups in-process. The public service is appropriate only for moderate, user-triggered traffic; review its usage and privacy policies before production deployment. `GEOCODING_BASE_URL` can point to a self-hosted or compatible provider without a frontend change. OpenStreetMap attribution is displayed on every embedded map.

## Roles and account lifecycle

- **Admin:** reviews accounts, manages account status, views platform statistics, deliveries, and audit activity. Admin does not replace Dispatcher.
- **Retailer:** owns deliveries by immutable user ID, creates requests, and tracks status.
- **Dispatcher:** sees open requests, assigns active Riders, and monitors delivery operations. Dispatcher cannot manage platform users.
- **Rider:** sees only assigned work and advances valid delivery states.
- **Recipient:** needs no account and can only inspect/confirm a delivered item using its single-use QR token.

Public registration supports Retailer, Dispatcher, and Rider requests. Every new account begins `pending`; only Admin can move it to `active`, `rejected`, or `suspended`. Pending, rejected, and suspended users receive no protected access. Approving a Rider creates the linked Rider profile atomically.

## Supabase PostgreSQL setup

1. Create a Supabase project and open **Connect**.
2. Use the Direct URI from an IPv6-capable persistent backend, or the Session pooler URI on port `5432` for persistent IPv4 hosting.
3. URL-encode special password characters and require SSL.
4. Create `backend/.env` from `backend/.env.example`:

```dotenv
DATABASE_URL=postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=replace-with-at-least-32-random-bytes
ADMIN_SETUP_TOKEN=replace-with-a-long-one-time-setup-secret
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=production
```

Reflex accepts `postgresql://` and `postgresql+psycopg://` connection strings. All users, approvals, Rider profiles, deliveries, assignments, confirmations, notifications, and audit events are normal PostgreSQL records visible in Supabase Table Editor.

## Install, migrate, and run

Backend:

```bash
cd /home/emmanuel-sigei/Reflex/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.preflight
python -m app.db_check
./start.sh
```

Frontend, in a second terminal:

```bash
cd /home/emmanuel-sigei/Reflex
cp .env.example .env.local
npm install
npm run dev
```

Frontend configuration:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false
```

Open `http://localhost:3000/setup` on the first run. Enter the server-configured `ADMIN_SETUP_TOKEN` and the first Admin's details. This route works only while no Admin exists. After initialization, sign in at `/login`; all normal account and role management happens under `/admin`.

## Demo workflow

1. Initialize the first Admin at `/setup`.
2. Register a Retailer, Dispatcher, and Rider at `/register`.
3. Approve each request under **Admin → Approvals**.
4. Retailer creates a delivery.
5. Dispatcher assigns the approved Rider.
6. Rider advances `Assigned → Picked Up → In Transit → Delivered`.
7. Rider displays the secure QR link; the recipient confirms receipt.
8. The token is invalidated and the delivery becomes `Completed`.
9. Admin can inspect users, delivery activity, notifications, and audit history.

Only confirmation-token hashes are stored. Tokens expire after 30 minutes and are single-use. Invalid status transitions are rejected by FastAPI.

## Migrations and data

Run migrations with `alembic upgrade head`. A fresh database creates:

- `users`, including role, approval status, business/phone metadata, and approval attribution
- `riders`
- `deliveries`, `delivery_assignments`, and `delivery_status_history`
- `delivery_confirmations`
- `notifications`
- `audit_events`

Normal startup does not seed data. Do not run `python -m app.seed` against Supabase. The optional seed command is only for an isolated local demo database.

## Testing

```bash
cd /home/emmanuel-sigei/Reflex
npm run lint
npx tsc --noEmit
npm run build

cd backend
source .venv/bin/activate
python -c "import app.main; print('Reflex backend imports successfully')"
pytest -q
alembic upgrade head
python -m app.preflight
python -m app.db_check
```

Security remains backend-authoritative: JWTs are revalidated against the current database account status, role endpoints are protected, Admin cannot be publicly requested, tenant ownership uses user IDs rather than display names, and WebSocket connections repeat the same account checks.
