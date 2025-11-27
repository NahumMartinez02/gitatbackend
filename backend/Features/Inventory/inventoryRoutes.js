import express from 'express';
import authorizationMiddleware from '../Authorization/authorizationMiddleware.js';
import inventoryController from './inventoryController.js';

/**
 * Creamos una constante router que enrute las diferentes
 * operaciones GET, PUT, ...
 * Además, agregamos el uso de los middlewares de verificación
 * obligatorios antes de cada request.
 * Esto porque un usuario debe de estar logeado y tener los permisos
 * adecuados para cualquier operación de esta índole.
 * Un administrador tiene la capacidad de revisar una página de Gestión de Inventario
 * Donde puede cambiar precios, colores, stock, etc.
 */
const router = express.Router();

router.use(authorizationMiddleware.verifyToken);    
router.use(authorizationMiddleware.verifyAdmin);    

// ------------------------
// Inventario General
// ------------------------
router.get('/general', inventoryController.getGeneralInventory);

// ⭐ Nueva ruta para crear un item en el inventario general
router.post('/general/items', inventoryController.createGeneralInventoryItem);

// Actualiza las propiedades de los items (precio, categoría, tipo, color → nombre automático)
router.patch('/general/items/:id', inventoryController.updateGeneralInventoryItem);

// Actualiza stock total y disponible
router.patch('/general/items/:id/stock', inventoryController.updateGeneralInventoryStock);

// ------------------------
// Inventario por salón
// ------------------------
router.get('/salon/:id', inventoryController.getPartyRoomInventory);
// Obtener inventario de un salón por ID 
router.get('/partyroom/:id', inventoryController.getPartyRoomInventory);

// Actualiza stock de un item dentro de un salón
router.patch('/salon/:salonId/items/:itemId/stock', inventoryController.updatePartyRoomInventoryStock);

export default router;
