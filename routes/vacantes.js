const express = require('express');
const db = require('../db');
const router = express.Router();

// list available specialty areas for vacancy creation dropdown
router.get('/areas-especialidad', async (req, res) => {
  try {
    const [rows] = await db.pool.query(
      `SELECT id, nombre
       FROM area_especialidad
       WHERE is_active = 1
       ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// list vacantes with optional search
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    let sql = 'SELECT * FROM vacante WHERE cliente_id = ?';
    const params = [1];
    if (search) {
      sql += ' AND titulo LIKE ?';
      params.push('%' + search + '%');
    }
    const [rows] = await db.pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// create vacante
router.post('/', async (req, res) => {
  try {
    const { titulo, area } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Title required' });
    const clienteId = 1;
    const campusId = 1;
    const createdBy = req.session.userId;
    const [result] = await db.pool.query(
      `INSERT INTO vacante (cliente_id, campus_id, created_by, titulo, area)
       VALUES (?, ?, ?, ?, ?)`,
      [clienteId, campusId, createdBy, titulo, area || null]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// candidates of a vacante
router.get('/:id/candidatos', async (req, res) => {
  try {
    const vacanteId = req.params.id;
    const status = req.query.status;
    let sql = `
      SELECT c.id, c.nombre, c.correo, c.telefono, c.area_especialidad,
             c.experiencia_anos,
             p.id AS postulacion_id, p.estatus, p.interview_at
      FROM candidato c
      JOIN postulacion p ON p.candidato_id = c.id
      WHERE p.vacante_id = ?
    `;
    const params = [vacanteId];
    if (status) {
      sql += ' AND p.estatus = ?';
      params.push(status);
    }
    const [rows] = await db.pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
