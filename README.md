#E-commerce Application (Frontend + Backend)
  
**This project is a full-stack e-commerce application developed as part of a technical challenge.**
**The application simulates an online store with product listing, shopping cart management, and checkout flow, integrating a React/Next.js frontend with a Node.js + PostgreSQL backend.**
**The focus of the project is clean architecture, API communication, state management, and persistence of data.**


## Features

### Frontend
- Product listing with name, description, price and image
- Individual product page
- Shopping cart with:
  - Add products
  - Update quantities
  - Remove items
  - Item subtotal calculation
- Total purchase value calculation
- Checkout flow with email input and validation
- Integration with backend API
- Responsive layout

### Backend
- RESTful API for e-commerce operations
- Endpoints:
  - `GET /api/product` – list all products
  - `GET /api/product/:id` – get product details
  - `POST /api/cart` – add items to cart (in-memory)
  - `PUT /api/cart` – update cart items
  - `POST /api/checkout` – finalize purchase
- Purchase persistence in PostgreSQL database
- Email confirmation sent on checkout (testing mode)

  
## Technologies

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Context API
- LocalStorage

### Backend
- Node.js
- Express
- PostgreSQL
- pg (node-postgres)
- Resend (email service)
- dotenv


## Project Structure

### frontend/
- src/
- app/
- components/
- context/
    
### backend/
- src/
- controllers/
- models/
- routes/
- services/
- config/
- server.js


## Database
The project uses PostgreSQL as a relational database.
Main tables:
- `products` – stores available products
- `sales` – stores completed purchases and cart snapshot
- `cart` – temporary cart storage (optional, in-memory currently used)

- Product ratings are stored using separate fields (`rating_rate` and `rating_count`) and formatted in the API response to match frontend expectations.


## Email Confirmation
The checkout process attempts to send a purchase confirmation email using the Resend service.

Due to Resend testing limitations:
- Emails can only be sent to the verified email address of the account owner
- When sending to other emails, the purchase is still completed successfully
- The API response informs whether the email was sent or skipped

This behavior is intentional and documented to comply with the challenge requirements while respecting the email provider constraints.


## Running the project locally

### Backend
1. Navigate to the backend folder:
`cd backend`

2. Install dependencies:
`npm install`

3. Create a .env file in the backend root:
`RESEND_API_KEY=your_resend_api_key`

4. Start the server:
`node src/server.js`

Backend will run on:
`http://localhost:3333`

### Frontend
1. Navigate to the frontend folder:
`cd frontend`

2. Install dependencies:
`npm install`

3. Run the development server:
`npm run dev`

Frontend will be available at:
`http://localhost:3000`


## Notes
- The cart is stored in memory for simplicity, as allowed by the challenge
- The project prioritizes clarity, separation of concerns and clean code
- The backend is ready to be extended with authentication, payment integration or persistent carts


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

