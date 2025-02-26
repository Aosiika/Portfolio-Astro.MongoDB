const express = require('express');
const router = express.Router();
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadImage, uploadDocument } = require('../middleware/uploadMiddleware');

/**
 * @desc    Subir imagen
 * @route   POST /api/upload/image
 * @access  Privado/Admin
 */
router.post('/image', protect, admin, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Por favor, sube una imagen' });
  }
  
  const imagePath = `/uploads/images/${req.file.filename}`;
  res.json({ 
    message: 'Imagen subida correctamente',
    imagePath 
  });
});

/**
 * @desc    Subir documento
 * @route   POST /api/upload/document
 * @access  Privado/Admin
 */
router.post('/document', protect, admin, uploadDocument.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Por favor, sube un documento' });
  }
  
  const documentPath = `/uploads/documents/${req.file.filename}`;
  res.json({ 
    message: 'Documento subido correctamente',
    documentPath 
  });
});

module.exports = router; 