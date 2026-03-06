const express = require('express');
const db = require('../db');
const multer = require('multer');
const path = require('path');

const router = express.Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ error: 'Not authorized' });
}

// configure multer to store in public/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    // keep original name with timestamp prefix to avoid collisions
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, unique);
  }
});
const upload = multer({ storage });

// stub for future CV parsing
function parseCv(cvPath) {
  // placeholder - in the future use OCR/parse logic
  return {};
}

// create or update candidate and optional postulacion
router.post('/', upload.single('photo'), async (req, res) => {
  console.log('candidatos.post body', req.body, 'file', req.file && req.file.filename);
  try {
    const { nombre, correo, telefono, area_especialidad, experiencia_anos, vacante_id } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Name and email required' });
    }
    // check existing candidate
    const [existing] = await db.pool.query('SELECT * FROM candidato WHERE correo = ?', [correo]);
    let candidatoId;
    if (existing.length) {
      candidatoId = existing[0].id;
      // update missing fields
      await db.pool.query(
        `UPDATE candidato SET nombre = ?, telefono = ?, area_especialidad = ?, experiencia_anos = ?, photo_path = ?
         WHERE id = ?`,
        [nombre,
         telefono || existing[0].telefono,
         area_especialidad || existing[0].area_especialidad,
         experiencia_anos || existing[0].experiencia_anos,
         req.file ? '/uploads/' + req.file.filename : existing[0].photo_path,
         candidatoId]
      );
    } else {
      const photoPath = req.file ? '/uploads/' + req.file.filename : null;
      const [result] = await db.pool.query(
        `INSERT INTO candidato (nombre, correo, telefono, area_especialidad, experiencia_anos, photo_path)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, correo, telefono || null, area_especialidad || null, experiencia_anos || null, photoPath]
      );
      candidatoId = result.insertId;
    }
    // create postulacion if vacante_id provided
    if (vacante_id) {
      try {
        await db.pool.query(
          `INSERT INTO postulacion (vacante_id, candidato_id) VALUES (?, ?)`,
          [vacante_id, candidatoId]
        );
      } catch (err) {
        // ignore duplicate key error
      }
    }
    res.json({ id: candidatoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// get candidate by id (protected)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.pool.query('SELECT id, nombre, correo, telefono, area_especialidad, experiencia_anos, photo_path FROM candidato WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
