const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const nodeCron = require('node-cron');
const Booking = require('./models/Booking');
const Room = require('./models/Room');
const  helmet = require('helmet');
const  rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');

const app = express();

// Middleware
app.use(cors({
   origin:"http://localhost:3000",
  credentials: true
 }));  // Enable CORS for frontend communication
app.use(express.json());    // Parse JSON bodies
app.use(cookieParser());    // Parse cookies
app.set('trust proxy', 1);
app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 429,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    code: 429,
    message: 'Too many login attempts. Try again later.'
  }
});
// Routes
app.get("/", (req, res) => res.send("Hotel Booking API running ✅"));
app.use('/api/admin', require('./routes/adminRoutes')); // All admin routes for where admin permission required 
app.use('/api/auth',authLimiter , require('./routes/authRoutes'));  // Authentication routes
app.use('/api/users', require('./routes/userRoutes')); // User routes
app.use('/api/hotels', require('./routes/hotelRoutes'));  // Hotel routes
app.use('/api/rooms', require('./routes/roomRoutes'));  // Room routes
app.use('/api/bookings', require('./routes/bookingRoutes'));  // Booking routes

app.use(errors());

// Catch-all route for unmatched requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// Error handling middleware
app.use(errorHandler);  // Handle error globally

// Scheduled task with node-cron to update room availability
nodeCron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  console.log(`Cron Job Running at ${now}`);

  const completedBookings = await Booking.find({
    status: 'confirmed',
    checkOut: { $lt: now },
  }).populate('roomId');

  for (const booking of completedBookings) {
    if (booking.roomId && !booking.roomId.isAvailable) {
      await Room.findByIdAndUpdate(booking.roomId._id, { isAvailable: true });
      await Booking.findByIdAndUpdate(booking._id, { status: 'completed' });
    }
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

module.exports = app;