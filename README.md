# Service Quản lý Chứng chỉ

Dịch vụ quản lý và tạo chứng chỉ, cho phép tích hợp với các hệ thống khác thông qua Kafka.

## Tính năng chính

- Quản lý template chứng chỉ (CRUD)
- Tự động tạo chứng chỉ từ sự kiện hoàn thành khóa học
- Tạo chứng chỉ thủ công
- Xem trước và tải xuống chứng chỉ
- Thu hồi chứng chỉ
- Xác thực và phân quyền người dùng sử dụng token từ service login riêng

## Công nghệ sử dụng

- Node.js
- Express
- MongoDB
- Kafka
- PDFKit (tạo file PDF)
- JWT (JSON Web Token)

## Cài đặt

### Điều kiện tiên quyết

- Node.js (v14+)
- MongoDB
- Kafka
- Service login riêng (cung cấp JWT token)

### Cài đặt các gói phụ thuộc

```bash
npm install
```

### Biến môi trường

Tạo file `.env` trong thư mục gốc với các biến sau:

```
# Server Config
PORT=3000
NODE_ENV=development

# MongoDB Config
MONGODB_URI=mongodb://localhost:27017/certificate-service

# Kafka Config
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=certificate-service
KAFKA_GROUP_ID=certificate-service-group

# Upload Directory
UPLOAD_DIR=uploads

# JWT Config
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Authentication Service Config
AUTH_SERVICE_URL=http://localhost:4000/api/auth
AUTH_VERIFICATION_METHOD=jwt # 'api' hoặc 'jwt'
```

**Lưu ý về AUTH_VERIFICATION_METHOD:**

- `jwt`: Sử dụng cùng JWT_SECRET với service login để xác thực token trực tiếp.
- `api`: Gọi API đến service login để xác thực token.

## Chạy ứng dụng

### Chế độ phát triển

```bash
npm run dev
```

### Chế độ sản xuất

```bash
npm start
```

### Chế độ debug

```bash
npm run debug
```

## Xác thực và Phân quyền

Service sử dụng JWT (JSON Web Token) từ service login riêng để xác thực và phân quyền. Các vai trò người dùng:

- **admin**: Quyền quản trị, có thể truy cập tất cả API
- **instructor**: Giáo viên, có thể tạo chứng chỉ
- **student**: Học viên, quyền truy cập hạn chế

### Sử dụng Token

Đối với các API yêu cầu xác thực, token cần được gửi trong header:

```
Authorization: Bearer <token>
```

Token này được lấy từ service login riêng.

## API Endpoints

### Auth API

- `GET /api/auth/me` - Lấy thông tin người dùng (cần xác thực)

### Template API

- `GET /api/templates` - Lấy tất cả templates (cần xác thực)
- `POST /api/templates` - Tạo template mới (cần xác thực, chỉ admin)
- `GET /api/templates/default` - Lấy template mặc định
- `GET /api/templates/:id` - Lấy template theo ID (cần xác thực)
- `PUT /api/templates/:id` - Cập nhật template (cần xác thực, chỉ admin)
- `DELETE /api/templates/:id` - Xóa template (cần xác thực, chỉ admin)

### Certificate API

- `GET /api/certificates` - Lấy tất cả chứng chỉ (cần xác thực)
- `POST /api/certificates` - Tạo chứng chỉ mới (cần xác thực, admin hoặc instructor)
- `GET /api/certificates/:id` - Lấy chứng chỉ theo ID (cần xác thực)
- `GET /api/certificates/verify/:certificateId` - Xác thực chứng chỉ (công khai)
- `GET /api/certificates/:id/download` - Tải xuống chứng chỉ
- `GET /api/certificates/:id/preview` - Xem trước chứng chỉ
- `PUT /api/certificates/:id/revoke` - Thu hồi chứng chỉ (cần xác thực, chỉ admin)

## Kafka Integration

### Consumer Topics

- `course-completed` - Nhận thông báo khi học viên hoàn thành khóa học

### Producer Topics

- `certificate-generated` - Gửi thông báo khi chứng chỉ được tạo
- `certificate-revoked` - Gửi thông báo khi chứng chỉ bị thu hồi
