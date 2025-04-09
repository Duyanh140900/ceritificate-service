const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

// Cấu hình JWT Secret từ dự án .NET
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

/**
 * Middleware xác thực người dùng
 * Kiểm tra và xác thực JWT token từ header Authorization
 * Sử dụng token từ service login riêng biệt
 */
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực, truy cập bị từ chối",
      });
    }

    try {
      // Xác thực token trực tiếp sử dụng cùng JWT_SECRET với service login
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      // Nếu xác thực thành công, lưu thông tin người dùng vào request
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token đã hết hạn, vui lòng đăng nhập lại",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ, truy cập bị từ chối",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Lỗi xác thực: " + error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
};

module.exports = authenticate;
