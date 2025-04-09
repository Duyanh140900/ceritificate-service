/**
 * Middleware phân quyền người dùng
 * Kiểm tra xem người dùng có quyền truy cập vào tài nguyên hay không
 * @param  {...String} roles - Danh sách các vai trò được phép
 * @returns {Function} - Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Kiểm tra xem middleware auth đã được chạy trước đó chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng, vui lòng xác thực trước",
      });
    }

    // Kiểm tra xem người dùng có vai trò phù hợp không
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập vào tài nguyên này",
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền sở hữu
 * Chỉ cho phép người dùng truy cập tài nguyên của chính họ
 * @param {String} paramIdField - Tên trường ID trong params (mặc định: 'id')
 * @param {String} userIdField - Tên trường ID người dùng trong token (mặc định: 'id')
 * @returns {Function} - Middleware function
 */
const checkOwnership = (paramIdField = "id", userIdField = "id") => {
  return async (req, res, next) => {
    try {
      // Kiểm tra xem middleware auth đã được chạy trước đó chưa
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Không tìm thấy thông tin người dùng, vui lòng xác thực trước",
        });
      }

      // Cho phép admin truy cập tất cả tài nguyên
      if (req.user.role === "admin") {
        return next();
      }

      const resourceId = req.params[paramIdField];
      const userId = req.user[userIdField];

      // Nếu không có ID tài nguyên, cho phép truy cập (ví dụ: danh sách tài nguyên)
      if (!resourceId) {
        return next();
      }

      // Xác định quyền sở hữu (thường cần truy vấn database)
      // Đây là ví dụ đơn giản, trong thực tế bạn cần kiểm tra từ database

      // Ví dụ check quyền sở hữu trực tiếp từ request params
      if (resourceId === userId) {
        return next();
      }

      // Trường hợp không có quyền sở hữu
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập vào tài nguyên này",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra quyền sở hữu: " + error.message,
      });
    }
  };
};

module.exports = {
  authorize,
  checkOwnership,
};
