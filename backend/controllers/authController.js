const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

// Signup controller
exports.signup = expressAsyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (role && !["User", "Admin"].includes(role)) {
      throw new ApiError(400, "Invalid role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, "Email already exists");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create new user
  const user = new User({ username, email, password: hashedPassword, role });
  await user.save();
  res.status(201).json({ success: true, message: "User created successfully" });
});

// Login controller
exports.login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Find user by email
  const user = await User.findOne({ email });
  if (!user)
    throw new ApiError(401, "Invalid credentials or User not found"); // Pass error to error handler
  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials"); // Pass error to error handler
  // Generate JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  // Set token in cookie
  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 days
    })
    .json({
      success: true,
      message: `User ${user.email} Logged in`,
      token,
      role: user.role,
    });
});

exports.logout = expressAsyncHandler((req, res) => {
  const user = req.user; // Set by authenticate middleware
  console.log(`User ${user.email} with role ${user.role} is logging out`);

  res.clearCookie("token");
  res
    .status(200)
    .json({
      success: true,
      message: `User |${user.email}| logged out successfully`,
    });
});

// Delete user (admin 0nly)
exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if(!deleted) throw new ApiError(404, "User not found");
  res.json({ success: true, message: "User Deleted" });
});
