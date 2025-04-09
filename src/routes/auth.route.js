const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware");

// Route: /api/auth/me - Lấy thông tin người dùng hiện tại (yêu cầu xác thực)
router.get("/me", authenticate, authController.getMe);

module.exports = router;
