import express from 'express';
import authController from './authController.js'
import authorizationMiddleware from '../Authorization/authorizationMiddleware.js';
import { upload } from '../../utils/photoHandler.js';

const router = express.Router();
// Operaciones para registrarse e ingresar al sistema.
router.post('/register', authController.register);
router.post('/login', authController.login);
// Operaciones de cambio de contraseña
router.post('/forgot-password', authController.forgotPassword); // Levanta token para resetear la contraseña
router.post('/reset-password', authController.resetPassword);   // Usa el token para cambiar la contraseña
// Operación que permite actualizar la foto de perfil
router.patch('/profile-picture', authorizationMiddleware.verifyToken, upload.single('photo'), authController.updatePfp);
// Operación que trae la foto de perfil de un usuario (IMAGEN)
router.get('/profile/photo', authorizationMiddleware.verifyToken, authController.getPfp);
// Operación que un usuario solicita para actualizar su propio perfil
router.put('/profile', authorizationMiddleware.verifyToken, authController.updateUser);

export default router;