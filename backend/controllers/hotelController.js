// Import Hotel model
const Hotel = require("../models/Hotel");
const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

// Get hotels with filters + pagination + sorting
exports.getHotels = expressAsyncHandler(async (req, res) => {
  let {
    location,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};
  if (location) query.location = new RegExp(location, "i"); // Case-insensitive search
  
  if (minPrice && maxPrice) {
    query.pricePerNight = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  } else if (minPrice) {
    query.pricePerNight = { $gte: Number(minPrice) };
  } else if (maxPrice) {
    query.pricePerNight = { $lte: Number(maxPrice) };
  }

  // convert query params to numbers
  page = Number(page);
  limit = Number(limit);

  const hotels = await Hotel.find(query)
    .sort({ [sortBy]: order === "desc" ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Hotel.countDocuments(query);

  res.status(200).json({
    success: true,
    data: hotels,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get single hotel
exports.getHotelDetails = expressAsyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");
  res.status(200).json({ success: true, data: hotel });
});