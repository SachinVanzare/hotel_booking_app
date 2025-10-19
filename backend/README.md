# Hotel Booking App Backend

## Setup
1. Install dependencies: `npm install`
2. Create `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`
3. Run server: `npm start`

## API Endpoints
- **POST /api/auth/signup**: Register a new user
- **POST /api/auth/login**: Login and get JWT
- **DELETE /api/auth/users/:id**: Delete a user (admin)
- **GET /api/hotels**: Search hotels
- **GET /api/hotels/:id**: Get hotel details
- **POST /api/hotels**: Add hotel (admin)
- **GET /api/rooms/:hotelId**: Get rooms for a hotel
- **POST /api/rooms/:hotelId**: Add room (admin)
- **POST /api/bookings**: Create booking
- **GET /api/bookings**: Get user bookings