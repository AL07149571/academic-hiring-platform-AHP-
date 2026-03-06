const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// register new RH user
router.post('/register', async (req, res) => {
  console.log('auth.register body', req.body);
  let conn;
  try {
    const { nombre, correo, telefono, campus, password } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    conn = await db.pool.getConnection();
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM usuario_rh WHERE correo = ?', [correo]);
    if (existing.length) {
      await conn.rollback();
      return res.status(409).json({ error: 'Email already registered' });
    }

    let clienteId;
    const [clientes] = await conn.query('SELECT id FROM cliente ORDER BY id ASC LIMIT 1');
    if (clientes.length) {
      clienteId = clientes[0].id;
    } else {
      const [clienteInsert] = await conn.query('INSERT INTO cliente (nombre) VALUES (?)', ['Cliente AHP']);
      clienteId = clienteInsert.insertId;
    }

    const campusNombre = (campus && String(campus).trim()) || 'General';
    let campusId;
    const [campusRows] = await conn.query(
      'SELECT id FROM campus WHERE cliente_id = ? AND nombre = ? LIMIT 1',
      [clienteId, campusNombre]
    );
    if (campusRows.length) {
      campusId = campusRows[0].id;
    } else {
      const [campusInsert] = await conn.query(
        'INSERT INTO campus (cliente_id, nombre) VALUES (?, ?)',
        [clienteId, campusNombre]
      );
      campusId = campusInsert.insertId;
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      `INSERT INTO usuario_rh (cliente_id, campus_id, nombre, correo, telefono, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clienteId, campusId, nombre, correo, telefono || null, hash]
    );

    await conn.commit();
    // create session
    req.session.userId = result.insertId;
    req.session.nombre = nombre;
    res.json({ success: true });
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (conn) conn.release();
  }
});

// login
router.post('/login', async (req, res) => {
  console.log('auth.login body', req.body);
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const [rows] = await db.pool.query('SELECT id, nombre, password_hash FROM usuario_rh WHERE correo = ? AND is_active = 1', [correo]);
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    req.session.nombre = user.nombre;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

module.exports = router;
