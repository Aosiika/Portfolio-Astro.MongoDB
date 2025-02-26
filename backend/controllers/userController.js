const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/users/login
 * @access  Público
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(`Intento de login con email: ${email}`);

  // Verificar email y contraseña
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`Usuario no encontrado con email: ${email}`);
    res.status(401);
    throw new Error('Email o contraseña incorrectos');
  }

  const isMatch = await user.matchPassword(password);
  console.log(`Contraseña coincide: ${isMatch}`);

  if (isMatch) {
    const token = generateToken(user._id);
    console.log(`Login exitoso para: ${email}, token generado`);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } else {
    console.log(`Contraseña incorrecta para: ${email}`);
    res.status(401);
    throw new Error('Email o contraseña incorrectos');
  }
});

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/users
 * @access  Privado/Admin
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // Crear usuario
  const user = await User.create({
    name,
    email,
    password,
    isAdmin: isAdmin || false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

/**
 * @desc    Obtener perfil de usuario
 * @route   GET /api/users/profile
 * @access  Privado
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

/**
 * @desc    Actualizar perfil de usuario
 * @route   PUT /api/users/profile
 * @access  Privado
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Privado/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

/**
 * @desc    Eliminar usuario
 * @route   DELETE /api/users/:id
 * @access  Privado/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'Usuario eliminado' });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

/**
 * @desc    Obtener usuario por ID
 * @route   GET /api/users/:id
 * @access  Privado/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

/**
 * @desc    Actualizar usuario
 * @route   PUT /api/users/:id
 * @access  Privado/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

/**
 * Generar token JWT
 */
const generateToken = (id) => {
  console.log(`Generando token para usuario ID: ${id}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Configurado' : 'No configurado'}`);
  console.log(`JWT_EXPIRE: ${process.env.JWT_EXPIRE}`);
  
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
}; 