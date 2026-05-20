// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- Configuración de Prisma --------------------
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// -------------------- Configuración de multer (almacenamiento local) --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta donde se guardan
  },
  filename: (req, file, cb) => {
    // nombre único: timestamp + originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// -------------------- Middlewares --------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// Servir la carpeta 'uploads' estáticamente para que las imágenes sean accesibles desde el frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- Ruta de salud --------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor de turismo funcionando' });
});

// -------------------- CRUD de destinos (con imagen) --------------------
// Obtener todos los destinos (con actividades y reseñas opcional)
app.get('/api/destinos', async (req, res) => {
  try {
    const destinos = await prisma.destino.findMany({
      include: { actividades: true, reseñas: true } // opcional, puedes quitarlo si no quieres sobrecargar
    });
    res.json(destinos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// backend/server.js - reemplaza el bloque actual de GET /api/destinos/:id
app.get('/api/destinos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  try {
    const destino = await prisma.destino.findUnique({
      where: { id },
      include: { actividades: true, reseñas: true }
    });
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    res.json(destino);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// Crear destino (con imagen)
app.post('/api/destinos', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, ubicacion, descripcion, precioPorNoche, destacado } = req.body;
    // Si se subió un archivo, guardamos la ruta relativa
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const nuevo = await prisma.destino.create({
      data: {
        nombre,
        ubicacion,
        descripcion,
        precioPorNoche: precioPorNoche ? parseFloat(precioPorNoche) : null,
        imagenUrl,
        destacado: destacado === 'true' || destacado === true
      }
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Editar destino (con imagen opcional)
app.put('/api/destinos/:id', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  try {
    const { nombre, ubicacion, descripcion, precioPorNoche, destacado } = req.body;
    const dataToUpdate = {
      nombre,
      ubicacion,
      descripcion,
      precioPorNoche: precioPorNoche ? parseFloat(precioPorNoche) : null,
      destacado: destacado === 'true' || destacado === true
    };
    // Si se subió una nueva imagen, actualizamos la URL
    if (req.file) {
      dataToUpdate.imagenUrl = `/uploads/${req.file.filename}`;
    }

    const destinoActualizado = await prisma.destino.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(destinoActualizado);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Destino no encontrado' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Eliminar destino (DELETE)
app.delete('/api/destinos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.destino.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Destino no encontrado' });
    }
    res.status(400).json({ error: error.message });
  }
});

// -------------------- Iniciar servidor --------------------
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
