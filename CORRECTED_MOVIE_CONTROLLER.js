import Movie from "../models/Movie.model.js";
import Joi from "joi";
import slugify from "slugify";
import {
  uploadVideo,
  uploadImage,
  generateHLSUrl,
  generateStreamingUrl,
  generateThumbnail,
  deleteFile,
} from "../utils/cloudinary.js";
import fs from "fs";

// ====== VALIDATION SCHEMAS ======

const movieValidationSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  original_title: Joi.string().max(200),
  overview: Joi.string().max(2000),
  release_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  poster_path: Joi.string().uri().allow(""),
  backdrop_path: Joi.string().uri().allow(""),
  popularity: Joi.number().min(0),
  vote_average: Joi.number().min(0).max(10),
  vote_count: Joi.number().min(0),
  adult: Joi.boolean().default(false),
  video: Joi.boolean().default(false),
  genre_ids: Joi.array().items(Joi.number()),
  original_language: Joi.string().length(2),

  // Enhanced fields
  price: Joi.number().min(0).default(0),
  currency: Joi.string().valid("RWF", "EUR", "GHS", "XOF").default("RWF"),
  royaltyPercentage: Joi.number().min(0).max(100).default(70),
  videoQuality: Joi.string().valid("240p", "360p", "480p", "720p", "1080p", "4K").default("720p"),
  videoDuration: Joi.number().min(1),

  // Video and Image URLs (as plain URLs, not file uploads)
  streamingUrl: Joi.string().uri().allow(""),
  videoUrl: Joi.string().uri().allow(""),
  hlsUrl: Joi.string().uri().allow(""),
  poster: Joi.string().uri().allow(""),
  backdrop: Joi.string().uri().allow(""),
  thumbnail: Joi.string().uri().allow(""),

  allowDownload: Joi.boolean().default(true),
  downloadExpiry: Joi.number().min(1),

  categories: Joi.array().items(
    Joi.string().valid(
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Thriller",
      "Romance",
      "Documentary",
      "Animation",
      "Sci-Fi",
      "Fantasy"
    )
  ).default([]),

  tags: Joi.array().items(Joi.string()).default([]),
  keywords: Joi.array().items(Joi.string()).default([]),
  language: Joi.string(),
});

// Create update schema that makes all fields optional
const updateMovieSchema = movieValidationSchema.fork(
  ["title"],
  (schema) => schema.optional()
);

// ====== HELPER FUNCTIONS ======

const handleValidationError = (error, res) => {
  const message = error.details
    .map((detail) => detail.message)
    .join(", ");
  return res.status(400).json({
    message: "Validation error",
    error: message,
    details: error.details
  });
};

// Convert comma-separated strings to arrays
const parseFormData = (body) => {
  const parsed = { ...body };

  // Convert string arrays to actual arrays if they come as strings
  if (typeof parsed.tags === "string") {
    parsed.tags = parsed.tags.split(",").map(t => t.trim()).filter(t => t);
  }
  if (typeof parsed.keywords === "string") {
    parsed.keywords = parsed.keywords.split(",").map(k => k.trim()).filter(k => k);
  }
  if (typeof parsed.categories === "string") {
    parsed.categories = parsed.categories.split(",").map(c => c.trim()).filter(c => c);
  }

  // Parse numbers
  if (parsed.price) parsed.price = Number(parsed.price);
  if (parsed.royaltyPercentage) parsed.royaltyPercentage = Number(parsed.royaltyPercentage);
  if (parsed.videoDuration) parsed.videoDuration = Number(parsed.videoDuration);
  if (parsed.downloadExpiry) parsed.downloadExpiry = Number(parsed.downloadExpiry);

  // Parse booleans
  if (parsed.allowDownload) {
    parsed.allowDownload = parsed.allowDownload === "true" || parsed.allowDownload === true;
  }

  return parsed;
};

// ====== CRUD OPERATIONS ======

// 📌 Upload/Create Movie (Filmmaker)
export const addMovie = async (req, res) => {
  try {
    // Parse form data to handle string arrays
    const parsedBody = parseFormData(req.body);

    const { error, value } = movieValidationSchema.validate(parsedBody);
    if (error) return handleValidationError(error, res);

    // Create slug from title
    const slug = slugify(value.title, { lower: true, strict: true });

    // Prepare movie data
    const movieData = {
      ...value,
      slug,
      filmmaker: {
        filmamakerId: req.userId, // From JWT middleware
        name: req.userName || "Anonymous Filmmaker",
      },
      status: req.userRole === "admin" ? "approved" : "submitted",
      submittedAt: new Date(),
      uploadedAt: new Date(),
    };

    // Create new movie
    const movie = new Movie(movieData);
    await movie.save();

    res.status(201).json({
      message: "Movie added successfully",
      movie,
      nextStep: req.userRole !== "admin" ? "Awaiting admin approval" : "Movie approved",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📌 Get All Movies (Public)
export const getAllMovies = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "approved", category } = req.query;

    let query = { status };
    if (category) {
      query.categories = category;
    }

    const movies = await Movie.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      message: "Movies retrieved successfully",
      movies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📌 Get Movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate("filmmaker.filmamakerId");

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Increment view count
    movie.totalViews = (movie.totalViews || 0) + 1;
    await movie.save();

    res.status(200).json({
      message: "Movie retrieved successfully",
      movie,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📌 Update Movie (Filmmaker/Admin)
export const updateMovie = async (req, res) => {
  try {
    const parsedBody = parseFormData(req.body);
    const { error, value } = updateMovieSchema.validate(parsedBody);

    if (error) return handleValidationError(error, res);

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check authorization
    if (req.userRole !== "admin" && movie.filmmaker.filmamakerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this movie" });
    }

    // Update slug if title changed
    if (value.title) {
      value.slug = slugify(value.title, { lower: true, strict: true });
    }

    Object.assign(movie, value);
    movie.lastUpdated = new Date();
    await movie.save();

    res.status(200).json({
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📌 Delete Movie (Filmmaker/Admin)
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check authorization
    if (req.userRole !== "admin" && movie.filmmaker.filmamakerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this movie" });
    }

    // Delete files from cloud storage if needed
    if (movie.posterPublicId) {
      await deleteFile(movie.posterPublicId);
    }
    if (movie.backdropPublicId) {
      await deleteFile(movie.backdropPublicId);
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📌 Search Movies
export const searchMovies = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    let query = { status: "approved" };

    if (q) {
      query.$text = { $search: q };
    }

    if (category) {
      query.categories = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const movies = await Movie.find(query).limit(20);

    res.status(200).json({
      message: "Search completed successfully",
      movies,
      count: movies.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// 📌 Get Filmmaker's Movies
export const getFilmmakerMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      "filmmaker.filmamakerId": req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Filmmaker movies retrieved successfully",
      movies,
      count: movies.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

export default {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  searchMovies,
  getFilmmakerMovies,
};
