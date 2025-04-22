const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificate.controller");
const { authenticate, authorize, checkOwnership } = require("../middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       required:
 *         - templateId
 *         - recipientId
 *         - recipientName
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động tạo bởi MongoDB
 *         certificateId:
 *           type: string
 *           description: Mã chứng chỉ duy nhất
 *         templateId:
 *           type: string
 *           description: ID của mẫu chứng chỉ
 *         recipientId:
 *           type: string
 *           description: ID của người nhận
 *         recipientName:
 *           type: string
 *           description: Tên người nhận
 *         courseName:
 *           type: string
 *           description: Tên khóa học
 *         issueDate:
 *           type: string
 *           format: date
 *           description: Ngày cấp chứng chỉ
 *         expiryDate:
 *           type: string
 *           format: date
 *           description: Ngày hết hạn chứng chỉ (nếu có)
 *         status:
 *           type: string
 *           enum: [active, revoked, expired]
 *           description: Trạng thái của chứng chỉ
 *         additionalFields:
 *           type: object
 *           description: Các trường bổ sung
 *         pdfUrl:
 *           type: string
 *           description: URL của tệp PDF chứng chỉ
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Thời gian tạo bản ghi
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Thời gian cập nhật bản ghi
 */

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: API quản lý chứng chỉ
 */

/**
 * @swagger
 * /api/certificates:
 *   get:
 *     summary: Lấy danh sách chứng chỉ
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng bản ghi mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách chứng chỉ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: Không được phép truy cập
 *   post:
 *     summary: Tạo chứng chỉ mới
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - recipientId
 *               - recipientName
 *               - courseName
 *             properties:
 *               templateId:
 *                 type: string
 *               recipientId:
 *                 type: string
 *               recipientName:
 *                 type: string
 *               courseName:
 *                 type: string
 *               additionalFields:
 *                 type: object
 *     responses:
 *       201:
 *         description: Chứng chỉ đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép truy cập
 */
router
  .route("/")
  .get(authenticate, certificateController.getCertificates)
  .post(authenticate, certificateController.createCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   get:
 *     summary: Lấy chứng chỉ theo ID
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của chứng chỉ
 *     responses:
 *       200:
 *         description: Thông tin chứng chỉ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Không tìm thấy chứng chỉ
 *       401:
 *         description: Không được phép truy cập
 */
router
  .route("/:id")
  .get(authenticate, certificateController.getCertificateById);

/**
 * @swagger
 * /api/certificates/verify/{certificateId}:
 *   get:
 *     summary: Xác thực chứng chỉ bằng mã chứng chỉ
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã chứng chỉ cần xác thực
 *     responses:
 *       200:
 *         description: Thông tin chứng chỉ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Không tìm thấy chứng chỉ
 */
router.get(
  "/verify/:certificateId",
  certificateController.getCertificateByCertificateId
);

/**
 * @swagger
 * /api/certificates/{id}/download:
 *   get:
 *     summary: Tải xuống tệp PDF chứng chỉ
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của chứng chỉ
 *     responses:
 *       200:
 *         description: Tệp PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Không tìm thấy chứng chỉ
 */
router.get("/:id/download", certificateController.downloadCertificate);

/**
 * @swagger
 * /api/certificates/{id}/preview:
 *   get:
 *     summary: Xem trước chứng chỉ
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của chứng chỉ
 *     responses:
 *       200:
 *         description: Hình ảnh xem trước chứng chỉ
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Không tìm thấy chứng chỉ
 */
router.get("/:id/preview", certificateController.previewCertificate);

/**
 * @swagger
 * /api/certificates/generate-preview:
 *   post:
 *     summary: Tạo và xem trước chứng chỉ
 *     tags: [Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - recipientName
 *               - courseName
 *             properties:
 *               templateId:
 *                 type: string
 *               recipientName:
 *                 type: string
 *               courseName:
 *                 type: string
 *               additionalFields:
 *                 type: object
 *     responses:
 *       200:
 *         description: Hình ảnh xem trước chứng chỉ
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/generate-preview", certificateController.generatePreview);

/**
 * @swagger
 * /api/certificates/{id}/revoke:
 *   put:
 *     summary: Thu hồi chứng chỉ
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của chứng chỉ
 *     responses:
 *       200:
 *         description: Chứng chỉ đã được thu hồi
 *       404:
 *         description: Không tìm thấy chứng chỉ
 *       401:
 *         description: Không được phép truy cập
 */
router.put(
  "/:id/revoke",
  authenticate,
  authorize("admin"),
  certificateController.revokeCertificate
);

/**
 * @swagger
 * /api/certificates/course-completed:
 *   post:
 *     summary: Tạo chứng chỉ khi khóa học hoàn thành (test Kafka)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseName:
 *                 type: string
 *               userData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Thông tin về việc tạo chứng chỉ
 *       401:
 *         description: Không được phép truy cập
 */
router.post(
  "/course-completed",
  authenticate,
  certificateController.testCreateCerrificateByKafka
);

module.exports = router;
