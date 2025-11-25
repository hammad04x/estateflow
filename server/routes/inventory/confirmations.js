const express = require("express");
const router = express.Router();

const ctrl = require("../../controller/inventory/confirmation");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");

// your existing multer file handler
const upload = require("../../middleware/fileHandler"); 
// use this: upload.single("signature")

// 🟩 Get all confirmation records
router.get("/getconfirmations", verifyToken, authorizeRole("admin","buyer"), ctrl.getAllConfirmations);

// 🟦 Get single confirmation by ID
router.get("/getconfirmation/:id", verifyToken,authorizeRole("admin","buyer"), ctrl.getConfirmationById);

// 🟧 Add confirmation (supports signature image)
router.post(
  "/addconfirmation",   verifyToken,authorizeRole("admin","buyer"),
  upload.single("signature"),  
  ctrl.addConfirmation
);

// 🟨 Update confirmation (supports replacing signature)
router.put(
  "/updateconfirmation/:id",
  verifyToken,authorizeRole("admin","buyer"),
 
  upload.single("signature"),
  ctrl.updateConfirmation
);

// 🟥 Delete confirmation
router.delete(
  "/deleteconfirmation/:id",
  verifyToken,  authorizeRole("admin","buyer"),

  ctrl.deleteConfirmation
);

// 🟪 Get confirmations by entry_id
router.get(
  "/getconfirmations/by-entry/:entry_id",
  verifyToken,
  authorizeRole("admin","buyer"),
  
  ctrl.getByEntry
);

module.exports = router;
