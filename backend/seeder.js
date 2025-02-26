const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/userModel');
const Project = require('./models/projectModel');
const Message = require('./models/messageModel');
const Config = require('./models/configModel');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Datos de ejemplo
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'john123',
    isAdmin: false,
  },
];

const projects = [
  {
    title: 'E-commerce Website',
    slug: 'e-commerce-website',
    description: 'Tienda online completa con carrito de compras y pasarela de pagos',
    content: 'Desarrollo de una tienda online completa utilizando React, Node.js, Express y MongoDB. Incluye gestión de productos, carrito de compras, pasarela de pagos con Stripe y panel de administración.',
    imageUrl: '/uploads/images/ecommerce.jpg',
    category: 'Desarrollo Web',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
    demoUrl: 'https://ecommerce-demo.com',
    sourceCodeUrl: 'https://github.com/username/ecommerce',
    featured: true,
    completionDate: new Date('2023-01-15'),
  },
  {
    title: 'App de Gestión de Tareas',
    slug: 'app-gestion-tareas',
    description: 'Aplicación para gestionar tareas y proyectos personales',
    content: 'Aplicación para gestionar tareas y proyectos personales con funcionalidades de calendario, recordatorios y etiquetas. Desarrollada con Vue.js y Firebase.',
    imageUrl: '/uploads/images/taskapp.jpg',
    category: 'Aplicación Web',
    technologies: ['Vue.js', 'Firebase', 'Vuetify'],
    demoUrl: 'https://taskapp-demo.com',
    sourceCodeUrl: 'https://github.com/username/taskapp',
    featured: true,
    completionDate: new Date('2023-03-20'),
  },
  {
    title: 'Portfolio Personal',
    slug: 'portfolio-personal',
    description: 'Sitio web personal para mostrar proyectos y habilidades',
    content: 'Desarrollo de un sitio web personal para mostrar proyectos y habilidades. Incluye secciones de proyectos, habilidades, experiencia y contacto.',
    imageUrl: '/uploads/images/portfolio.jpg',
    category: 'Diseño Web',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Astro.js'],
    demoUrl: 'https://portfolio-demo.com',
    sourceCodeUrl: 'https://github.com/username/portfolio',
    featured: false,
    completionDate: new Date('2023-05-10'),
  },
];

const messages = [
  {
    name: 'María López',
    email: 'maria@example.com',
    subject: 'Consulta sobre servicios',
    message: 'Hola, me gustaría saber más sobre tus servicios de desarrollo web. ¿Podrías enviarme información sobre precios y plazos?',
    read: false,
  },
  {
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    subject: 'Propuesta de colaboración',
    message: 'Hola, soy diseñador gráfico y me gustaría proponerte una colaboración para un proyecto que estoy desarrollando. ¿Podríamos hablar?',
    read: true,
  },
];

// Importar datos
const importData = async () => {
  try {
    // Limpiar la base de datos
    await User.deleteMany();
    await Project.deleteMany();
    await Message.deleteMany();
    await Config.deleteMany();

    // Crear usuario administrador manualmente para asegurar el hash correcto
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true,
    });
    await adminUser.save();
    
    // Crear usuario normal
    const regularUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'john123',
      isAdmin: false,
    });
    await regularUser.save();

    console.log('Usuarios creados:');
    console.log(`- Admin: admin@example.com / admin123`);
    console.log(`- Regular: john@example.com / john123`);

    // Importar proyectos
    await Project.insertMany(projects);

    // Importar mensajes
    await Message.insertMany(messages);

    // Crear configuración por defecto
    await Config.create({});

    console.log('Datos importados correctamente'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Eliminar todos los datos
const destroyData = async () => {
  try {
    // Limpiar la base de datos
    await User.deleteMany();
    await Project.deleteMany();
    await Message.deleteMany();
    await Config.deleteMany();

    console.log('Datos eliminados correctamente'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Ejecutar el script según el argumento
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 