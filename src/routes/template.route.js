const express = require("express");
const router = express.Router();
const templateController = require("../controllers/certificateTemplate.controller");
const { authenticate, authorize } = require("../middleware");

// Route: /api/templates/fonts
router.get("/fonts", templateController.getAvailableFonts);

// Route: /api/templates
router
  .route("/")
  .get(authenticate, templateController.getAllTemplates)
  .post(authenticate, templateController.createTemplate);

// Route: /api/templates/default
router.get("/default", templateController.getDefaultTemplate);

// Route: /api/templates/:id
router
  .route("/:id")
  .get(authenticate, templateController.getTemplateById)
  .put(authenticate, templateController.updateTemplate)
  .delete(authenticate, templateController.deleteTemplate);

module.exports = router;
