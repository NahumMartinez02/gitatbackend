import express from 'express';
import authController from './authController.js';
import authorizationMiddleware from '../Authorization/authorizationMiddleware.js';
import { upload } from '../../utils/photoHandler.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rutas protegidas (Requieren Token)
router.patch('/profile-picture', authorizationMiddleware.verifyToken, upload.single('photo'), authController.updatePfp);
router.get('/profile/photo', authorizationMiddleware.verifyToken, authController.getPfp);
router.put('/profile', authorizationMiddleware.verifyToken, authController.updateUser);

export default router;