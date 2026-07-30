# E-commerce Application (Frontend + Backend)

Full-stack online store built as a technical challenge: product listing, cart management and a
checkout flow, with a Next.js frontend talking to a Node.js + PostgreSQL API.

## Features

### Frontend
- Product listing with name, description, price and image
- Individual product page
- Cart: add products, update quantities, remove items, per-item subtotal
- Total purchase value
- Checkout with email input and validation
- Responsive layout

### Backend
- RESTful API
- Purchase persistence in PostgreSQL
- Confirmation email on checkout

## API

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/product` | List all products |
| GET | `/api/product/:id` | Product details |
| GET | `/api/cart` | Current cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart` | Update item quantity |
| DELETE | `/api/cart/:id` | Remove item from cart |
| POST | `/api/checkout` | Finalize purchase |

The cart is kept in memory in the backend, as allowed by the challenge. It has no table of its
own and resets when the server restarts.

## Technologies

**Frontend:** Next.js (App Router), React, Tailwind CSS, Context API, LocalStorage

**Backend:** Node.js, Express, PostgreSQL (Supabase), pg, Resend, dotenv

## Project structure

```
docker-compose.yml  local postgres for development
backend/
  schema.sql        tables and seed data
  src/
    config/         database connection
    controllers/
    models/
    routes/
    services/       email
    server.js
frontend/
  src/
    app/            routes, pages and components
    context/        cart state
    lib/            api base url
```

## Database

PostgreSQL, hosted on Supabase. Two tables:

- `products`: available products
- `sales`: completed purchases, with the cart snapshot stored as `JSONB`

Ratings are stored as two columns, `rating_rate` and `rating_count`, and nested into a `rating`
object in the API response.

Schema and seed data (20 products): [`backend/schema.sql`](backend/schema.sql)

## Running locally

### 1. Database

Pick either option. Docker is faster and needs no account.

**Option A: Docker**

```bash
docker compose up -d
```

Starts PostgreSQL on port 5432 and applies [`backend/schema.sql`](backend/schema.sql)
automatically on the first run, creating both tables and inserting the products. This is the
value `.env.example` already ships with, so no editing is needed:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
```

The command returns before the database has finished initializing. Wait for
`docker compose ps` to report `healthy` before starting the backend.

To wipe it and start from a clean database, run `docker compose down -v` and bring it up again.

**Option B: Supabase**

1. Create a project at [supabase.com](https://supabase.com) and save the database password it
   asks you to define.
2. Open the **SQL Editor**, paste all of [`backend/schema.sql`](backend/schema.sql) and run it.
   This creates both tables and inserts the products.
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
cp .env.example .env   # then fill in DATABASE_URL and RESEND_API_KEY
node src/server.js
```

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

## Email confirmation

Checkout sends a confirmation email through Resend. On a Resend free account, emails only reach
the account owner's verified address. Sending to any other address fails, but the purchase is
still recorded and the API response reports whether the email went out.

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
