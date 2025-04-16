const templateService = require("../services/template.service");
const fs = require("fs");
const path = require("path");
const fontkit = require("fontkit");

const getAvailableFonts = async (req, res) => {
  try {
    const fontDir = path.join(__dirname, "../../fonts");
    fs.readdir(fontDir, (err, files) => {
      if (err) return res.status(500).send("Error");
      const fonts = files
        .filter((f) => f.endsWith(".ttf") || f.endsWith(".woff2"))
        .map((f) => {
          const fontPath = path.join(fontDir, f);
          // Đăng ký font với fontkit
          const font = fontkit.openSync(fontPath);
          // Kiểm tra các bảng đặc trưng của color font
          const { tables } = font.directory;
          const isCOLR = !!tables.COLR;
          const isCPAL = !!tables.CPAL;
          const isSVG = !!tables.SVG;
          const isCBDT = !!tables.CBDT;

          console.log("Font:", font.fullName);
          console.log("Is Color Font (COLR+CPAL):", isCOLR && isCPAL);
          console.log("Has COLR:", isCOLR);
          console.log("Has CPAL:", isCPAL);
          console.log("Has SVG:", isSVG);
          console.log("Has CBDT:", isCBDT);

          return {
            name: f.replace(/\.[^/.]+$/, ""), // bỏ đuôi
            url: `/fonts/${f}`,
            isFontColor: isCOLR && isCPAL,
          };
        });
      res.status(200).json({ fonts });
    });
  } catch (error) {
    console.error("Error reading fonts directory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Lấy danh sách tất cả template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTemplates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive === "true") {
      filter.isActive = true;
    }

    const templates = await templateService.getAllTemplates(filter);

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy template theo ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTemplateById = async (req, res) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy template mặc định
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDefaultTemplate = async (req, res) => {
  try {
    const defaultTemplate = await templateService.getDefaultTemplate();

    res.status(200).json({
      success: true,
      data: defaultTemplate,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Tạo template mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTemplate = async (req, res) => {
  try {
    const newTemplate = await templateService.createTemplate(req.body);

    res.status(201).json({
      success: true,
      data: newTemplate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cập nhật template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTemplate = async (req, res) => {
  try {
    const updatedTemplate = await templateService.updateTemplate(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Xóa template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTemplate = async (req, res) => {
  try {
    await templateService.deleteTemplate(req.params.id);

    res.status(200).json({
      success: true,
      message: "Template đã được xóa",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAvailableFonts,
  getAllTemplates,
  getTemplateById,
  getDefaultTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
