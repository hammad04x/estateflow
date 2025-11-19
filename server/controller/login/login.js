const bcrypt = require('bcrypt');
const connection = require('../../connection/connection');
const { generateAccessToken } = require('../../utils/jwtUtils');

const login = (req, res) => {
  const { identifier, password } = req.body;
  const ip = req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? OR number = ?';
  connection.query(sql, [identifier, identifier], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Blacklist old tokens
    connection.query(
      'UPDATE active_tokens SET is_blacklisted = 1 WHERE user_id = ? AND is_blacklisted = 0',
      [user.id]
    );

    const { token: accessToken, jti } = generateAccessToken(user, ip, userAgent);
    const now = new Date();
    const expires = new Date(now.getTime() + 119 * 60 * 1000);

    connection.query(
      'INSERT INTO active_tokens (token_id, user_id, ip_address, user_agent, issued_at, last_activity, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [jti, user.id, ip, userAgent, now, now, expires],
      (err) => {
        if (err) return res.status(500).json({ error: 'Failed to create session' });

        res.json({
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            number: user.number,
            role: user.role
          }
        });
      }
    );
  });
};

const refreshToken = (req, res) => {
  const { jti, id: userId } = req.user;
  const ip = req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  connection.query(
    'SELECT * FROM active_tokens WHERE token_id = ? AND user_id = ? AND is_blacklisted = 0',
    [jti, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0)
        return res.status(401).json({ error: 'Token invalidated or not found' });

      const tokenData = results[0];
      const now = new Date();
      const issuedAt = new Date(tokenData.issued_at);

      if (now - issuedAt < 119 * 60 * 1000) {
        return res.json({
          accessToken: req.headers['authorization'].split(' ')[1]
        });
      }

      connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, userResult) => {
          if (err || userResult.length === 0)
            return res.status(401).json({ error: 'User not found' });

          const user = userResult[0];

          connection.query(
            'UPDATE active_tokens SET is_blacklisted = 1 WHERE token_id = ?',
            [jti],
            () => {
              const { token: newToken, jti: newJti } =
                generateAccessToken(user, ip, userAgent);

              const newExpires = new Date(now.getTime() + 15 * 60 * 1000);

              connection.query(
                'INSERT INTO active_tokens (token_id, user_id, ip_address, user_agent, issued_at, last_activity, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [newJti, userId, ip, userAgent, now, now, newExpires],
                (err) => {
                  if (err)
                    return res.status(500).json({ error: 'Failed to refresh token' });

                  res.json({ accessToken: newToken });
                }
              );
            }
          );
        }
      );
    }
  );
};

const updateActivity = (req, res) => {
  const { jti, id: userId } = req.user;
  const now = new Date();

  connection.query(
    'UPDATE active_tokens SET last_activity = ? WHERE token_id = ? AND user_id = ? AND is_blacklisted = 0',
    [now, jti, userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update activity' });
      res.json({ message: 'Activity updated' });
    }
  );
};

const logout = (req, res) => {
  const { jti, id: userId } = req.user;

  connection.query(
    'UPDATE active_tokens SET is_blacklisted = 1 WHERE token_id = ? AND user_id = ?',
    [jti, userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Logout failed' });
      res.json({ message: 'Logged out successfully' });
    }
  );
};

const getUserById = (req, res) => {
  const { id } = req.params;

  connection.query(
    'SELECT id, name, email, number, status, role, created_at, updated_at FROM users WHERE id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0)
        return res.status(404).json({ error: 'User not found' });

      res.json(results[0]);
    }
  );
};

const getUsers=(req,res)=>{
  const query="SELECT * FROM users";
  connection.query(query,(err,result)=>{
    if (err) {
      return res.status(500)
    } else {
      return res.json(result)
    }
  })
}

const addUser = async (req, res) => {
  try {
    const { name, email, number, alt_number, password, roles, status } = req.body;

    if (!name || !email || !number || !password) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // roles is string so parse it
    const roleJSON = JSON.stringify(JSON.parse(roles));

    // file handling
    const imageName = req.file ? req.file.filename : "defaultuser.png";

    const sql = `
      INSERT INTO users (name, email, number, alt_number, password, img, status, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      sql,
      [
        name,
        email,
        number,
        alt_number || null,
        hashedPassword,
        imageName,
        status || "active",
        roleJSON
      ],
      (err, result) => {
        if (err) {
          console.error("Add user error:", err);
          return res.status(500).json({ error: "Failed to add user" });
        }

        res.json({
          success: true,
          message: "User added successfully",
          id: result.insertId,
          image: imageName
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  login,
  refreshToken,
  updateActivity,
  logout,
  getUserById,
  getUsers,
  addUser
};
