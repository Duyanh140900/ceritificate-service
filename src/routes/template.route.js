const express = require("express");
const router = express.Router();
const templateController = require("../controllers/certificateTemplate.controller");
const { authenticate, authorize } = require("../middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       required:
 *         - name
 *         - backgroundImage
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động tạo bởi MongoDB
 *         name:
 *           type: string
 *           description: Tên của mẫu chứng chỉ
 *         description:
 *           type: string
 *           description: Mô tả về mẫu chứng chỉ
 *         backgroundImage:
 *           type: string
 *           description: URL của hình nền
 *         fields:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               x:
 *                 type: number
 *               y:
 *                 type: number
 *               fontSize:
 *                 type: number
 *               fontFamily:
 *                 type: string
 *               color:
 *                 type: string
 *           description: Các trường văn bản trên chứng chỉ
 *         isDefault:
 *           type: boolean
 *           description: Mẫu mặc định hay không
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
 *   name: Templates
 *   description: API quản lý mẫu chứng chỉ
 */

/**
 * @swagger
 * /api/templates/fonts:
 *   get:
 *     summary: Lấy danh sách font chữ có sẵn
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Danh sách font chữ
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
 *                     type: string
 */
router.get("/fonts", templateController.getAvailableFonts);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Lấy danh sách mẫu chứng chỉ
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách mẫu chứng chỉ
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
 *                     $ref: '#/components/schemas/Template'
 *       401:
 *         description: Không được phép truy cập
 *   post:
 *     summary: Tạo mẫu chứng chỉ mới
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - backgroundImage
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     x:
 *                       type: number
 *                     y:
 *                       type: number
 *                     fontSize:
 *                       type: number
 *                     fontFamily:
 *                       type: string
 *                     color:
 *                       type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Mẫu chứng chỉ đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép truy cập
 */
router
  .route("/")
  .get(authenticate, templateController.getAllTemplates)
  .post(authenticate, templateController.createTemplate);

/**
 * @swagger
 * /api/templates/default:
 *   get:
 *     summary: Lấy mẫu chứng chỉ mặc định
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Mẫu chứng chỉ mặc định
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       404:
 *         description: Không tìm thấy mẫu mặc định
 */
router.get("/default", templateController.getDefaultTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Lấy mẫu chứng chỉ theo ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của mẫu chứng chỉ
 *     responses:
 *       200:
 *         description: Thông tin mẫu chứng chỉ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       404:
 *         description: Không tìm thấy mẫu chứng chỉ
 *       401:
 *         description: Không được phép truy cập
 *   put:
 *     summary: Cập nhật mẫu chứng chỉ
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của mẫu chứng chỉ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mẫu chứng chỉ đã được cập nhật
 *       404:
 *         description: Không tìm thấy mẫu chứng chỉ
 *       401:
 *         description: Không được phép truy cập
 *   delete:
 *     summary: Xóa mẫu chứng chỉ
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của mẫu chứng chỉ
 *     responses:
 *       200:
 *         description: Mẫu chứng chỉ đã được xóa
 *       404:
 *         description: Không tìm thấy mẫu chứng chỉ
 *       401:
 *         description: Không được phép truy cập
 */
router
  .route("/:id")
  .get(authenticate, templateController.getTemplateById)
  .put(authenticate, templateController.updateTemplate)
  .delete(authenticate, templateController.deleteTemplate);

module.exports = router;
