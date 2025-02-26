const path = require('path');
const multer = require('multer');

// Configuración de almacenamiento para imágenes
const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/images/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Configuración de almacenamiento para documentos
const documentStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Filtro para imágenes
const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('¡Solo se permiten imágenes! (jpeg, jpg, png, gif, webp)'));
  }
};

// Filtro para documentos
const documentFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|txt|csv|xls|xlsx|ppt|pptx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('¡Formato de documento no permitido!'));
  }
};

// Middleware para subir imágenes
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware para subir documentos
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { uploadImage, uploadDocument }; 