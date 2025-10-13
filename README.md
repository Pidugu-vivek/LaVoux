# LaVoux MERN E‑commerce

A full‑stack MERN (MongoDB, Express, React, Node.js) e‑commerce app with a customer storefront and an admin panel.

## Stack
- Backend: Node.js + Express + MongoDB/Mongoose
- Frontend (Storefront): React + Vite
- Admin: React + Vite
- Auth: JWT
- Media: Cloudinary (optional)
- Email: Nodemailer (SMTP or test account)

## Apps & Folders
- `backend/` – Express API, DB models, controllers, routes
- `frontend/` – Customer web app
- `admin/` – Admin dashboard

## Prerequisites
- Node.js 18+ (recommended LTS) and npm
- MongoDB connection string (Atlas or local)
- Optional: Cloudinary account for product images
- Optional: SMTP creds for email (issues resolution, newsletter)

## Quick Start

### 1) Backend
1. Create `backend/.env` (example):
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=supersecret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (production)
EMAIL_HOST=smtp.yourhost.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_user
EMAIL_PASS=your_pass
EMAIL_FROM=Support <support@yourdomain.com>
FRONTEND_URL=http://localhost:5173
```
2. Install deps and run:
```
cd backend
npm install
npm run server
```
The API runs at `http://localhost:4000`.

### 2) Frontend (Storefront)
1. Create `frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:4000
```
2. Install and run:
```
cd frontend
npm install
npm run dev
```
App at `http://localhost:5173` (default Vite port).

### 3) Admin
1. Create `admin/.env`:
```
VITE_BACKEND_URL=http://localhost:4000
```
2. Install and run:
```
cd admin
npm install
npm run dev
```
Admin at `http://localhost:5174` (or as shown by Vite).

## Key Features
- Products, cart, checkout, orders (COD + Stripe)
- Address book with first/last name and phone
- Profile management
- Reviews & ratings
- Newsletter with welcome coupon
- Banners management
- Issues/Support system
  - User submits issue on `Contact` page (front end)
  - Admin manages issues in admin `/issues`
  - Auto email to reporter when an issue is marked resolved

## Useful Endpoints (high level)
- Products: `/api/product/*`
- Cart: `/api/cart/*`
- Orders: `/api/order/*`
- User: `/api/user/*`
- Reviews: `/api/product/:id/reviews`
- Newsletter: `/api/newsletter/*`
- Banners: `/api/banner/*`
- Issues: `/api/issue`
  - POST `/api/issue` – create issue (public or with token)
  - GET `/api/issue` – list issues (admin)
  - GET `/api/issue/:id` – get single (admin)
  - PATCH `/api/issue/:id` – update status/notes (admin)

## Admin Login
The admin dashboard expects a valid admin JWT token. Make sure your user creation flow or seed script sets an admin role and that `adminAuth` middleware matches your token payload.

## Email Delivery
- In development, if SMTP env vars are not set, Nodemailer uses a test account and logs a preview URL in the backend console.
- In production, set `EMAIL_*` vars and `EMAIL_FROM`.

## Bulk Product Import (optional enhancement)
For large catalogs, add a bulk endpoint (admin only):
```
POST /api/product/bulk
{
  "products": [ { "name": "...", "price": 100, "imageUrls": ["..."], "category": "Women", "subCategory": "Topwear", "sizes": ["S","M"], "bestseller": false } ]
}
```
This is not enabled by default but easy to add to `routes/productRoute.js` and controller.

## Troubleshooting
- Ensure all three apps point to the same backend URL via their `.env`.
- If cart clears and a success animation is not visible: we gate redirects to allow animations to display.
- Email errors don’t block API responses; check backend logs for details.

## Scripts
- Backend: `npm run server` (nodemon), `npm start`
- Frontend/Admin: `npm run dev`, `npm run build`, `npm run preview`

## License
MIT (or as you choose)
