const express = require("express");
const router = express.Router();
const broker = require("../../controller/broker/brokerController");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");


router.get("/brokerpayouts", verifyToken, authorizeRole("admin"), broker.getPayouts);
router.get("/brokerpayouts/bybroker/:id", verifyToken, authorizeRole("admin", "broker"), broker.getPayoutsByBroker);
router.post("/brokerpayout/:id/confirm", verifyToken, authorizeRole("broker"), broker.confirmPayout);


module.exports = router;