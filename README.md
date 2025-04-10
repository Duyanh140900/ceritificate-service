# Certificate Service

Dịch vụ quản lý chứng chỉ cho hệ thống đào tạo, cho phép tạo và xác minh chứng chỉ điện tử.

## Chức năng chính

- Quản lý template chứng chỉ
- Tạo chứng chỉ từ template
- Xác minh chứng chỉ
- Xem trước chứng chỉ
- Xuất ảnh và PDF chứng chỉ

## Cài đặt

### Yêu cầu hệ thống

- Node.js (phiên bản >= 18)
- MongoDB
- Kafka (tùy chọn, cho phần xử lý sự kiện)

### Cài đặt thư viện

```bash
npm install
```

### Biến môi trường

Tạo file `.env` với các biến:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/certificate-service
JWT_SECRET=your_jwt_secret
UPLOAD_DIR=uploads
BASE_URL=http://localhost:3001
```

### Khởi động

```bash
# Chế độ phát triển
npm run dev

# Chế độ production
npm start
```

## Tạo Ảnh Chứng Chỉ

Dịch vụ này cho phép tạo ảnh chứng chỉ dựa trên template và dữ liệu trường. Ảnh chứng chỉ có thể được tùy chỉnh theo yêu cầu.

### API Tạo Chứng Chỉ

1. **Tạo Chứng Chỉ**

   ```
   POST /api/certificates
   ```

   Body:

   ```json
   {
     "studentId": "SV123",
     "studentName": "Nguyễn Văn A",
     "studentEmail": "student@example.com",
     "courseId": "CS101",
     "courseName": "Lập Trình Java",
     "template": "61234567890abcdef1234567", // ID của template (tùy chọn)
     "fieldValues": {
       "studentName": "Nguyễn Văn A",
       "courseName": "Lập Trình Java",
       "issueDate": "01/08/2023",
       "validUntil": "01/08/2025"
     }
   }
   ```

2. **Xem Trước Chứng Chỉ**

   ```
   POST /api/certificates/generate-preview
   ```

   Body:

   ```json
   {
     "templateId": "61234567890abcdef1234567",
     "fieldValues": {
       "studentName": "Nguyễn Văn A",
       "courseName": "Lập Trình Java",
       "issueDate": "01/08/2023",
       "validUntil": "01/08/2025"
     }
   }
   ```

   Response: Trả về hình ảnh chứng chỉ dạng PNG.

3. **Tải Chứng Chỉ**

   ```
   GET /api/certificates/:id/download
   ```

4. **Xem Trước Chứng Chỉ Đã Tạo**

   ```
   GET /api/certificates/:id/preview
   ```

### Các Trường Dữ Liệu Hỗ Trợ

Dưới đây là các trường dữ liệu có thể được sử dụng trong template:

- `studentName`: Tên học viên
- `courseName`: Tên khóa học
- `certificateId`: ID chứng chỉ
- `issueDate`: Ngày cấp
- `validUntil`: Ngày hết hạn
- `instructor`: Tên giảng viên
- `grade`: Điểm số
- `achievement`: Thành tích đạt được

## Tính năng nâng cao

- **Xác minh QR Code**: Mỗi chứng chỉ được tạo ra sẽ có mã QR để xác minh tính xác thực
- **Tùy chỉnh template**: Cho phép người dùng tạo và tùy chỉnh mẫu chứng chỉ
- **Hỗ trợ nhiều ngôn ngữ**: Tự động điều chỉnh font chữ và định dạng theo ngôn ngữ

## Liên hệ và hỗ trợ

Nếu cần hỗ trợ, vui lòng liên hệ:

- Email: support@example.com
- Trang web: https://example.com/support
