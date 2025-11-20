const express = require("express");
const router = express.Router();

const ctrl = require("../../controller/inventory/confirmation");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authMiddleware");

// your existing multer file handler
const upload = require("../../middleware/fileHandler"); 
// use this: upload.single("signature")

// 🟩 Get all confirmation records
router.get("/getconfirmations", verifyToken, ctrl.getAllConfirmations);

// 🟦 Get single confirmation by ID
router.get("/getconfirmation/:id", verifyToken, ctrl.getConfirmationById);

// 🟧 Add confirmation (supports signature image)
router.post(
  "/addconfirmation",
  verifyToken,
  upload.single("signature"),  
  ctrl.addConfirmation
);

// 🟨 Update confirmation (supports replacing signature)
router.put(
  "/updateconfirmation/:id",
  verifyToken,
  upload.single("signature"),
  ctrl.updateConfirmation
);

// 🟥 Delete confirmation
router.delete(
  "/deleteconfirmation/:id",
  verifyToken,
  ctrl.deleteConfirmation
);

// 🟪 Get confirmations by entry_id
router.get(
  "/getconfirmations/by-entry/:entry_id",
  verifyToken,
  ctrl.getByEntry
);

module.exports = router;
