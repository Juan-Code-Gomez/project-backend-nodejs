const express = require('express');
const { createRole, getRoles } = require('../controllers/roleController');
const router = express.Router();

// Ruta para crear un nuevo rol
router.post('/roles', createRole);

// Ruta para obtener todos los roles (opcional, por si quieres listar roles)
router.get('/roles', getRoles);

module.exports = router;