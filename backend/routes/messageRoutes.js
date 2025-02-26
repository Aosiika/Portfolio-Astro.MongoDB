const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');

// Rate limiting para prevenir spam
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 mensajes por IP por hora
  message: 'Demasiados mensajes enviados. Por favor, intenta más tarde.'
});

// Validación de campos
const validateMessage = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El mensaje debe tener entre 10 y 1000 caracteres')
    .escape()
];

// Enviar un nuevo mensaje (público)
router.post('/', messageLimiter, validateMessage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = new Message({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await message.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Mensaje enviado correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar el mensaje'
    });
  }
});

// Obtener todos los mensajes (protegido - solo admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const messages = await Message.find({})
      .sort({ createdAt: -1 });
    
    const unreadCount = await Message.getUnreadCount();
    
    res.json({ 
      success: true,
      unreadCount,
      messages 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los mensajes'
    });
  }
});

// Marcar mensaje como leído (protegido - solo admin)
router.patch('/:id/read', protect, admin, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { 
        isRead: true,
        status: 'leído'
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mensaje no encontrado'
      });
    }

    res.json({ 
      success: true, 
      message: 'Mensaje marcado como leído'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el mensaje'
    });
  }
});

// Actualizar estado del mensaje (protegido - solo admin)
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['nuevo', 'leído', 'respondido', 'archivado'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado inválido'
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mensaje no encontrado'
      });
    }

    res.json({ 
      success: true, 
      message: 'Estado actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el estado'
    });
  }
});

// Eliminar mensaje (protegido - solo admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mensaje no encontrado'
      });
    }

    res.json({ 
      success: true, 
      message: 'Mensaje eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar el mensaje'
    });
  }
});

module.exports = router; 