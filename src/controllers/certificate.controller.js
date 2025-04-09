const path = require("path");
const fs = require("fs");
const certificateService = require("../services/certificate.service");

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

module.exports = {
  getCertificates,
  getCertificateById,
  getCertificateByCertificateId,
  createCertificate,
  revokeCertificate,
  downloadCertificate,
  previewCertificate,
};
