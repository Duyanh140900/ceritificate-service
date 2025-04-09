const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Xác thực đăng nhập và tạo token
 * (Lưu ý: Đây là demo, trong thực tế cần kiểm tra thông tin đăng nhập từ database)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tên đăng nhập và mật khẩu",
      });
    }

    // Demo user (trong thực tế, bạn sẽ kiểm tra thông tin đăng nhập từ database)
    // Mảng người dùng demo
    const demoUsers = [
      {
        id: "1",
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "Admin User",
      },
      {
        id: "2",
        username: "instructor",
        password: "instructor123",
        role: "instructor",
        name: "Instructor User",
      },
      {
        id: "3",
        username: "student",
        password: "student123",
        role: "student",
        name: "Student User",
      },
    ];

    // Tìm người dùng
    const user = demoUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập không chính xác",
      });
    }

    // Tạo token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // Trả về token và thông tin người dùng
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi đăng nhập: " + error.message,
    });
  }
};

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
  login,
  getMe,
};
