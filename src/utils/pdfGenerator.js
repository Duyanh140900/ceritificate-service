const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { hexToRgb } = require("./helpers");

/**
 * Tạo file PDF chứng chỉ dựa trên template và dữ liệu
 * @param {Object} template - Template chứng chỉ
 * @param {Object} data - Dữ liệu chứng chỉ
 * @param {string} outputPath - Đường dẫn lưu file PDF
 * @returns {Promise<string>} - Đường dẫn đến file PDF đã tạo
 */
const generateCertificatePDF = (template, data, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Tạo thư mục nếu không tồn tại
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Tạo file PDF với kích thước A4 landscape
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      // Pipe PDF vào file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Thêm background nếu có
      if (template.background) {
        const backgroundPath = path.resolve(template.background);
        if (fs.existsSync(backgroundPath)) {
          doc.image(backgroundPath, 0, 0, {
            width: doc.page.width,
            height: doc.page.height,
          });
        }
      }

      // Thiết lập font chữ từ template
      doc.font(template.fontFamily || "Helvetica");

      // Render các trường dữ liệu
      if (template.fields && template.fields.length > 0) {
        template.fields.forEach((field) => {
          // Lấy giá trị từ dữ liệu
          const value = data[field.name] || "";

          // Thiết lập style
          const fontColor = field.fontColor || "#000000";
          const { r, g, b } = hexToRgb(fontColor);

          doc.fontSize(field.fontSize || 12);
          doc.fillColor(r, g, b);

          // Thiết lập font style
          let fontName = template.fontFamily || "Helvetica";
          if (field.isBold && field.isItalic) {
            fontName = `${fontName}-BoldItalic`;
          } else if (field.isBold) {
            fontName = `${fontName}-Bold`;
          } else if (field.isItalic) {
            fontName = `${fontName}-Italic`;
          }
          doc.font(fontName);

          // Xác định cách canh chữ
          const textOptions = {
            align: field.textAlign || "left",
          };

          // Vẽ text vào vị trí x, y
          doc.text(value, field.x, field.y, textOptions);
        });
      }

      // Finalize PDF
      doc.end();

      // Xử lý khi stream đóng
      stream.on("finish", () => {
        resolve(outputPath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCertificatePDF,
};
