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
| POST | `/api/checkout` | Finalize purchase (guest with `customer_email`, or logged in) |
| POST | `/api/auth/register` | Create an account (role `customer`) |
| POST | `/api/auth/login` | Returns a JWT and the user's permissions (rate limited) |
| GET | `/api/auth/me` | Current user and permissions |
| GET | `/api/orders` | Own orders, or all orders with `order:read:any` |
| GET | `/api/product/:id/recommendations` | "Customers also bought" (optional `?limit=1..20`, default 4) |
| GET | `/api/recommendations` | Recommendations for the logged in user (default 8) |
| POST | `/api/product` | Create a product (`product:write`) |
| PUT | `/api/product/:id` | Edit a product (`product:write`) |

The cart is kept in memory in the backend, as allowed by the challenge. It has no table of its
own and resets when the server restarts.

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

**Frontend:** Next.js (App Router), React, Tailwind CSS, Context API, LocalStorage

**Backend:** Node.js, Express, PostgreSQL (Supabase), pg, JWT, bcrypt, Resend, dotenv

## Project structure

```
docker-compose.yml  local postgres for development
backend/
  schema.sql        tables and seed data
  migrations/       incremental SQL (001_rbac.sql, 002_sale_items.sql)
  scripts/          grant-role.js, seed-demo-data.js
  src/
    modules/        one folder per bounded context
      catalog/      products
      cart/         in-memory cart
      ordering/     checkout and orders
      identity/     sign up, login, JWT, permission middleware
      recommendation/  collaborative filtering over the purchase history
        domain/       rules, no framework or database
        application/  use cases
        infra/        routes, controllers, repositories, adapters (pg, bcrypt, Resend)
        index.js      wires the module
    shared/         database pool, AppError, error handler, validation, permission names
    app.js          composition root: builds the modules and mounts the routes
    server.js
frontend/
  src/
    app/            routes, pages and components
    context/        cart and auth state
    lib/            api base url
```

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

## Email confirmation

Checkout sends a confirmation email through Resend. On a Resend free account, emails only reach
the account owner's verified address. Sending to any other address fails, but the purchase is
still recorded and the API response reports whether the email went out.

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
