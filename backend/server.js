// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-cambiar-en-produccion';

// -------------------- Configuración de Prisma --------------------
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar el storage de Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'turismo_destinos', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }] // Optimización
  }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// -------------------- Middlewares --------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// -------------------- Middleware de autenticación --------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado, se requieren permisos de administrador' });
  }
  next();
};

// -------------------- Ruta pública de salud --------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor de turismo funcionando' });
});

// -------------------- Autenticación: Registro --------------------
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ error: 'El email ya está registrado' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
    },
  });
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

// -------------------- Autenticación: Login --------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// -------------------- CRUD de destinos (PROTEGIDO para admin) --------------------
app.get('/api/destinos', async (req, res) => {
  try {
    const destinos = await prisma.destino.findMany({
      include: { actividades: true, reseñas: true }
    });
    res.json(destinos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/destinos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
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

// --- POST (CREAR) con soporte para URL o archivo ---
app.post('/api/destinos', authenticateToken, isAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, ubicacion, descripcion, precioPorNoche, destacado, imagenUrl } = req.body;

    const imagenFinal = (imagenUrl || null);
    if (req.file) {
      imagenFinal = req.file.path;
    }

    const nuevo = await prisma.destino.create({
      data: {
        nombre,
        ubicacion,
        descripcion,
        precioPorNoche: precioPorNoche ? parseFloat(precioPorNoche) : null,
        imagenUrl: imagenFinal,
        destacado: destacado === 'true' || destacado === true
      }
    });
    res.status(201).json(nuevo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// --- PUT (EDITAR) con soporte para URL o archivo ---
app.put('/api/destinos/:id', authenticateToken, isAdmin, upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  try {
    const { nombre, ubicacion, descripcion, precioPorNoche, destacado, imagenUrl } = req.body;
    const dataToUpdate = {
      nombre,
      ubicacion,
      descripcion,
      precioPorNoche: precioPorNoche ? parseFloat(precioPorNoche) : null,
      destacado: destacado === 'true' || destacado === true
    };

    if (req.file) {
      // Si se sube un archivo, se usa esa ruta
      dataToUpdate.imagenUrl = req.file.path;
    } else if (imagenUrl) {
      // Si no hay archivo pero hay URL en el body, se usa esa URL
      dataToUpdate.imagenUrl = imagenUrl;
    }
    // Si no hay archivo ni URL, no se actualiza imagenUrl (se mantiene el valor anterior)

    const destinoActualizado = await prisma.destino.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(destinoActualizado);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Destino no encontrado' });
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/destinos/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.destino.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Destino no encontrado' });
    res.status(400).json({ error: error.message });
  }
});

// -------------------- Iniciar servidor --------------------
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
