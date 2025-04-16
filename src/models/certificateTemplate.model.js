const mongoose = require("mongoose");

const certificateTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên template là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    background: {
      type: String, // URL hoặc path đến hình nền
    },
    fields: [
      {
        name: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        nameDisplay: {
          type: String,
          required: true,
        },
        x: {
          type: Number, // Tọa độ x
          required: true,
        },
        y: {
          type: Number, // Tọa độ y
          required: true,
        },
        fontSize: {
          type: Number,
          default: 12,
        },
        fontColor: {
          type: String,
          default: "#000000",
        },
        fontFamily: {
          type: String,
          default: "Arial",
        },
        textAlign: {
          type: String,
          enum: ["left", "center", "right"],
          default: "center",
        },
        isChoose: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CertificateTemplate = mongoose.model(
  "CertificateTemplate",
  certificateTemplateSchema
);

module.exports = CertificateTemplate;
