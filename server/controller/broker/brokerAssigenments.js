const connection = require("../../connection/connection")




const getBrokerAssignments = (req, res) => {
    const q = `
    SELECT 
      broker_assignments.*,
      users.name AS broker_name,
      properties.title AS property_title
    FROM broker_assignments
    LEFT JOIN users ON users.id = broker_assignments.broker_id
    LEFT JOIN properties ON properties.id = broker_assignments.property_id
    ORDER BY broker_assignments.id DESC
  `;

    connection.query(q, (err, result) => {
        if (err) return res.status(500).json();
        return res.status(200).json(result);
    });
};


// GET assignment by ID
const getBrokerAssignmentById = (req, res) => {
    const { id } = req.params;

    const q = `
    SELECT 
      broker_assignments.*,
      users.name AS broker_name,
      properties.title AS property_title,
      properties.address,
      properties.price
    FROM broker_assignments
    LEFT JOIN users ON users.id = broker_assignments.broker_id
    LEFT JOIN properties ON properties.id = broker_assignments.property_id
    WHERE broker_assignments.id = ?
  `;

    connection.query(q, [id], (err, result) => {
        if (err) return res.status(500).json();
        if (!data.length) return res.status(404).json({ error: "not found" });
        return res.status(200).json(result[0]);
    });
};




// GET assignments by broker_id (only LEFT JOIN property because we need property title)

const getAssignmentsByBrokerId = (req, res) => {
    const { id } = req.params;

    const q = `
    SELECT 
      broker_assignments.*,
      properties.title AS property_title,
      properties.status AS property_status
    FROM broker_assignments
    LEFT JOIN properties ON properties.id = broker_assignments.property_id
    WHERE broker_assignments.broker_id = ?
    ORDER BY broker_assignments.id DESC
  `;

    connection.query(q, [id], (err, result) => {
        if (err) return res.status(500).json();
        return res.status(200).json(result);
    });
};



// ADD assignment (NO JOIN needed)
const addBrokerAssignment = (req, res) => {
    const { broker_id, property_id, assigned_at } = req.body;

    if (!broker_id || !property_id)
        return res.status(400).json({ error: "broker_id and property_id required" });

    const now = new Date();
    const assignDate = assigned_at || now;

    const check = `SELECT id FROM broker_assignments WHERE broker_id = ? AND property_id = ?`;

    connection.query(check, [broker_id, property_id], (err, rows) => {
        if (err) return res.status(500).json({ error: "database error" });
        if (rows.length) return res.status(409).json({ error: "already assigned" });

        const insert = `
      INSERT INTO broker_assignments 
      (broker_id, property_id, assigned_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;

        connection.query(insert, [broker_id, property_id, assignDate, now, now], (err2, result) => {
            if (err2) return res.status(500).json({ error: "database error" });

            const updateProperty = `
          UPDATE properties 
          SET status = 'reserved', updated_at = ? 
          WHERE id = ?
        `;
            connection.query(updateProperty, [now, property_id]);
            return res.status(201).json({
                message: "Assigned successfully & property reserved",
                insertId: result.insertId,
            });
        }
        );
    });
};



// UPDATE assignment
const updateBrokerAssignment = (req, res) => {
    const { id } = req.params;
    const { broker_id, property_id, assigned_at } = req.body;

    const q = `
    UPDATE broker_assignments SET
      broker_id = COALESCE(?, broker_id),
      property_id = COALESCE(?, property_id),
      assigned_at = COALESCE(?, assigned_at),
      updated_at = ?
    WHERE id = ?
  `;
    const now = new Date();
    connection.query(q, [broker_id, property_id, assigned_at, now, id], (err, result) => {
        if (err) return res.status(500).json({ error: "database error" });
        if (!result.affectedRows) return res.status(404).json({ error: "not found" });
        return res.status(200).json();
    });
};



// DELETE assignment
const deleteBrokerAssignment = (req, res) => {
    const { id } = req.params;

    const find = `SELECT property_id FROM broker_assignments WHERE id = ?`;
    connection.query(find, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: "database error" });
        if (!rows.length) return res.status(404).json({ error: "not found" });

        const propertyId = rows[0].property_id;

        const del = `DELETE FROM broker_assignments WHERE id = ?`;
        connection.query(del, [id], (err2, result) => {
            if (err2) return res.status(500).json({ error: "database error" });
            if (!result.affectedRows) return res.status(404).json({ error: "not found" });

            const update = `UPDATE properties SET status = 'available' WHERE id = ?`;
            connection.query(update, [propertyId]);

            return res.status(200).json({ message: "deleted & property unreserved" });
        });
    });
};


module.exports = {

    getBrokerAssignments,
    getBrokerAssignmentById,
    getAssignmentsByBrokerId,
    addBrokerAssignment,
    updateBrokerAssignment,
    deleteBrokerAssignment,

} 