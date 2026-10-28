# Maitland Hostesses – Backend

## Run locally
npm install
npm start

Open http://localhost:3000

## Endpoints
POST /api/login        { contact }
POST /api/booking      { user_contact, hostess, slot, price, paystack_ref }
POST /api/apply        { name, body, hours, message }
GET  /api/admin        returns recent users, bookings, applications

Data is stored in data/maitland.db (SQLite).

## Next steps
Wire the frontend (public/index.html) to call these endpoints after login, booking, and hostess application.
For production, deploy the whole folder to a Node host (Render, Railway, Fly.io, or your own VPS).
