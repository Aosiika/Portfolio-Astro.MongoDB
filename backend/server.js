const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const configRoutes = require('./routes/configRoutes');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control']
}));

// Headers adicionales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Middleware para logging de solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/messages', messageRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));

// Carpeta uploads estática
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Crear directorios necesarios
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const documentsDir = path.join(uploadsDir, 'documents');

[uploadsDir, imagesDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración inicial
const config = {
  navbarTitle: 'Portfolio',
  siteName: 'Mi Portfolio',
  siteDescription: 'Portfolio personal'
};

// Ruta de configuración
app.get('/config', (req, res) => {
  res.json(config);
});

// Middleware de errores
app.use((req, res, next) => {
  res.status(404).json({ 
    message: `Ruta no encontrada: ${req.originalUrl}`,
    success: false 
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error del servidor', 
    error: err.message,
    success: false 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/test`);
  console.log(`API Test URL: http://localhost:${PORT}/api/test`);
}); 