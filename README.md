# E-commerce Application (Frontend + Backend)

Full-stack online store that started as a technical challenge (product listing, cart and checkout)
and grew into a deployed project with accounts, permission-based access control, collaborative
filtering recommendations and an automated test suite. Next.js frontend, Node.js + Express API and
PostgreSQL.

## Live demo

**https://e-commerce-self-eight-74.vercel.app**

The frontend runs on Vercel, the API on Render and the database on Supabase, all on free tiers.
The API sleeps when idle, so the first request after a pause can take about a minute. Sign up to
try accounts, checkout and recommendations, and use a throwaway email: the demo stores what you
type. Purchase confirmation emails go out through Resend's test sender, so they are only
delivered to the project owner.

API: `https://e-commerce-wuzc.onrender.com` (try `/health` or `/api/product`).

## Features

### Frontend
- Product listing with name, description, price and image
- Individual product page
- Cart: add products, update quantities, remove items, per-item subtotal
- Total purchase value
- Checkout with email input and validation, or as a logged in user
- Sign up and log in
- Recommendations: "Customers also bought" on the product page, "Recommended for you" on the home
- Demo notice at checkout, and the real reason shown when a purchase fails
- About page with a comments section (a mock, kept in your browser)
- Responsive layout, keyboard focus ring and the current page highlighted in the menu

### Backend
- RESTful API
- Purchase persistence in PostgreSQL
- Confirmation email on checkout
- Accounts with JWT and permission-based access control (customer and admin roles)
- Item-based collaborative filtering for recommendations
- Security basics: `helmet`, CORS limited to the frontend origin, rate limits on login, sign up and
  checkout, input validation, and a `/health` check
- Automated tests (HTTP and unit) with full source coverage

## API

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/product` | List all products |
| GET | `/api/product/:id` | Product details |
| GET | `/api/cart` | Current cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart` | Update item quantity |
| DELETE | `/api/cart/:id` | Remove item from cart |
| POST | `/api/checkout` | Finalize purchase (guest with `customer_email`, or logged in) |
| POST | `/api/auth/register` | Create an account (role `customer`) |
| POST | `/api/auth/login` | Returns a JWT and the user's permissions (rate limited) |
| GET | `/api/auth/me` | Current user and permissions |
| GET | `/api/orders` | Own orders, or all orders with `order:read:any` |
| GET | `/api/product/:id/recommendations` | "Customers also bought" (optional `?limit=1..20`, default 4) |
| GET | `/api/recommendations` | Recommendations for the logged in user (default 8) |
| POST | `/api/product` | Create a product (`product:write`) |
| PUT | `/api/product/:id` | Edit a product (`product:write`) |
| GET | `/health` | Health check: `200` if the database answers, `503` otherwise |

The cart is kept in memory in the backend, as allowed by the challenge. It has no table of its
own, resets when the server restarts, and holds at most 50 distinct products.

Errors are JSON, `{ "error": "message" }`: `400` invalid input (including cart payloads), `401`
missing or invalid token, `403` missing permission, `404` unknown product or an id that is not a
positive integer, `409` email already registered, `429` too many requests.

Rate limits per client IP: login 10 per 15 minutes, sign up 20 per hour, checkout 30 per 15
minutes.

## Access control

Permission-based (RBAC): users have roles, roles have permissions, and routes check the
permission, never the role name.

| Role | Permissions |
| ---- | ----------- |
| `customer` (default on sign up) | `order:read:own` |
| `admin` | `product:write`, `order:read:any`, `order:read:own` |

- Login returns a JWT (HS256, 1 hour). It only carries the user id: permissions are read from
  the database on every request, so revoking a role takes effect immediately.
- Checkout works as a guest or logged in. A logged-in purchase uses the account's email and is
  linked to the user. An invalid token is a `401`, it is not treated as a guest.
- Prices and titles are always read from the `products` table at checkout. The client only
  chooses the product and the quantity.
- The public sign up never creates admins. Promote an existing account with:

```bash
cd backend
npm run grant-role -- user@email.com admin
```

## Recommendations

Item-item collaborative filtering, the same idea behind "people who watched this also watched".
The domain logic is pure and lives in
[`itemCollaborativeFiltering.js`](backend/src/modules/recommendation/domain/itemCollaborativeFiltering.js).

- Input: one basket per buyer (the products they bought). The signal is implicit and binary,
  bought or not bought, quantity does not weigh in.
- Similarity between two products is the cosine between their buyer vectors:
  `common buyers / sqrt(buyers of A * buyers of B)`, from 0 to 1.
- Product page: the products most similar to it.
  Logged in user: for each candidate, the sum of its similarity to everything the user already
  owns, never recommending what they own.
- Cold start: when the history is not enough (new product, new account, empty store), the list is
  completed with the top rated products. Each item carries `recommendation.reason`
  (`also-bought` or `top-rated`) and a `score`, so the UI never labels a fallback as a
  collaborative result.
