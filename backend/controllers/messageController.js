const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');

/**
 * @desc    Obtener todos los mensajes
 * @route   GET /api/messages
 * @access  Privado/Admin
 */
const getMessages = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { email: { $regex: req.query.keyword, $options: 'i' } },
          { subject: { $regex: req.query.keyword, $options: 'i' } },
          { message: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const filterRead = req.query.read === 'true' 
    ? { read: true } 
    : req.query.read === 'false' 
      ? { read: false } 
      : {};

  const count = await Message.countDocuments({ ...keyword, ...filterRead });
  const messages = await Message.find({ ...keyword, ...filterRead })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ 
    messages, 
    page, 
    pages: Math.ceil(count / pageSize), 
    count,
    unreadCount: await Message.countDocuments({ read: false })
  });
});

/**
 * @desc    Obtener un mensaje por ID
 * @route   GET /api/messages/:id
 * @access  Privado/Admin
 */
const getMessageById = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (message) {
    res.json(message);
  } else {
    res.status(404);
    throw new Error('Mensaje no encontrado');
  }
});

/**
 * @desc    Crear un nuevo mensaje
 * @route   POST /api/messages
 * @access  Público
 */
const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const newMessage = new Message({
    name,
    email,
    subject,
    message,
    read: false,
  });

  const createdMessage = await newMessage.save();
  res.status(201).json(createdMessage);
});

/**
 * @desc    Marcar mensaje como leído/no leído
 * @route   PUT /api/messages/:id/read
 * @access  Privado/Admin
 */
const toggleMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (message) {
    message.read = !message.read;
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } else {
    res.status(404);
    throw new Error('Mensaje no encontrado');
  }
});

/**
 * @desc    Eliminar un mensaje
 * @route   DELETE /api/messages/:id
 * @access  Privado/Admin
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (message) {
    await message.deleteOne();
    res.json({ message: 'Mensaje eliminado' });
  } else {
    res.status(404);
    throw new Error('Mensaje no encontrado');
  }
});

/**
 * @desc    Obtener resumen de mensajes (total y no leídos)
 * @route   GET /api/messages/summary
 * @access  Privado/Admin
 */
const getMessagesSummary = asyncHandler(async (req, res) => {
  const total = await Message.countDocuments({});
  const unread = await Message.countDocuments({ read: false });
  
  res.json({
    total,
    unread,
  });
});

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  toggleMessageRead,
  deleteMessage,
  getMessagesSummary,
}; 