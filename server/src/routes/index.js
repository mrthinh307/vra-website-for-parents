const express = require("express");
const router = express.Router();

// Import routes
const authRoutes = require("./auth.routes");
const systemRoutes = require("./system.routes");

// Use routes
router.use("/auth", authRoutes);
router.use("/system", systemRoutes);

module.exports = router;
