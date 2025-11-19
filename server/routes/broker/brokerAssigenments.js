const express = require("express");
const router = express.Router();
const broker = require("../../controller/broker/brokerController");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");



router.get("/brokerassignments", verifyToken, authorizeRole("admin"), broker.getBrokerAssignments);
router.get("/brokerassignment/:id", verifyToken, authorizeRole("admin"), broker.getBrokerAssignmentById);
router.get("/brokerassignments/bybroker/:id", verifyToken, authorizeRole("admin", "broker"), broker.getAssignmentsByBrokerId);

router.post("/brokerassignment", verifyToken, authorizeRole("admin"), broker.addBrokerAssignment);
router.put("/brokerassignment/:id", verifyToken, authorizeRole("admin"), broker.updateBrokerAssignment);
router.delete("/brokerassignment/:id", verifyToken, authorizeRole("admin"), broker.deleteBrokerAssignment);


module.exports = router;