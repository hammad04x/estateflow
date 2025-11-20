const connection = require("../../connection/connection");


const getAllConfirmations = (req, res) => {

  let sql = "SELECT * FROM inventory_confirmations";
  
  connection.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    return res.status(200).json(rows);
  });
};

// GET /getconfirmation/:id
const getConfirmationById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM inventory_confirmations WHERE id = ?";
  connection.query(sql, [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(rows[0]);
  });
};

const addConfirmation = (req, res) => {
  const { entry_id, confirmed_by, status, confirmed_at, reject_reason } = req.body;

  // basic status enforcement
  if (status && !["confirmed", "rejected"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  const sql = `INSERT INTO inventory_confirmations
    (entry_id, confirmed_by, status, confirmed_at, reject_reason)
    VALUES (?, ?, ?, ?, ?)`;

  const params = [
    entry_id || null,
    confirmed_by || null,
    status || null,
    confirmed_at || null,
    reject_reason || null
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    return res.status(201).json({ message: "created", insertId: result.insertId });
  });
};

const updateConfirmation = (req, res) => {
  const { id } = req.params;
  const { entry_id, confirmed_by, status, confirmed_at, reject_reason } = req.body;

  if (status && !["confirmed", "rejected"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  const sql = `UPDATE inventory_confirmations SET
    entry_id = COALESCE(?, entry_id),
    confirmed_by = COALESCE(?, confirmed_by),
    status = COALESCE(?, status),
    confirmed_at = COALESCE(?, confirmed_at),
    reject_reason = COALESCE(?, reject_reason),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const params = [entry_id, confirmed_by, status, confirmed_at, reject_reason, id];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated" });
  });
};

const deleteConfirmation = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM inventory_confirmations WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "deleted" });
  });
};

const getByEntry = (req, res) => {
  const { entry_id } = req.params;
  const sql = "SELECT * FROM inventory_confirmations WHERE entry_id = ? ";
  connection.query(sql, [entry_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
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
  getByEntry
};
