const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const { hexToRgb } = require("./helpers");
const QRCode = require("qrcode");

// Đăng ký các font chữ phổ biến nếu có
try {
  const fontDir = path.join(__dirname, "../../fonts");
  if (fs.existsSync(fontDir)) {
    // Đăng ký các font cơ bản
    const fontFiles = fs.readdirSync(fontDir);
    for (const fontFile of fontFiles) {
      if (fontFile.endsWith(".ttf")) {
        const fontName = path.basename(fontFile, ".ttf");
        const fontPath = path.join(fontDir, fontFile);
        registerFont(fontPath, { family: fontName });
        console.log(`Đã đăng ký font: ${fontName}`);
      }
    }
  }
} catch (error) {
  console.error("Lỗi khi đăng ký font:", error);
}

/**
 * Tạo file ảnh chứng chỉ dựa trên template và dữ liệu
 * @param {Object} template - Template chứng chỉ
 * @param {Object} data - Dữ liệu chứng chỉ
 * @param {string} outputPath - Đường dẫn lưu file ảnh
 * @returns {Promise<string>} - Đường dẫn đến file ảnh đã tạo
 */
const generateCertificateImage = async (template, data, outputPath) => {
  try {
    // Tạo thư mục nếu không tồn tại
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Tải ảnh background trước để lấy kích thước
    let width = 900; // Mặc định A4 landscape
    let height = 0;
    let backgroundImage = null;

    if (template.background) {
      try {
        backgroundImage = await loadImage(template.background);
        // Sử dụng kích thước của ảnh nền làm kích thước canvas
        height = 900 * (backgroundImage.height / backgroundImage.width);
        console.log(`Đã tải background, kích thước: ${width}x${height}`);
      } catch (error) {
        console.error(`Lỗi khi tải background: ${error.message}`);
        // Tiếp tục sử dụng kích thước mặc định nếu không tải được ảnh nền
      }
    }

    // Tạo canvas với kích thước của ảnh nền
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Thiết lập background màu trắng mặc định
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Vẽ ảnh nền nếu đã tải thành công
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    }

    // Thiết lập font chữ từ template
    const baseFont = template.fontFamily || "Arial";
    console.log(`Font cơ bản: ${baseFont}`);

    // Ghi dữ liệu để debug
    console.log("Template fields:", template.fields);
    console.log("Data được truyền vào:", data.fieldValues);

    // Render các trường dữ liệu
    if (template.fields && template.fields.length > 0) {
      for (const field of template.fields) {
        // Lấy giá trị từ dữ liệu
        let value = "";

        if (field.name in data) {
          value = data[field.name];
        } else if (data.fieldValues && field.name in data.fieldValues) {
          value = data.fieldValues[field.name];
        } else {
          console.log(`Không tìm thấy giá trị cho trường ${field.name}`);
        }

        console.log(`Field ${field.name}: Giá trị = "${value}"`);

        // Bỏ qua nếu không có giá trị
        if (!value) continue;
        // Thiết lập style
        const fontColor = field.fontColor || "#000000";
        const { r, g, b } = hexToRgb(fontColor);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        // Thiết lập font
        let fontStyle = "";
        if (field.isBold) fontStyle += "bold ";
        if (field.isItalic) fontStyle += "italic ";

        // Lấy fontSize từ field
        const fontSize = field.fontSize || 16;
        ctx.font = `${fontStyle}${fontSize}px ${baseFont}`;

        // Xác định cách canh chữ
        ctx.textAlign = field.textAlign || "left";
        ctx.textBaseline = "alphabetic"; // Đặt baseline ở top để dễ điều chỉnh

        // Lấy vị trí x,y từ template
        const x = field.x;
        const y = field.y;

        // Vẽ text vào vị trí x, y với style đã cấu hình
        ctx.fillText(value, x, y);
      }
    }

    // Lưu canvas thành ảnh
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    throw new Error(`Lỗi khi tạo ảnh chứng chỉ: ${error.message}`);
  }
};

module.exports = {
  generateCertificateImage,
};
