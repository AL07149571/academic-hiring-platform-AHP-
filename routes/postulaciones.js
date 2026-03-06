const express = require('express');
const db = require('../db');
const router = express.Router();

// pendientes (all postulaciones with status PENDIENTE)
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.pool.query(
      `SELECT p.id, p.vacante_id, p.candidato_id, p.estatus, p.interview_at,
              c.nombre AS candidato_nombre, v.titulo AS vacante_titulo
       FROM postulacion p
       JOIN candidato c ON c.id = p.candidato_id
       JOIN vacante v ON v.id = p.vacante_id
       WHERE p.estatus = 'PENDIENTE'`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// entrevistas pendientes/proximas
router.get('/interviews-pending', async (req, res) => {
  try {
    const [rows] = await db.pool.query(
      `SELECT p.id, p.vacante_id, p.candidato_id, p.estatus, p.interview_at,
              c.nombre AS candidato_nombre, v.titulo AS vacante_titulo
       FROM postulacion p
       JOIN candidato c ON c.id = p.candidato_id
       JOIN vacante v ON v.id = p.vacante_id
       WHERE p.interview_at IS NOT NULL
         AND p.estatus <> 'RECHAZADO'
       ORDER BY p.interview_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// change status (ACEPTADO/RECHAZADO/PENDIENTE)
router.patch('/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!['ACEPTADO','RECHAZADO','PENDIENTE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.pool.query('UPDATE postulacion SET estatus = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// schedule interview
router.patch('/:id/interview', async (req, res) => {
  try {
    const id = req.params.id;
    const { interview_at } = req.body;
    // allow null to clear
    await db.pool.query('UPDATE postulacion SET interview_at = ? WHERE id = ?', [interview_at || null, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
