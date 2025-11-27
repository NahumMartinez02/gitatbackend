import express from 'express';
import authorizationMiddleware from '../Authorization/authorizationMiddleware.js';
import adminController from './adminController.js';

/**
 * Creamos una constante router que enrute las diferentes
 * operaciones GET, POST, PUT, ...
 * Además, agregamos el uso de los middlewares de verificación
 * obligatorios antes de cada request.
 * Esto porque un usuario debe de estar logeado y tener los permisos
 * adecuados para cualquier operación de esta índole.
 */
const router = express.Router();
router.use(authorizationMiddleware.verifyToken);
router.use(authorizationMiddleware.verifyAdmin);

router.get('/get-users', adminController.getAllUsers);    // Obtiene todos los usuarios para una tabla
router.post('/search-user', adminController.searchUser);  // Obtiene un usuario o más dados diferentes criterios de búsqueda
router.post('/post-user', adminController.createUser);  // Crea un nuevo usuario
router.post('/delete-user', adminController.deleteUser);   // Borra un usuario lógicamente
router.put('/put-user', adminController.updateUser);    // Actualiza un usuario


export default router;