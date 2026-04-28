require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectToDatabase = require("./database/db.js");
const { connectRedis } = require("./config/redisClient.js");
const { createLimiters } = require("./Middleware/rateLimiter");

const userRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/ProductRoutes.js");
const profileRoutes = require("./Routes/profileRoutes.js");
const cartRoutes = require("./Routes/cartRoutes.js");
const paymentRoutes = require("./Routes/paymentRoutes.js");
const orderRoutes = require("./Routes/orderRoutes.js");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── REQUEST LOGGING ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  const morgan = require("morgan");
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── STARTUP ─────────────────────────────────────────────────────────────────
const startServer = async () => {
  // validate required env vars before anything else
  const required = [
    "MONGO_URL",
    "JWT_TOKEN",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "REDIS_URL",
    "PORT",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  await connectRedis();
  await connectToDatabase();

  const { productLimiter, authLimiter } = createLimiters();

  // ─── ROUTES ────────────────────────────────────────────────────────────────
  app.use("/api/userRoutes", authLimiter, userRoutes);
  app.use("/api/productRoutes", productLimiter, productRoutes);
  app.use("/api/profileRoutes", profileRoutes);
  app.use("/api/cartRoutes", cartRoutes);
  app.use("/api/paymentRoutes", paymentRoutes);
  app.use("/api/orderRoutes", orderRoutes);

  // ─── 404 HANDLER ───────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // ─── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
