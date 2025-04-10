const moment = require("moment");

/**
 * Chuyển đổi mã màu hex sang rgb
 * @param {string} hex - Mã màu hex (ví dụ: #FFFFFF)
 * @returns {Object} - Đối tượng chứa các giá trị r, g, b
 */
const hexToRgb = (hex) => {
  // Loại bỏ dấu # nếu có
  hex = hex.replace(/^#/, "");

  // Parse thành RGB
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

/**
 * Format ngày tháng
 * @param {Date|string} date - Ngày cần format
 * @param {string} format - Định dạng (mặc định: DD/MM/YYYY)
 * @returns {string} - Ngày đã được format
 */
const formatDate = (date, format = "DD/MM/YYYY") => {
  return moment(date).format(format);
};

/**
 * Tạo ID chứng chỉ duy nhất
 * @param {string} prefix - Tiền tố (mặc định: 'CERT')
 * @returns {string} - ID duy nhất
 */
const generateCertificateId = (prefix = "CERT") => {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${timestamp.slice(-8)}-${randomNum}`;
};

/**
 * Lấy đường dẫn tương đối cho file chứng chỉ
 * @param {string} certificateId - ID chứng chỉ
 * @param {string} fileType - Loại file (mặc định: 'pdf')
 * @returns {string} - Đường dẫn tương đối cho file chứng chỉ
 */
const getCertificateFilePath = (certificateId, fileType = "pdf") => {
  return `${process.env.UPLOAD_DIR}/${certificateId}.${fileType}`;
};

module.exports = {
  hexToRgb,
  formatDate,
  generateCertificateId,
  getCertificateFilePath,
};
