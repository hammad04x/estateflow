const connection = require("../../connection/connection");

// GET all properties (basic list)
const getProperties = (req, res) => {
  const q = "SELECT * FROM properties ORDER BY created_at DESC";
  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(200).json(data);
  });
};

// GET single property by id
const getPropertyById = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM properties WHERE id = ?";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (!data || data.length === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json(data[0]);
  });
};

// GET properties created by a specific client (created_by)
const getPropertiesByClientId = (req, res) => {
  const { id } = req.params;
  const q = "SELECT * FROM properties WHERE created_by = ? ORDER BY created_at DESC";
  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(200).json(data);
  });
};

// ADD new property
// expects multipart form if image: upload.single('image') -> file available as req.file
const addProperty = (req, res) => {
  const { title, description, address, price, status } = req.body;
  const img = req.file ? req.file.filename : null;
  const created_by = req.user?.id || req.body.created_by || null;
  const now = new Date();

  const q = `
    INSERT INTO properties
      (id, title, description, address, price, status, img, created_by, created_at, updated_at)
    VALUES
      (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // price ensure numeric, default 0.00
  const priceVal = typeof price !== "undefined" && price !== null ? price : 0.0;
  const statusVal = status || "available";

  connection.query(q, [title || null, description || null, address || null, priceVal, statusVal, img, created_by, now, now], (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    return res.status(201).json({ message: "created", insertId: result.insertId || null });
  });
};

// UPDATE property (partial update)
// note: if you upload an image, middleware should set req.file.filename
const updateProperty = (req, res) => {
  const { id } = req.params;
  const { title, description, address, price, status } = req.body;
  const img = req.file ? req.file.filename : null;

  const q = `
    UPDATE properties SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      address = COALESCE(?, address),
      price = COALESCE(?, price),
      status = COALESCE(?, status),
      img = COALESCE(?, img),
      updated_at = NOW()
    WHERE id = ?
  `;
  connection.query(q, [title, description, address, price, status, img, id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ message: "updated" });
  });
};

// DELETE property (only if available)
const deleteProperty = (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM properties WHERE id = ? AND status = 'available'";
  connection.query(q, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "not found or not available for delete" });
    return res.status(200).json({ message: "deleted" });
  });
};

module.exports = {
  getProperties,
  getPropertyById,
  getPropertiesByClientId,
  addProperty,
  updateProperty,
  deleteProperty,
};
