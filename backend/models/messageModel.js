const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  message: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    trim: true
  },
  subject: {
    type: String,
    default: 'Sin asunto',
    trim: true
  },
  status: {
    type: String,
    enum: ['nuevo', 'leído', 'respondido', 'archivado'],
    default: 'nuevo'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Método estático para obtener el conteo de mensajes no leídos
messageSchema.statics.getUnreadCount = async function() {
  return await this.countDocuments({ isRead: false });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 