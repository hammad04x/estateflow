const connection = require("../../connection/connection");



// GET all commissions
const getCommissions = (req, res) => {
    const q = `
    SELECT 
      broker_commissions.*,
      users.name AS broker_name,
      properties.title AS property_title
    FROM broker_commissions
    LEFT JOIN users ON users.id = broker_commissions.broker_id
    LEFT JOIN properties ON properties.id = broker_commissions.property_id
    ORDER BY broker_commissions.id DESC
  `;

    connection.query(q, (err, result) => {
        if (err) return res.status(500).json({ error: "database error" });
        return res.status(200).json(result);
    });
};


// GET  commission by ID
const getCommissionById = (req, res) => {
    const { id } = req.params;

    const q = `
    SELECT 
      broker_commissions.*,
      users.name AS broker_name,
      properties.title AS property_title
    FROM broker_commissions
    LEFT JOIN users ON users.id = broker_commissions.broker_id
    LEFT JOIN properties ON properties.id = broker_commissions.property_id
    WHERE broker_commissions.id = ?
  `;

    connection.query(q, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "database error" });
        if (!result.length) return res.status(404).json({ error: "not found" });
        return res.status(200).json(result[0]);
    });
};
