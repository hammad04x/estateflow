const connection = require("../../connection/connection");


const getEntries = (req, res) => {


  let sql = "SELECT * FROM inventory_entries";
 
  connection.query(sql, params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    return res.status(200).json(data);
  });
};

// GET /getentries/:id
const getEntryById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM inventory_entries WHERE id = ?";
  connection.query(sql, [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    if (!rows || rows.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(rows[0]);
  });
};


const addEntry = (req, res) => {
  const {
    item_name,
    description,
    amount,
    payment_method,
    added_by,
    entry_date,
    status
  } = req.body;

  const sql = `INSERT INTO inventory_entries
    (item_name, description, amount, payment_method, added_by, entry_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    item_name || null,
    description || null,
    amount !== undefined && amount !== '' ? amount : null,
    payment_method || null,
    added_by || null,
    entry_date || null,
    status || "pending"
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    return res.status(201).json({ message: "created", insertId: result.insertId });
  });
};


const updateEntry = (req, res) => {
  const { id } = req.params;
  const {
    item_name,
    description,
    amount,
    payment_method,
    added_by,
    entry_date,
    status
  } = req.body;

  const sql = `UPDATE inventory_entries SET
    item_name = COALESCE(?, item_name),
    description = COALESCE(?, description),
    amount = COALESCE(?, amount),
    payment_method = COALESCE(?, payment_method),
    added_by = COALESCE(?, added_by),
    entry_date = COALESCE(?, entry_date),
    status = COALESCE(?, status),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const params = [
    item_name,
    description,
    amount,
    payment_method,
    added_by,
    entry_date,
    status,
    id
  ];

  connection.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated" });
  });
};

const deleteEntry = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM inventory_entries WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "deleted" });
  });
};

const getEntriesByAddedBy = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM inventory_entries WHERE added_by = ? ";
  connection.query(sql, [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "database error", details: err.message || err });
    }
    return res.status(200).json(rows);
  });
};

module.exports = {
  getEntries,
  getEntryById,
  addEntry,
  updateEntry,
  deleteEntry,
  getEntriesByAddedBy,
};
