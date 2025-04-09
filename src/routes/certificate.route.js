const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificate.controller");
const { authenticate, authorize, checkOwnership } = require("../middleware");

// Route: /api/certificates
router
  .route("/")
  .get(authenticate, certificateController.getCertificates)
  .post(
    authenticate,
    authorize("admin", "instructor"),
    certificateController.createCertificate
  );

// Route: /api/certificates/:id
router
  .route("/:id")
  .get(authenticate, certificateController.getCertificateById);

// Route: /api/certificates/verify/:certificateId - Public route không cần xác thực
router.get(
  "/verify/:certificateId",
  certificateController.getCertificateByCertificateId
);

// Route: /api/certificates/:id/download
router.get("/:id/download", certificateController.downloadCertificate);

// Route: /api/certificates/:id/preview
router.get("/:id/preview", certificateController.previewCertificate);

// Route: /api/certificates/:id/revoke
router.put(
  "/:id/revoke",
  authenticate,
  authorize("admin"),
  certificateController.revokeCertificate
);

module.exports = router;
