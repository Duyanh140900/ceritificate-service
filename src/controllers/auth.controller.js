const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Lấy thông tin người dùng hiện tại từ token
 * Token được cung cấp từ service login riêng biệt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMe = async (req, res) => {
  try {
    // Thông tin người dùng đã được thêm vào req.user từ middleware authenticate
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin người dùng: " + error.message,
    });
  }
};

module.exports = {
  getMe,
};
