const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Conectar a MongoDB
connectDB();

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/role'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));