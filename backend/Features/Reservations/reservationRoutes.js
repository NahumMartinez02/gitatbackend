import express from 'express';
import authorizationMiddleware from '../Authorization/authorizationMiddleware.js';
import reservationController from './reservationController.js';

const router = express.Router();

/**
 * Todas las peticiones pasan por el middleware de verificación.
 */
router.use(authorizationMiddleware.verifyToken);

// Salones
router.get('/salons', reservationController.getAllSalons);

// Crear reservación
router.post('', reservationController.createReservation);

// Reservaciones del cliente
router.get('/my-reservations', reservationController.getReservationsByUserId);
router.get('/my-reservations/:id', reservationController.getDetailsToClientByReservationId);

// Reservaciones admin/staff
router.get('', authorizationMiddleware.verifyStaff, reservationController.getReservations);
router.get('/:id', authorizationMiddleware.verifyStaff, reservationController.getDetailsToEmployeeByReservationId);

router.patch('/:id/info', authorizationMiddleware.verifyStaff, reservationController.updateGeneralReservationInfo);

export default router;
