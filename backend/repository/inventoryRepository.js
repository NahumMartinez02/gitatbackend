import db from '../config/database.js';

/**
 * Hace un query trayendo el inventario general
 */
const getGeneralInventory = async () => {
    try{
        const rows = await db.query(`
            SELECT
                ig.id,
                ig.nombre_item,
                cat.nombre AS categoria,
                tipo.nombre AS tipo,
                col.nombre AS color,
                ig.precio_alquiler,
                ig.cantidad_total,
                ig.cantidad_disponible
            FROM
                INVENTARIO_GENERAL AS ig
            JOIN
                CATEGORIA_PRODUCTO AS cat ON ig.categoria_id = cat.id
            LEFT JOIN
                TIPO_PRODUCTO AS tipo ON ig.tipo_id = tipo.id
            LEFT JOIN
                COLOR AS col ON ig.color_id = col.id
            ORDER BY
                categoria, nombre_item;
        `);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error obteniendo el inventario general';
        throw error;
    }
};

/**
 * Obtener inventario de un salón
 */
const getPartyRoomInventory = async (id) => {
    try{
        const rows = await db.query(`
            SELECT
                s.id AS salon_id,
                s.nombre AS nombre_salon,
                isalon.id AS id_inventario_salon,
                ig.id AS item_id,
                ig.nombre_item,
                cat.nombre AS categoria,
                isalon.cantidad_disponible AS cantidad_en_salon,
                ig.cantidad_disponible AS cantidad_disponible_general
            FROM
                INVENTARIO_SALON AS isalon
            JOIN
                SALON AS s ON isalon.salon_id = s.id
            JOIN
                INVENTARIO_GENERAL AS ig ON isalon.inventario_general_id = ig.id
            JOIN
                CATEGORIA_PRODUCTO AS cat ON ig.categoria_id = cat.id
            WHERE
                isalon.salon_id = ?
            ORDER BY
                cat.nombre, ig.nombre_item;
        `, [id]);

        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error obteniendo el inventario del salón solicitado';
        throw error;
    }
};

/**
 * UPDATE propiedades de item general
 */
const updateInventoryGeneralItem = async (updateFields, queryParams) => {
    const query = `UPDATE INVENTARIO_GENERAL SET ${updateFields.join(", ")} WHERE id = ?`;
    try {
        await db.query(query, queryParams);
    } catch (error) {
        error.message = 'Error al actualizar las propiedades de un objeto en el inventario general';
        throw error;
    }
};

/**
 * SELECT item por ID
 */
const getGeneralInventoryItemById = async (id) => {
    try{
        const rows = await db.query(
            'SELECT nombre_item, categoria_id, tipo_id, color_id, precio_alquiler FROM INVENTARIO_GENERAL WHERE id = ?', 
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        error.message = 'Error al buscar un item por id en el inventario general';
        throw error;
    }
};

/**
 * Ayudas para construir el nombre
 */
const getCategoryNameById = async (id) =>{
    try{
        const rows = await db.query('SELECT nombre FROM CATEGORIA_PRODUCTO WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        error.message = 'No se ha podido traer la categoria del objeto solicitado';
        throw error;
    }
};

const getTypeNameById = async (id) => {
    try{
        const rows = await db.query('SELECT nombre FROM TIPO_PRODUCTO WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        error.message = 'No se ha podido traer el tipo del objeto solicitado';
        throw error;
    }
};

const getColorNameById = async (id) => {
    try{
        const rows = await db.query('SELECT nombre FROM COLOR WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        error.message = 'No se ha podido traer el color del objeto solicitado';
        throw error;
    }
};

/**
 * UPDATE stock general
 */
const updateGeneralInventoryStock = async(ajuste_total, ajuste_disponible, itemId) => {
    try{
        if(itemId <= 0){
            throw new Error("Id inválido");
        }

        await db.query(`
            UPDATE INVENTARIO_GENERAL
            SET
                cantidad_total = cantidad_total + ?,
                cantidad_disponible = cantidad_disponible + ?
            WHERE id = ?
        `, [ajuste_total, ajuste_disponible, itemId]);

    } catch (error) {
        error.message = 'Error al ajustar el stock del inventario general';
        throw error;
    }
};

/**
 * UPDATE stock salón
 */
const updatePartyRoomInventoryStock = async (ajuste, id_item, salon_id) => {
    try{
        if(salon_id < 1 || id_item < 1){
            throw new Error("Id inválido");
        }

        await db.query(`
            UPDATE INVENTARIO_SALON
	            SET cantidad_disponible = cantidad_disponible + ?
            WHERE inventario_general_id = ?
            AND salon_id = ?
        `, [ajuste, id_item, salon_id]);

    } catch (error) {
        error.message = `Error al ajustar el stock del inventario con id ${salon_id}`;
        throw error;
    }
};

/**
 * Traer precios + stock para reservaciones
 */
const getPricesAndStockByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    try {
        const rows = await db.query(`
            SELECT id, precio_alquiler, cantidad_disponible
            FROM INVENTARIO_GENERAL
            WHERE id IN (?)
        `, [ids]);
        return rows.length > 0 ? rows : [];
    } catch (error) {
        error.message = 'Error al cargar precios y stock de los objetos indicados';
        throw error;
    }
};


const getPartyRoomPriceById = async (id) => {
    try{
        const rows = await db.query('SELECT precio_base FROM SALON WHERE id = ?', id);
        return rows.length > 0 ? rows[0] : [];
    } catch (error) {
        error.message = 'No se ha podido obtener el precio del salón solicitado';
        throw error;
    }
};

const getAllSalons = async () => {
    const query = `SELECT id, nombre, descripcion, precio_base FROM SALON WHERE activo = 1`;
    const [rows] = await db.query(query); // db es tu conexión a MySQL
    return rows;
};


const createGeneralInventoryItem = async (
    categoriaId, 
    tipoId, 
    colorId, 
    precioAlquiler, 
    nombreItem,
    descripcion
) => {
    try {
        const query = `
            INSERT INTO INVENTARIO_GENERAL 
                (categoria_id, tipo_id, color_id, precio_alquiler, nombre_item, cantidad_total, cantidad_disponible, descripcion)
            VALUES (?, ?, ?, ?, ?, 0, 0, ?)
        `;

        const result = await db.query(query, [
            categoriaId,
            tipoId,
            colorId || null,
            precioAlquiler,
            nombreItem,
            descripcion || null
        ]);

        return result.insertId;
    } catch (error) {
        error.message = "Error al crear un nuevo item en el inventario general";
        throw error;
    }
};


export default {
    getGeneralInventory,
    getPartyRoomInventory,

    updateInventoryGeneralItem,
    getGeneralInventoryItemById,

    getCategoryNameById,
    getTypeNameById,
    getColorNameById,

    updateGeneralInventoryStock,
    updatePartyRoomInventoryStock,

    getPricesAndStockByIds,
    getPartyRoomPriceById,

    createGeneralInventoryItem,
    getAllSalons
};
