const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateTemplate",
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    filePath: {
      type: String,
      required: true,
    },
    fieldValues: {
      type: Map,
      of: String,
    },
    status: {
      type: String,
      enum: ["processing", "generated", "sent", "revoked"],
      default: "processing",
    },
    issuedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster querying
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ courseId: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;
