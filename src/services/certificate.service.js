const path = require("path");
const fs = require("fs");
const Certificate = require("../models/certificate.model");
const { generateCertificateImage } = require("../utils/canvasGenerator");
const {
  generateCertificateId,
  getCertificateFilePath,
} = require("../utils/helpers");
const templateService = require("./template.service");
const { producer } = require("../config/kafka");

/**
 * Tạo chứng chỉ mới
 * @param {Object} certificateData - Dữ liệu chứng chỉ
 * @returns {Promise<Object>} - Chứng chỉ đã tạo
 */
const createCertificate = async (certificateData) => {
  try {
    // Tạo certificateId nếu chưa có
    if (!certificateData.certificateId) {
      certificateData.certificateId = generateCertificateId();
    }

    // Tạo đường dẫn file
    const filePath = getCertificateFilePath(
      certificateData.certificateId,
      "png"
    );
    certificateData.filePath = filePath;

    // Lấy template
    const template = certificateData.template
      ? await templateService.getTemplateById(certificateData.template)
      : await templateService.getDefaultTemplate();

    // Ghi log để debug
    console.log("Template được sử dụng:", template.name);
    console.log("fieldValues ban đầu:", certificateData.fieldValues);

    // Đảm bảo fieldValues tồn tại
    if (!certificateData.fieldValues) {
      certificateData.fieldValues = {};
    }

    // Thu thập tất cả các trường có trong template
    const templateFields = template.fields.map((field) => field.name);
    console.log("Các trường trong template:", templateFields);

    // Đảm bảo có các trường dữ liệu cơ bản
    if (
      !certificateData.fieldValues.studentName &&
      certificateData.studentName
    ) {
      certificateData.fieldValues.studentName = certificateData.studentName;
    }

    if (!certificateData.fieldValues.courseName && certificateData.courseName) {
      certificateData.fieldValues.courseName = certificateData.courseName;
    }

    // Định dạng ngày cấp nếu cần
    if (!certificateData.fieldValues.issueDate && certificateData.issueDate) {
      certificateData.fieldValues.issueDate = new Date(
        certificateData.issueDate
      ).toLocaleDateString("vi-VN");
    }

    // Thêm các trường khác từ data vào fieldValues
    for (const key in certificateData) {
      if (
        key !== "fieldValues" &&
        templateFields.includes(key) &&
        !certificateData.fieldValues[key]
      ) {
        certificateData.fieldValues[key] = certificateData[key];
      }
    }

    // Đảm bảo certificateId luôn có trong fieldValues
    certificateData.fieldValues.certificateId = certificateData.certificateId;

    console.log("fieldValues đã cập nhật:", certificateData.fieldValues);

    // Tạo ảnh chứng chỉ
    await generateCertificateImage(
      template,
      certificateData,
      path.resolve(filePath)
    );

    // Lưu chứng chỉ vào database
    certificateData.template = template._id;
    certificateData.status = "generated";

    const newCertificate = new Certificate(certificateData);
    await newCertificate.save();

    // Gửi thông báo qua Kafka (tùy chọn)
    await sendCertificateNotification(newCertificate);

    return newCertificate;
  } catch (error) {
    // Xóa file nếu có lỗi
    const filePath =
      certificateData.filePath ||
      getCertificateFilePath(certificateData.certificateId, "png");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Lỗi khi tạo chứng chỉ: ${error.message}`);
  }
};

/**
 * Lấy danh sách chứng chỉ
 * @param {Object} filter - Bộ lọc (tùy chọn)
 * @returns {Promise<Array>} - Danh sách chứng chỉ
 */
const getCertificates = async (filter = {}) => {
  try {
    return await Certificate.find(filter)
      .populate("template", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách chứng chỉ: ${error.message}`);
  }
};

/**
 * Lấy chứng chỉ theo ID
 * @param {string} id - ID của chứng chỉ
 * @returns {Promise<Object>} - Chứng chỉ tìm thấy
 */
