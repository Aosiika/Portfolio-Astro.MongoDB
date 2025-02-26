const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Verificar si ya existe un usuario admin
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('El usuario administrador ya existe');
      process.exit(0);
    }

    // Crear usuario admin
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    });

    console.log('Usuario administrador creado exitosamente:', adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
    process.exit(1);
  }
};

createAdminUser(); 