- The buyer is identified by email (a logged in purchase uses the account's email).

The model is rebuilt from `sale_items` on every request, which is fine for a small store. With
real volume it should be precomputed (a job that stores the top neighbours of each product).

A fresh store has no purchases, so generate some:

```bash
cd backend
npm run seed:demo             # 60 synthetic purchases in 4 taste profiles (deterministic)
npm run seed:demo -- --clear  # remove them
```

## Technologies

**Frontend:** Next.js (App Router), React, Tailwind CSS, Context API, LocalStorage, lucide-react

**Backend:** Node.js, Express, PostgreSQL (Supabase), pg, JWT, bcrypt, express-validator, helmet,
express-rate-limit, Resend, dotenv

**Tests:** Node's built-in runner (`node:test`) and `supertest`

**Infrastructure:** Docker Compose (local database), Vercel (frontend), Render (backend), Supabase
(database)

## Project structure

```
docker-compose.yml  local postgres for development
backend/
  schema.sql        tables and seed data
  migrations/       incremental SQL (001_rbac.sql, 002_sale_items.sql)
  scripts/          grant-role.js, seed-demo-data.js
  src/
    modules/        one folder per bounded context
      catalog/          products
      cart/             in-memory cart
      ordering/         checkout and orders
      identity/         sign up, login, JWT, permission middleware
      recommendation/   collaborative filtering over the purchase history
    shared/         database pool, AppError, error handler, validation, permission names
    app.js          composition root: builds the modules and mounts the routes
    server.js
    *.test.js       HTTP tests in src/, unit tests next to the code they cover
frontend/
  src/
    app/            routes, pages and components (store, product, cart, login, sign up, about)
    context/        cart and auth state
    lib/            api base url and the parsing of saved comments (with its test)
```

Inside each backend module: `domain/` holds the rules (no framework or database), `application/`
the use cases, `infra/` the routes, controllers, repositories and adapters (pg, bcrypt, Resend),
and `index.js` wires the module.

## Database

PostgreSQL, hosted on Supabase. Tables:

- `products`: available products
- `sales`: completed purchases, with the cart snapshot stored as `JSONB` and the buyer in
  `user_id` (null for guests)
- `sale_items`: one row per product in each purchase (`sale_id`, `product_id`, `quantity`), the
  input of the recommendations. `sales.items` stays as the title and price snapshot
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`: access control

Ratings are stored as two columns, `rating_rate` and `rating_count`, and nested into a `rating`
object in the API response.

Schema and seed data (20 products): [`backend/schema.sql`](backend/schema.sql). Access control
tables: [`backend/migrations/001_rbac.sql`](backend/migrations/001_rbac.sql). Purchase items (with a
backfill of existing purchases): [`backend/migrations/002_sale_items.sql`](backend/migrations/002_sale_items.sql).

## Running locally

### 1. Database

Pick either option. Docker is faster and needs no account.

**Option A: Docker**

```bash
docker compose up -d
```

Starts PostgreSQL on port 5432 and applies [`backend/schema.sql`](backend/schema.sql) and the
files in [`backend/migrations/`](backend/migrations) automatically on the first run, creating the
tables and inserting the products. This is the
value `.env.example` already ships with, so no editing is needed:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
```

The command returns before the database has finished initializing. Wait for
`docker compose ps` to report `healthy` before starting the backend.

To wipe it and start from a clean database, run `docker compose down -v` and bring it up again.

If the database already existed before a migration, apply the new files to it in order (they are
safe to run more than once):

```bash
docker exec -i ecommerce-db psql -U postgres -d ecommerce < backend/migrations/001_rbac.sql
docker exec -i ecommerce-db psql -U postgres -d ecommerce < backend/migrations/002_sale_items.sql
```

**Option B: Supabase**

1. Create a project at [supabase.com](https://supabase.com) and save the database password it
   asks you to define.
2. Open the **SQL Editor**, paste all of [`backend/schema.sql`](backend/schema.sql) and run it,
   then do the same with each file in [`backend/migrations/`](backend/migrations), in order.
   This creates the tables and inserts the products and the roles.
3. Copy the connection string from **Project Settings > Database**. Use the **Session pooler**
   URI on port `5432`, not the direct connection, which is IPv6-only on the free plan.

Two details when filling in the password:

- Replace the whole `[YOUR-PASSWORD]` placeholder, square brackets included. Leaving them in
  makes them part of the password and authentication fails.
- Percent-encode special characters, since the connection string is a URI: `@` becomes `%40`,
  `!` becomes `%21`, `#` becomes `%23`.

SSL is enabled for remote hosts and skipped for localhost, so the same code works with either
option.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in DATABASE_URL, JWT_SECRET and RESEND_API_KEY
node src/server.js
```

`JWT_SECRET` is required, the server refuses to start without it. Generate one with
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

Runs on `http://localhost:3333`. Check it with `curl http://localhost:3333/api/product`, which
should return the product list.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Available at `http://localhost:3000`. It calls the backend at `http://localhost:3333` by
default; set `NEXT_PUBLIC_API_URL` only if the backend runs somewhere else.

## Deploy

Suggested setup: **Vercel** (frontend), **Render** (backend) and **Supabase** (database). Free
tiers change, check the current limits. The backend may sleep when idle, so the first visit after
a pause can take about a minute.

Environment variables:

| Service | Variable | Value |
| ------- | -------- | ----- |
| Backend | `DATABASE_URL` | Supabase **Session pooler** URI (port 5432) |
| Backend | `JWT_SECRET` | A new random value for production, never the local one |
| Backend | `CORS_ORIGIN` | The frontend URL, no trailing slash (comma separated for several) |
| Backend | `TRUST_PROXY` | `1` behind Render, so each visitor gets their own rate limit |
| Backend | `RESEND_API_KEY` | Optional. Without it checkout works and only skips the email |
| Backend | `EMAIL_FROM` | Optional sender. Empty uses Resend's test sender, which only delivers to the Resend account owner |
| Backend | `PORT` | Set by Render, nothing to do |
| Frontend | `NEXT_PUBLIC_API_URL` | The backend URL. It is baked in at **build time**, set it before the first deploy |

Order matters, because the backend needs the frontend URL and the frontend needs the backend URL:

1. **Supabase:** in the SQL Editor run `backend/schema.sql`, then each file in
   `backend/migrations/` in order. Copy the Session pooler URI.
2. **Render:** new Web Service from this repository, Root Directory `backend`, build command
   `npm ci`, start command `npm start`, Health Check Path `/health`. Add the variables above
   (put any placeholder in `CORS_ORIGIN` for now).
3. **Vercel:** import the repository, Root Directory `frontend`, set `NEXT_PUBLIC_API_URL` to the
   Render URL, then deploy.
4. Back on Render, set `CORS_ORIGIN` to the Vercel URL and redeploy.
5. Optional, so the recommendations have something to show: from your machine run
   `DATABASE_URL='<production uri>' npm run seed:demo` inside `backend/`. To make yourself an admin,
   sign up on the site and run `DATABASE_URL='<production uri>' npm run grant-role -- you@email.com admin`.
6. Optional: point a free uptime monitor at `/health` to reduce the cold starts.

Product images go through `next/image`, which only accepts `fakestoreapi.com` today
([`next.config.mjs`](frontend/next.config.mjs)). A product created through the API with an image
from another host will not render until that host is added there.

## Tests

```bash
cd backend
npm test                # run everything
npm run test:coverage   # same, with the coverage table

cd ../frontend
npm test                # the frontend unit test
```

They need the database up (`docker compose up -d`, wait for `healthy`) and `backend/.env` with
`DATABASE_URL` and `JWT_SECRET`. Node's built-in runner and `supertest`, no extra tooling.

- HTTP tests call the real app against the real database: every endpoint is covered for success,
  validation errors, missing token and missing permission.
- Unit tests use fakes for what the routes cannot reach: the checkout use case, the permission
  middleware, the JWT service, the order transaction (commit and rollback), the Resend gateway
  (`fetch` is replaced, so no email is sent) and the `DATABASE_URL` checks.
- Tests that create users or products remove them afterwards.
- Source coverage is 100% of lines, branches and functions. `src/server.js` is the one file not
  measured, since no test imports it. Node 20 has no option to leave test files out of its own
  report, so the "all files" row it prints also counts them.
- The frontend has one small unit test, for the parsing of the comments saved in the browser (it
  guards a bug where an empty `localStorage` rendered two blank comments). The screens are checked
  by hand, there are no UI tests.

`src/checkout.test.js` (the first test written) inserts a row in `sales` on every run and is not
cleaned up. With `RESEND_API_KEY` set it also sends a real email to the address it uses.

## Email confirmation

Checkout sends a confirmation email through Resend. Resend only sends from a verified domain, so a
`@gmail.com` sender does not work. By default the app uses Resend's test sender
(`onboarding@resend.dev`), which only delivers to the email of the Resend account owner. To email
any customer, verify a domain of yours in Resend and set `EMAIL_FROM`. Whatever happens, the
purchase is recorded and the API response reports whether the email went out.

## Limitations

- The cart endpoints share one cart in the backend's memory (at most 50 products). The site does
  not use them: it keeps your cart in the browser (`localStorage`).
- The login token is kept in `localStorage`, which a script injected into the page could read. An
  `httpOnly` cookie would be safer.
- The comments on the About page are a mock and only live in the visitor's browser.
- Confirmation emails only reach the Resend account owner until a domain is verified.
- Guest checkout stores the email that was typed, so use a throwaway one on the demo.
- Recommendations are rebuilt on every request, which is fine for a small store.
- On free tiers the API may sleep and the database may pause when idle.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Screenshots

<p align="center">
  <img src="frontend/public/images/home.png" width="600" />
</p>

<p align="center">
  <img src="frontend/public/images/product.png" width="600" />
</p>

<p align="center">
  <img src="frontend/public/images/cart.png" width="600" />
</p>

<p align="center">
  <img src="frontend/public/images/about.png" width="600" />
</p>
