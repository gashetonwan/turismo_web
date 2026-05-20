// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const multer = require('multer');
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

// -------------------- Configuración de multer (imágenes) --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// -------------------- Middlewares --------------------
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // frontend de Vite
  credentials: true, // si usas cookies
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- Middleware de autenticación --------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
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
  // No devolvemos el password
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
// Obtener todos los destinos (público)
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

// Obtener un destino por ID (público)
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

// Crear destino (solo admin)
app.post('/api/destinos', authenticateToken, isAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, ubicacion, descripcion, precioPorNoche, destacado } = req.body;
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

// Editar destino (solo admin)
app.put('/api/destinos/:id', authenticateToken, isAdmin, upload.single('imagen'), async (req, res) => {
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
    if (req.file) dataToUpdate.imagenUrl = `/uploads/${req.file.filename}`;

    const destinoActualizado = await prisma.destino.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(destinoActualizado);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Destino no encontrado' });
    res.status(400).json({ error: error.message });
  }
});

// Eliminar destino (solo admin)
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
