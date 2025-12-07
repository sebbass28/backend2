import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getUserById, updateUser, updateAvatar } from '../controllers/userController.js';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nombre único: id_usuario-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
});

const router = express.Router();

// Protected routes
router.use(authenticateJWT);

// Upload Avatar Request
router.post('/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  // Llamar al controlador para guardar la ruta en BD
  return updateAvatar(req, res);
});

// Protected routes
router.use(authenticateJWT);

// Get user information
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return getUserById(req, res);
});

// Update user information
router.put('/:id', 
  body('name').optional().isString(),
  body('email').optional().isEmail(),
  async (req, res) => {
    const userId = req.params.id;
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    return updateUser(req, res);
  }
);

export default router;