const getCertificateById = async (id) => {
  try {
    const certificate = await Certificate.findById(id).populate("template");
    if (!certificate) {
      throw new Error("Chứng chỉ không tồn tại");
    }
    return certificate;
  } catch (error) {
    throw new Error(`Lỗi khi lấy chứng chỉ: ${error.message}`);
  }
};

/**
 * Lấy chứng chỉ theo certificateId
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<Object>} - Chứng chỉ tìm thấy
 */
const getCertificateByCertificateId = async (certificateId) => {
  try {
    const certificate = await Certificate.findOne({ certificateId }).populate(
      "template"
    );
    if (!certificate) {
      throw new Error("Chứng chỉ không tồn tại");
    }
    return certificate;
  } catch (error) {
    throw new Error(`Lỗi khi lấy chứng chỉ: ${error.message}`);
  }
};

/**
 * Xử lý chứng chỉ từ dữ liệu hoàn thành khóa học
 * @param {Object} courseCompletionData - Dữ liệu hoàn thành khóa học
 * @returns {Promise<Object>} - Chứng chỉ đã tạo
 */
const processCourseCompletion = async (courseCompletionData) => {
  try {
    const { studentId, studentName, studentEmail, courseId, courseName } =
      courseCompletionData;

    // Kiểm tra xem chứng chỉ đã tồn tại chưa
    const existingCertificate = await Certificate.findOne({
      studentId,
      courseId,
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    // Tạo chứng chỉ mới
    const certificateData = {
      studentId,
      studentName,
      studentEmail,
      courseId,
      courseName,
      issueDate: new Date(),
      fieldValues: {
        studentName,
        courseName,
        issueDate: new Date().toLocaleDateString("vi-VN"),
      },
    };

    return await createCertificate(certificateData);
  } catch (error) {
    throw new Error(`Lỗi khi xử lý hoàn thành khóa học: ${error.message}`);
  }
};

/**
 * Gửi thông báo chứng chỉ qua Kafka
 * @param {Object} certificate - Dữ liệu chứng chỉ
 * @returns {Promise<void>}
 */
const sendCertificateNotification = async (certificate) => {
  try {
    await producer.send({
      topic: "certificate-generated",
      messages: [
        {
          key: certificate.certificateId,
          value: JSON.stringify({
            certificateId: certificate.certificateId,
            studentId: certificate.studentId,
            studentName: certificate.studentName,
            studentEmail: certificate.studentEmail,
            courseId: certificate.courseId,
            courseName: certificate.courseName,
            issueDate: certificate.issueDate,
            status: certificate.status,
          }),
        },
      ],
    });
  } catch (error) {
    console.error(`Lỗi khi gửi thông báo chứng chỉ: ${error.message}`);
    // Ghi log lỗi nhưng không ảnh hưởng đến luồng chính
  }
};

/**
 * Thu hồi chứng chỉ
 * @param {string} id - ID của chứng chỉ
 * @returns {Promise<Object>} - Chứng chỉ đã thu hồi
 */
const revokeCertificate = async (id) => {
  try {
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      throw new Error("Chứng chỉ không tồn tại");
    }

    certificate.status = "revoked";
    await certificate.save();

    // Gửi thông báo qua Kafka
    await producer.send({
      topic: "certificate-revoked",
      messages: [
        {
          key: certificate.certificateId,
          value: JSON.stringify({
            certificateId: certificate.certificateId,
            studentId: certificate.studentId,
            studentEmail: certificate.studentEmail,
            status: "revoked",
          }),
        },
      ],
    });

    return certificate;
  } catch (error) {
    throw new Error(`Lỗi khi thu hồi chứng chỉ: ${error.message}`);
  }
};

module.exports = {
  createCertificate,
  getCertificates,
  getCertificateById,
  getCertificateByCertificateId,
  processCourseCompletion,
  revokeCertificate,
};
