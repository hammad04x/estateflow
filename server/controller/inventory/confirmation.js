const connection = require("../../connection/connection");

// -----------------------------
// GET ALL CONFIRMATIONS
// -----------------------------
const getAllConfirmations = (req, res) => {
  const sql = "SELECT * FROM inventory_confirmations";

  connection.query(sql, (err, rows) => {
    if (err) {
      console.error("getAllConfirmations:", err);
      return res.status(500).json({ error: "database error" });
    }
    return res.status(200).json(rows);
  });
};

// -----------------------------
// GET SINGLE CONFIRMATION
// -----------------------------
const getConfirmationById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM inventory_confirmations WHERE id = ?";
  connection.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("getConfirmationById:", err);
      return res.status(500).json({ error: "database error" });
    }
    if (!rows.length) return res.status(404).json({ error: "not found" });

    return res.status(200).json(rows[0]);
  });
};

// -----------------------------
// ADD CONFIRMATION + SIGNATURE
// -----------------------------
const addConfirmation = (req, res) => {
  const { entry_id, confirmed_by, status, reject_reason, confirmed_at } = req.body;

  const signature = req.file ? req.file.filename : null;

  if (!entry_id) return res.status(400).json({ error: "entry_id required" });

  const finalConfirmedAt =
    confirmed_at && confirmed_at !== ""
      ? confirmed_at.replace("T", " ") + ":00"
      : new Date().toISOString().slice(0, 19).replace("T", " ");

  connection.query(
    "SELECT id FROM inventory_entries WHERE id = ?",
    [entry_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "database error" });
      if (!rows.length)
        return res.status(400).json({ error: "entry_id not found" });

      const sql = `
        INSERT INTO inventory_confirmations
        (entry_id, confirmed_by, status, confirmed_at, signature, reject_reason)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const params = [
        entry_id,
        confirmed_by || null,
        status || "confirmed",
        finalConfirmedAt,
        signature,
        reject_reason || null,
      ];

      connection.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: "database error" });

        return res.status(201).json({
          message: "created",
          insertId: result.insertId,
        });
      });
    }
  );
};


// -----------------------------
// UPDATE CONFIRMATION + SIGNATURE
// -----------------------------
const updateConfirmation = (req, res) => {
  const { id } = req.params;
  const { entry_id, confirmed_by, status, reject_reason, confirmed_at } = req.body;

  const signature = req.file ? req.file.filename : req.body.signature || null;

  const finalConfirmedAt =
    confirmed_at && confirmed_at !== ""
      ? confirmed_at.replace("T", " ") + ":00"
      : null;

  const sql = `
    UPDATE inventory_confirmations SET
      entry_id = ?,
      confirmed_by = ?,
      status = ?,
      confirmed_at = COALESCE(?, confirmed_at),
      signature = ?,
      reject_reason = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const params = [
    entry_id || null,
    confirmed_by || null,
    status || null,
    finalConfirmedAt,
    signature,
    reject_reason || null,
    id,
  ];

  connection.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!result.affectedRows)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ message: "updated" });
  });
};


// -----------------------------
// DELETE CONFIRMATION
// -----------------------------
const deleteConfirmation = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM inventory_confirmations WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("deleteConfirmation:", err);
      return res.status(500).json({ error: "database error" });
    }
    if (!result.affectedRows)
      return res.status(404).json({ error: "not found" });

    return res.status(200).json({ message: "deleted" });
  });
};

// -----------------------------
// GET BY ENTRY ID
// -----------------------------
const getByEntry = (req, res) => {
  const { entry_id } = req.params;

  const sql = "SELECT * FROM inventory_confirmations WHERE entry_id = ?";
  connection.query(sql, [entry_id], (err, rows) => {
    if (err) {
      console.error("getByEntry:", err);
      return res.status(500).json({ error: "database error" });
    }

    return res.status(200).json(rows);
  });
};

module.exports = {
  getAllConfirmations,
  getConfirmationById,
  addConfirmation,
  updateConfirmation,
  deleteConfirmation,
  getByEntry,
};
