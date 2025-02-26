const asyncHandler = require('express-async-handler');
const Project = require('../models/projectModel');

/**
 * @desc    Obtener todos los proyectos
 * @route   GET /api/projects
 * @access  Público
 */
const getProjects = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Project.countDocuments({ ...keyword });
  const projects = await Project.find({ ...keyword })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ projects, page, pages: Math.ceil(count / pageSize), count });
});

/**
 * @desc    Obtener un proyecto por ID
 * @route   GET /api/projects/:id
 * @access  Público
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    res.json(project);
  } else {
    res.status(404);
    throw new Error('Proyecto no encontrado');
  }
});

/**
 * @desc    Crear un nuevo proyecto
 * @route   POST /api/projects
 * @access  Privado/Admin
 */
const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    imageUrl,
    category,
    technologies,
    demoUrl,
    githubUrl,
    featured,
  } = req.body;

  const project = new Project({
    title,
    description,
    imageUrl: imageUrl || '/images/sample.jpg',
    category,
    technologies: technologies || [],
    demoUrl,
    githubUrl,
    featured: featured || false,
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

/**
 * @desc    Actualizar un proyecto
 * @route   PUT /api/projects/:id
 * @access  Privado/Admin
 */
const updateProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    imageUrl,
    category,
    technologies,
    demoUrl,
    githubUrl,
    featured,
  } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.title = title || project.title;
    project.description = description || project.description;
    project.imageUrl = imageUrl || project.imageUrl;
    project.category = category || project.category;
    project.technologies = technologies || project.technologies;
    project.demoUrl = demoUrl || project.demoUrl;
    project.githubUrl = githubUrl || project.githubUrl;
    project.featured = featured !== undefined ? featured : project.featured;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Proyecto no encontrado');
  }
});

/**
 * @desc    Eliminar un proyecto
 * @route   DELETE /api/projects/:id
 * @access  Privado/Admin
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await project.deleteOne();
    res.json({ message: 'Proyecto eliminado' });
  } else {
    res.status(404);
    throw new Error('Proyecto no encontrado');
  }
});

/**
 * @desc    Obtener proyectos destacados
 * @route   GET /api/projects/featured
 * @access  Público
 */
const getFeaturedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ featured: true }).sort({ createdAt: -1 });
  res.json(projects);
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
}; 