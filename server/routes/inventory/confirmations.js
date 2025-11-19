const express = require("express");
const router = express.Router();
const ctrl = require("../../controller/inventory/confirmation");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authMiddleware");

// list all confirmations (admin)
router.get("/getconfirmations", verifyToken,  ctrl.getAllConfirmations);

// single confirmation (admin + client can view; change roles if needed)
router.get("/getconfirmation/:id", verifyToken,  ctrl.getConfirmationById);

// create confirmation (admin)
router.post("/addconfirmation", verifyToken,  ctrl.addConfirmation);

// update confirmation (admin)
router.put("/updateconfirmation/:id", verifyToken, ctrl.updateConfirmation);

// delete confirmation (admin)
router.delete("/deleteconfirmation/:id", verifyToken,  ctrl.deleteConfirmation);

// get confirmations for a given entry (admin + client)
router.get("/getconfirmations/by-entry/:entry_id", verifyToken, ctrl.getByEntry);

module.exports = router;
