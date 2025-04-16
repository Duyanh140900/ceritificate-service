const path = require("path");
const fs = require("fs");
const certificateService = require("../services/certificate.service");
const templateService = require("../services/template.service");
const { generateCertificateImage } = require("../utils/canvasGenerator");
const {
  generateCertificateId,
  getCertificateFilePath,
} = require("../utils/helpers");

const testCreateCerrificateByKafka = async (req, res) => {
  try {
    // const certificate = await certificateService.createCertificate(req.body);
    await certificateService.testCreateCerrificateByKafka(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo chứng chỉ thành công.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy danh sách chứng chỉ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCertificates = async (req, res) => {
  try {
    // Xử lý các bộ lọc từ query params
    const filter = {};

    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const certificates = await certificateService.getCertificates(filter);

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy chứng chỉ theo ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCertificateById = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Lấy chứng chỉ theo certificateId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCertificateByCertificateId = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateByCertificateId(
      req.params.certificateId
    );

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Tạo chứng chỉ mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCertificate = async (req, res) => {
  try {
    const newCertificate = await certificateService.createCertificate(req.body);

    res.status(201).json({
      success: true,
      data: newCertificate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Thu hồi chứng chỉ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const revokeCertificate = async (req, res) => {
  try {
    const certificate = await certificateService.revokeCertificate(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Tải file chứng chỉ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(
      req.params.id
    );

    const filePath = path.resolve(certificate.filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error("File chứng chỉ không tồn tại");
    }

    res.download(filePath, `${certificate.certificateId}.pdf`);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Xem trước file chứng chỉ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const previewCertificate = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(
      req.params.id
    );

    const filePath = path.resolve(certificate.filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error("File chứng chỉ không tồn tại");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${certificate.certificateId}.pdf"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Tạo và xem trước chứng chỉ từ template và dữ liệu trường
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generatePreview = async (req, res) => {
  try {
    const { templateId, fieldValues } = req.body;

    if (!templateId) {
      throw new Error("Thiếu thông tin template");
    }

    // Lấy template
    const template = await templateService.getTemplateById(templateId);
    if (!template) {
      throw new Error("Template không tồn tại");
    }

    // Tạo ID tạm thời cho file preview
    const previewId = `preview-${generateCertificateId("PREV")}`;
    const outputPath = path.resolve(
      `${process.env.UPLOAD_DIR}/previews/${previewId}.png`
    );

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Tạo dữ liệu chứng chỉ tạm thời
    const certificateData = {
      certificateId: previewId,
      fieldValues: fieldValues || {},
    };

    // Tạo ảnh chứng chỉ
    await generateCertificateImage(template, certificateData, outputPath);

    // Xác định loại MIME dựa trên phần mở rộng
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `inline; filename="${previewId}.png"`);

    // Trả về ảnh
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);

    // Thiết lập hàm xóa file sau 5 phút
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        fs.unlink(outputPath, (err) => {
          if (err) console.error(`Không thể xóa file preview: ${err.message}`);
        });
      }
    }, 5 * 60 * 1000); // 5 phút
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCertificates,
  getCertificateById,
  getCertificateByCertificateId,
  createCertificate,
  revokeCertificate,
  downloadCertificate,
  previewCertificate,
  generatePreview,
  testCreateCerrificateByKafka,
};
