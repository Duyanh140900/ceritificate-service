const CertificateTemplate = require("../models/certificateTemplate.model");

/**
 * Tạo template mới
 * @param {Object} templateData - Dữ liệu template
 * @returns {Promise<Object>} - Template đã tạo
 */
const createTemplate = async (templateData) => {
  try {
    // Nếu template mới được đánh dấu là mặc định, cập nhật các template khác thành không mặc định
    if (templateData.isDefault) {
      await CertificateTemplate.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const newTemplate = new CertificateTemplate(templateData);
    await newTemplate.save();
    return newTemplate;
  } catch (error) {
    throw new Error(`Lỗi khi tạo template: ${error.message}`);
  }
};

/**
 * Lấy danh sách tất cả template
 * @param {Object} filter - Bộ lọc (tùy chọn)
 * @returns {Promise<Array>} - Danh sách template
 */
const getAllTemplates = async (filter = {}) => {
  try {
    return await CertificateTemplate.find(filter).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách template: ${error.message}`);
  }
};

/**
 * Lấy template theo ID
 * @param {string} id - ID của template
 * @returns {Promise<Object>} - Template tìm thấy
 */
const getTemplateById = async (id) => {
  try {
    const template = await CertificateTemplate.findById(id);
    if (!template) {
      throw new Error("Template không tồn tại");
    }
    return template;
  } catch (error) {
    throw new Error(`Lỗi khi lấy template: ${error.message}`);
  }
};

/**
 * Lấy template mặc định
 * @returns {Promise<Object>} - Template mặc định
 */
const getDefaultTemplate = async () => {
  try {
    const template = await CertificateTemplate.findOne({ isDefault: true });
    if (!template) {
      throw new Error("Không tìm thấy template mặc định");
    }
    return template;
  } catch (error) {
    throw new Error(`Lỗi khi lấy template mặc định: ${error.message}`);
  }
};

/**
 * Cập nhật template
 * @param {string} id - ID của template
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Template đã cập nhật
 */
const updateTemplate = async (id, updateData) => {
  try {
    // Nếu template được cập nhật thành mặc định, cập nhật các template khác thành không mặc định
    if (updateData.isDefault) {
      await CertificateTemplate.updateMany(
        { _id: { $ne: id }, isDefault: true },
        { isDefault: false }
      );
    }

    const updatedTemplate = await CertificateTemplate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      throw new Error("Template không tồn tại");
    }

    return updatedTemplate;
  } catch (error) {
    throw new Error(`Lỗi khi cập nhật template: ${error.message}`);
  }
};

/**
 * Xóa template
 * @param {string} id - ID của template
 * @returns {Promise<boolean>} - Kết quả xóa
 */
const deleteTemplate = async (id) => {
  try {
    const template = await CertificateTemplate.findById(id);

    if (!template) {
      throw new Error("Template không tồn tại");
    }

    // Không cho phép xóa template mặc định
    if (template.isDefault) {
      throw new Error("Không thể xóa template mặc định");
    }

    await CertificateTemplate.findByIdAndDelete(id);
    return true;
  } catch (error) {
    throw new Error(`Lỗi khi xóa template: ${error.message}`);
  }
};

module.exports = {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  getDefaultTemplate,
  updateTemplate,
  deleteTemplate,
};
