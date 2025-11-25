const express = require("express");
const router = express.Router();
const entries = require("../../controller/inventory/entries");
const verifyToken = require("../../middleware/verifyToken");
const authorizeRole = require("../../middleware/authorizeRole");


// list all (admins) - change roles if you want others to access
router.get("/getentries",verifyToken,authorizeRole("admin","buyer"),  entries.getEntries);

// single item (admin + client)
router.get("/getentries/:id",verifyToken,authorizeRole("admin","buyer"),  entries.getEntryById);

// create (admin)
router.post("/addentry",verifyToken,authorizeRole("admin","buyer"), entries.addEntry);

// update (admin)
router.put("/updateentry/:id",verifyToken,authorizeRole("admin","buyer"),  entries.updateEntry);

// delete (admin)
router.delete("/deleteentry/:id",verifyToken,authorizeRole("admin","buyer"), entries.deleteEntry);

// get by user id (admin + client)
router.get("/getentries/by-user/:id",verifyToken,authorizeRole("admin","buyer"), entries.getEntriesByAddedBy);

module.exports = router;
