const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// Import swagger
const { swaggerUi, swaggerDocs } = require("./utils/swagger");

// Import routes
const templateRoutes = require("./routes/template.route");
const certificateRoutes = require("./routes/certificate.route");
const authRoutes = require("./routes/auth.route");

// Khởi tạo app
const app = express();

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static fonts from /fonts
app.use(
  "/fonts",
  express.static(path.join(__dirname, "../fonts"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 Quan trọng cho CORS
    },
  })
);

// Serve static files (uploads directory)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", process.env.UPLOAD_DIR))
);

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, { explorer: true })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/certificates", certificateRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Certificate service is running",
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Certificate Service API",
    version: "1.0",
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
