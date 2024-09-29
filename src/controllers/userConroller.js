const pool = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  // console.log(req);
  const { first_name, id } = req.chat;

  try {
    const candidate = await pool.query('SELECT * FROM users WHERE $1 = chatid;', [id]);

    if (!candidate.rows.length) {
      const result = await pool.query('INSERT INTO users (chatid, name) VALUES ($1, $2) RETURNING *', [id, first_name]);
      console.log(result.rows[0]);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkAdmin = async (req) => {
  const { id } = req.chat;

  const result = await pool.query('SELECT * FROM users WHERE chatid = $1 AND role = $2', [id, 2]);
  return result.rows.length;

};

exports.makeAdmin = async (req, res) => {
  const { id } = req.chat;

  try {
    const result = await pool.query('UPDATE users SET role = $2 WHERE chatid = $1 RETURNING *', [id, 2]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};