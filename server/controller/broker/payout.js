const connection = require("../../connection/connection")


// GET all payouts (JOIN only where necessary)
const getPayouts = (req, res) => {
  const q = `
    SELECT 
      broker_payouts.*,
      broker_commissions.broker_id,
      broker_commissions.property_id,
      broker_commissions.total_commission_amount,
      properties.title AS property_title,
      users.name AS broker_name
    FROM broker_payouts
    LEFT JOIN broker_commissions ON broker_commissions.id = broker_payouts.commission_id
    LEFT JOIN properties ON properties.id = broker_commissions.property_id
    LEFT JOIN users ON users.id = broker_commissions.broker_id
    ORDER BY broker_payouts.id DESC
  `;

  connection.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// GET payouts by broker_id (simple + necessary JOIN)
const getPayoutsByBroker = (req, res) => {
  const { id } = req.params;

  const q = `
    SELECT 
      broker_payouts.*,
      broker_commissions.property_id,
      broker_commissions.total_commission_amount,
      properties.title AS property_title
    FROM broker_payouts
    LEFT JOIN broker_commissions ON broker_commissions.id = broker_payouts.commission_id
    LEFT JOIN properties ON properties.id = broker_commissions.property_id
    WHERE broker_commissions.broker_id = ?
    ORDER BY broker_payouts.id DESC
  `;

  connection.query(q, [id], (err, data) => {
    if (err) return res.status(500).json({ error: "database error" });
    return res.status(200).json(data);
  });
};

// Confirm/Reject payout
const confirmPayout = (req, res) => {
  const { id } = req.params;
  const { status, reject_reason } = req.body;
  const broker_id = req.user.id;

  const check = `
    SELECT broker_commissions.broker_id 
    FROM broker_payouts
    JOIN broker_commissions ON broker_commissions.id = broker_payouts.commission_id
    WHERE broker_payouts.id = ?
  `;

  connection.query(check, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "database error" });
    if (!rows.length) return res.status(404).json({ error: "not found" });
    if (rows[0].broker_id !== broker_id) return res.status(403).json({ error: "not your payout" });

    const now = new Date();

    const insert = `
      INSERT INTO broker_payout_confirmations
      (payout_id, confirmed_by, status, confirmed_at, reject_reason, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(insert, [id, broker_id, status, now, reject_reason, now, now], (err2) => {
      if (err2) return res.status(500).json({ error: "database error" });
      return res.status(200).json({ message: `payout ${status}` });
    });
  });
};



module.exports={
  getPayouts,
  getPayoutsByBroker,
  confirmPayout
}