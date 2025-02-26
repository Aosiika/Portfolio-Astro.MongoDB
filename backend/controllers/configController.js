const asyncHandler = require('express-async-handler');
const Config = require('../models/configModel');

/**
 * @desc    Obtener configuración del sitio
 * @route   GET /api/config
 * @access  Público
 */
const getConfig = asyncHandler(async (req, res) => {
  let config = await Config.findOne();
  
  if (!config) {
    // Si no existe configuración, crear una por defecto
    config = await Config.findOneOrCreate();
  }
  
  res.json(config);
});

/**
 * @desc    Actualizar configuración del sitio
 * @route   PUT /api/config
 * @access  Privado/Admin
 */
const updateConfig = asyncHandler(async (req, res) => {
  let config = await Config.findOne();
  
  if (!config) {
    config = await Config.findOneOrCreate();
  }
  
  const {
    // Configuración general
    siteName,
    siteDescription,
    
    // Información personal
    developerName,
    developerTitle,
    developerBio,
    aboutMeDescription,
    aboutMeSecondParagraph,
    profileImage,
    cvLink,
    
    // Habilidades
    skills,
    
    // Contacto
    contactEmail,
    phoneNumber,
    
    // Enlaces sociales
    githubUrl,
    linkedinUrl,
    
    // Apariencia
    primaryColor,
    secondaryColor,
    logoUrl,
    faviconUrl,
    
    // Sistema
    maintenanceMode,
    maintenanceMessage,
    notificationEmail,
  } = req.body;
  
  // Actualizar solo los campos proporcionados
  if (siteName !== undefined) config.siteName = siteName;
  if (siteDescription !== undefined) config.siteDescription = siteDescription;
  
  // Información personal
  if (developerName !== undefined) config.developerName = developerName;
  if (developerTitle !== undefined) config.developerTitle = developerTitle;
  if (developerBio !== undefined) config.developerBio = developerBio;
  if (aboutMeDescription !== undefined) config.aboutMeDescription = aboutMeDescription;
  if (aboutMeSecondParagraph !== undefined) config.aboutMeSecondParagraph = aboutMeSecondParagraph;
  if (profileImage !== undefined) config.profileImage = profileImage;
  if (cvLink !== undefined) config.cvLink = cvLink;
  
  // Habilidades
  if (skills !== undefined) config.skills = skills;
  
  // Contacto
  if (contactEmail !== undefined) config.contactEmail = contactEmail;
  if (phoneNumber !== undefined) config.phoneNumber = phoneNumber;
  
  // Enlaces sociales
  if (githubUrl !== undefined) config.githubUrl = githubUrl;
  if (linkedinUrl !== undefined) config.linkedinUrl = linkedinUrl;
  
  // Apariencia
  if (primaryColor !== undefined) config.primaryColor = primaryColor;
  if (secondaryColor !== undefined) config.secondaryColor = secondaryColor;
  if (logoUrl !== undefined) config.logoUrl = logoUrl;
  if (faviconUrl !== undefined) config.faviconUrl = faviconUrl;
  
  // Sistema
  if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;
  if (maintenanceMessage !== undefined) config.maintenanceMessage = maintenanceMessage;
  if (notificationEmail !== undefined) config.notificationEmail = notificationEmail;
  
  const updatedConfig = await config.save();
  res.json(updatedConfig);
});

/**
 * @desc    Actualizar modo de mantenimiento
 * @route   PUT /api/config/maintenance
 * @access  Privado/Admin
 */
const toggleMaintenanceMode = asyncHandler(async (req, res) => {
  let config = await Config.findOne();
  
  if (!config) {
    config = await Config.findOneOrCreate();
  }
  
  config.maintenanceMode = !config.maintenanceMode;
  
  const updatedConfig = await config.save();
  res.json({
    maintenanceMode: updatedConfig.maintenanceMode,
    message: updatedConfig.maintenanceMode 
      ? 'Modo mantenimiento activado' 
      : 'Modo mantenimiento desactivado'
  });
});

module.exports = {
  getConfig,
  updateConfig,
  toggleMaintenanceMode,
}; 