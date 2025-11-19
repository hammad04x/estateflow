const express = require("express");
const router = express.Router();
const entries = require("../../controller/inventory/entries");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authMiddleware");


// list all (admins) - change roles if you want others to access
router.get("/getentries",  entries.getEntries);

// single item (admin + client)
router.get("/getentries/:id", verifyToken,  entries.getEntryById);

// create (admin)
router.post("/addentry", verifyToken, entries.addEntry);

// update (admin)
router.put("/updateentry/:id", verifyToken,  entries.updateEntry);

// delete (admin)
router.delete("/deleteentry/:id", verifyToken, entries.deleteEntry);

// get by user id (admin + client)
router.get("/getentries/by-user/:id", verifyToken, entries.getEntriesByAddedBy);

module.exports = router;
