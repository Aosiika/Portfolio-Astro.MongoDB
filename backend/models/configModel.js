const mongoose = require('mongoose');

const configSchema = mongoose.Schema(
  {
    // Configuración general del sitio
    siteName: {
      type: String,
      default: 'Mi Portfolio Profesional',
    },
    siteDescription: {
      type: String,
      default: 'Portfolio personal mostrando mis proyectos y habilidades',
    },
    navbarTitle: {
      type: String,
      default: 'Portfolio',
    },
    
    // Información personal
    developerName: {
      type: String,
      default: 'Tu Nombre',
    },
    developerTitle: {
      type: String,
      default: 'Desarrollador Full Stack y Creador de Contenido',
    },
    developerBio: {
      type: String,
      default: 'Desarrollador Full Stack y Creador de Contenido Digital',
    },
    aboutMeDescription: {
      type: String,
      default: 'Soy un desarrollador Full Stack apasionado por crear soluciones web innovadoras y contenido digital de calidad. Con experiencia en el desarrollo de aplicaciones web modernas y la creación de contenido audiovisual, combino mis habilidades técnicas con mi creatividad para ofrecer experiencias únicas y valiosas.',
    },
    aboutMeSecondParagraph: {
      type: String,
      default: 'Mi objetivo es crear productos digitales que no solo funcionen perfectamente, sino que también inspiren y eduquen a otros. A través de mi contenido, comparto conocimientos y experiencias en desarrollo web, diseño gráfico y producción audiovisual.',
    },
    profileImage: {
      type: String,
      default: '/images/profile.jpg',
    },
    cvLink: {
      type: String,
      default: '/docs/cv.pdf',
    },
    
    // Habilidades/tecnologías
    skills: {
      type: [String],
      default: [
        'Desarrollo Full Stack',
        'React',
        'Node.js',
        'TypeScript',
        'Astro',
        'TailwindCSS',
        'Creación de Contenido',
        'Edición Audiovisual',
        'Diseño Gráfico',
        'Adobe Photoshop'
      ],
    },
    
    // Información de contacto
    contactEmail: {
      type: String,
      default: 'tu@email.com',
    },
    
    // Enlaces sociales
    githubUrl: {
      type: String,
      default: 'https://github.com/tuusuario',
    },
    youtubeUrl: {
      type: String,
      default: 'https://youtube.com/@tucanal',
    },
    twitterUrl: {
      type: String,
      default: 'https://x.com/tuusuario',
    },
    
    // Configuración de apariencia
    primaryColor: {
      type: String,
      default: '#4F46E5',
    },
    secondaryColor: {
      type: String,
      default: '#10B981',
    },
    logoUrl: {
      type: String,
      default: '/images/logo.png',
    },
    faviconUrl: {
      type: String,
      default: '/images/favicon.ico',
    },
    
    // Configuración del sistema
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'Sitio en mantenimiento. Volveremos pronto.',
    },
    notificationEmail: {
      type: String,
      default: 'notificaciones@miportfolio.com',
    },
  },
  {
    timestamps: true,
  }
);

// Asegurar que solo haya un documento de configuración
configSchema.statics.findOneOrCreate = async function () {
  const config = await this.findOne();
  if (config) {
    return config;
  }
  return this.create({});
};

const Config = mongoose.model('Config', configSchema);

module.exports = Config; 