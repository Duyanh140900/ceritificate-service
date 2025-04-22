const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động tạo bởi MongoDB
 *         userId:
 *           type: string
 *           description: ID người dùng từ hệ thống xác thực
 *         fullName:
 *           type: string
 *           description: Tên đầy đủ
 *         email:
 *           type: string
 *           description: Địa chỉ email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Vai trò người dùng
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API xác thực và quản lý người dùng
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Không được phép truy cập
 */
router.get("/me", authenticate, authController.getMe);

module.exports = router;
