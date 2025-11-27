import express from "express";
import authorizationMiddleware from './authorizationMiddleware.js';

const router = express.Router();
/**
 * Esta única ruta tiene la función de verificar la cookie que el usuario crea al iniciar sesión o registrarse.
 * Y así poder acceder al sistema.
 * Las demás funciones actún como middleware.
 */

router.get('/get-token', authorizationMiddleware.getToken);

export default router;