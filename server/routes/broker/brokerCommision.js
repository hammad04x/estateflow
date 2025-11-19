const express = require("express");
const router = express.Router();
const broker = require("../../controller/broker/brokerController");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");


router.get("/brokercommissions", verifyToken, authorizeRole("admin"), broker.getCommissions);
router.get("/brokercommission/:id", verifyToken, authorizeRole("admin", "broker"), broker.getCommissionById);
router.post("/brokercommission", verifyToken, authorizeRole("admin"), broker.createCommission);


module.exports = router;