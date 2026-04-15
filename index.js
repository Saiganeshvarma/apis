require("dotenv").config();
var cors = require("cors");
var express = require("express");

const connectToDatabase = require("./database/db.js");
const { connectRedis } = require("./config/redisClient.js");
const { createLimiters } = require("./Middleware/rateLimiter");

// routes
var useRoutes = require("./Routes/userRoutes");
var productRoutes = require("./Routes/ProductRoutes.js");
var profileRoutes = require("./Routes/profileRoutes.js");
var cartRoutes = require("./Routes/cartRoutes.js");
var paymentRoutes = require("./Routes/paymentRoutes.js");
var orderRoutes = require("./Routes/orderRoutes.js");

var app = express();

app.use(cors());
app.use(express.json());



const startServer = async () => {
  // ✅ 1. Connect Redis FIRST
  await connectRedis();

  // ✅ 2. Create limiters AFTER Redis
  const { productLimiter, adminLimiter } = createLimiters();

  // ✅ 3. Apply limiters
  app.use("/api/productRoutes", productLimiter, productRoutes);
  app.use("/api/adminRoutes", adminLimiter); // optional for admin

  // routes
  app.use("/api/userRoutes", useRoutes);
  app.use("/api/profileRoutes", profileRoutes);
  app.use("/api/cartRoutes", cartRoutes);
  app.use("/api/paymentRoutes", paymentRoutes);
  app.use("/api/orderRoutes", orderRoutes);

  // DB
  await connectToDatabase();

  app.listen(process.env.PORT, () => {
    console.log("The server is running");
  });
};

startServer();