import db from '../config/database.js';

/**
 * Transacción que crea una reserva completa: Reserva, Detalles de items y registra un pago inicial
 * El pago inicial se crea con un monto de 0.00, esto de forma en que el empleado debe de validar el pago (transferencia, efectivo, tarjeta)
 * y actualizar el monto y la fecha del primer pago. En caso de ser pago parcial, se crearan más entradas en el futuro
 * El monto total de la reservación se calcula "al vuelo", es decir, se calcula en base a los items alquilados
 * Esto evita una inyección en el request de 0.00 pesos a pagar.
 * @param {*} detallesReservaItems 
 * @param {*} insertFields 
 * @param {*} placeholders 
 * @param {*} queryParams 
 */
const createDetailsReservationItems = async (detallesReservaItems, insertFields, placeholders, queryParams, metodo_pago, detalleReservaSalon) =>{
    const connection = await db.getConnection(); // Obtenemos una conexión dedicada
    await connection.beginTransaction(); // Iniciamos transacción
    try{
        // Inserción de reserva (aplica para ambos tipos de reserva: privada o salón)
        const reservationQuery = `INSERT INTO RESERVACION (${insertFields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        const reservationRows = await connection.query(reservationQuery, queryParams);
        const insertIdReservation = reservationRows[0].insertId; // Usamos este id para crear el detalle y el pago

        // Si hay items empezamos a construir el query para el detalle
        if(detallesReservaItems.length > 0){    // Si la reservación es privada si o si se recibieron items
            const detallesConId = detallesReservaItems.map(fila => [insertIdReservation, ...fila]);
            const query = `
            INSERT INTO DETALLE_RESERVA_ITEM 
            (reservacion_id, inventario_general_id, cantidad, precio_unitario, dias_alquiler, subtotal, es_extra) 
            VALUES ?`;
            await connection.query(query, [detallesConId]);  // Inserción en DETALLE_RESERVA_ITEM
            for (let fila of detallesReservaItems) {
                // fila: [inv_id, cantidad]
                let invId = fila[0];
                let cantidad = fila[1];

                await connection.query( // Actualizamos el inventario, en cada vuelta se descuenta la cantidad de items correspondientes
                    `UPDATE INVENTARIO_GENERAL SET cantidad_disponible = cantidad_disponible - ? WHERE id = ?`,
                    [cantidad, invId]
                );
            }
        }

        if(detalleReservaSalon.length > 0){ // Si la reservación es de salón si o si se recibieron los detalles del salón
            const detalleSalonConId = [insertIdReservation, ...detalleReservaSalon];
            const querySalon = `
            INSERT INTO DETALLE_RESERVA_SALON 
            (reservacion_id, salon_id, precio_salon, dias_alquiler, subtotal)
            VALUES (?, ?, ?, ?, ?)`;
            await connection.query(querySalon, detalleSalonConId);
        }

        // Creamos el pago ligado a la reserva, se crea con un monto 0.00 hasta que el empleado valide el primer pago, se debe de actualizar el monto y la fecha
        const payQuery = `INSERT INTO PAGO (reservacion_id, metodo_pago) VALUES (?, ?)`;
        await connection.query(payQuery, [insertIdReservation, metodo_pago]);
        await connection.commit(); // Si todo salió bien, confirmamos cambios
        
    }catch(error){
        await connection.rollback();    // Si hubo un error, hacemos rollback
        // error.message = 'Error al crear la entrada en DETALLE_RESERVA_ITEM'; // Lo comentamos para ver el error que se produce
        throw error;
    }finally{
        connection.release(); // Liberamos conexión al finalizar con error o sin error
    }
};
/**
 * Query que retorna una lista de reservaciones ligadas a un usuario a través del id del usuario
 * @param {int} userId id del usuario que hace la petición
 */
const getReservationsByUserId = async (userId) => {
    try{
        if(!userId || userId < 1){
            throw new Error('Id inválido');
        }
        const rows = await db.query(`
            SELECT id, tipo_reserva, fecha_inicio, fecha_fin, estado, direccion_evento
                FROM RESERVACION
            WHERE usuario_id = ?
            `, [userId]);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al traer las reservaciones del usuario'
        throw error;
    }
};
/**
 * Hace un query SELECT para traer información sobre la reservación de un usuario
 * Jala solamente información relevante PARA EL CLIENTE
 * @param {int} id id de reservación
 */
const getReservationToClientByReservationId = async (id) => {
    const query = `
        SELECT
            r.id AS numero_reserva,
            r.fecha_inicio,
            r.fecha_fin,
            r.estado, -- 'pendiente', 'confirmado', etc.
            r.direccion_evento,
            r.telefono_contacto,
            r.notas, -- Las notas que él mismo puso
            r.fecha_creacion,
            -- Datos del Salón (Solo si reservó uno)
            s.nombre AS nombre_salon,
            drs.precio_salon AS costo_salon
        FROM
            RESERVACION r
            LEFT JOIN DETALLE_RESERVA_SALON drs ON r.id = drs.reservacion_id
            LEFT JOIN SALON s ON drs.salon_id = s.id
        WHERE
            r.id = ?
    `;
    try{
        if (!id || id < 1) throw new Error('Id inválido');
        const rows = await db.query(query, id);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al cargar detalles de una reservación para el cliente';
        throw error;
    }
};
/**
 * Hace un query SELECT para traer información sobre los items alquilados en una reserva
 * Jala solamente información relevante PARA EL CLIENTE
 * @param {int} id id de reservación
 */
const getItemsDetailsToClientByReservationId = async (id) => {
    const query = `
        SELECT dri.cantidad, ig.nombre_item, 
            dri.precio_unitario, dri.subtotal, dri.dias_alquiler, dri.es_extra
        FROM
            DETALLE_RESERVA_ITEM dri
            JOIN INVENTARIO_GENERAL ig ON dri.inventario_general_id = ig.id
        WHERE
            dri.reservacion_id = ?
    `;
    try{
        if (!id || id < 1) throw new Error('Id inválido');
        const rows = await db.query(query, id);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al cargar detalle de items de una reservación para el cliente';
        throw error;
    }
};
/**
 * Hace un query SELECT para traer información sobre los pagos ligados a una reserva
 * Esta información es relevante tanto para el cliente como para el empleado
 * @param {int} id id de reservación
 */
const getPayDetailsByReservationId = async (id) => {
    const query = `
        SELECT
            id,
            monto,
            metodo_pago,
            estado,
            fecha_pago,
            referencia,
            notas
        FROM PAGO
        WHERE
            reservacion_id = ?
        ORDER BY fecha_pago DESC;
    `;
    try{
        if (!id || id < 1) throw new Error('Id inválido');
        const rows = await db.query(query, id);
        return rows.length > 0 ? rows : [];
    }catch(error){
        error.message = 'Error al cargar detalle de items de una reservación para el cliente';
        throw error;
    }
};

/**
 * Query que hace un múltiple SELECT para traer la información relevante para un usuario de su reserva
 * Se hacen tres querys para evitar productos cartesianos (duplicar columnas)
 * Los tres querys se ejecutan en paralelo para formar una respuesta que incluya toda la información
 * @param {int} reservId id perteneciente a la reserva de la cual se solicitan los detalles
 */
const getDetailsByReservationById = async (reservId) => {
    try{
        if(!reservId || reservId < 1 ) throw new Error();
        // Ejecutamos las consultas
        const [
            rowsCabecera,
            rowsItems,
            rowsPagos
        ] = await Promise.all([
            getReservationToClientByReservationId(reservId),
            getItemsDetailsToClientByReservationId(reservId),
            getPayDetailsByReservationId(reservId)
        ]);
        // Si no existe la reserva regresamos null
        if(rowsCabecera.length === 0) return null;
        // Si existe, empezamos a crear la respuesta
        const reserva = rowsCabecera[0];
        // Calculo del monto total de la reserva
        const totalItems = rowsItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const costoSalon = Number(reserva.costo_salon || 0);
        const granTotal = totalItems + costoSalon;
        // Calculo de lo que ya fue pagado
        const totalPagado = rowsPagos
            .filter(p => p.estado === 'completado')
            .reduce((sum, p) => sum + Number(p.monto), 0);
        return {
            ...reserva,
            costo_reserva: granTotal,
            total_pagado: totalPagado,
            saldo_pendiente: granTotal - totalPagado,
            items: rowsItems,
            pagos: rowsPagos
        };
    }catch(error){
        error.message = 'Error al traer los detalles de la reservación solicitada';
        throw error;
    }
};
/**---------------------------------------------------
 * Querys para empleado / administrador
 *----------------------------------------------------*/
/**
 * Query SELECT para reunir todas las reservaciones del sistema
 * Sirve para tabularlas en una tabla donde el empleado / admin pueda gestionarlas
 * Ordena las reservaciones empezando por la más reciente
 * @returns array con todas las reservaciones
 */
const getAllReservations = async () => {
    const query = `
        SELECT
            r.id, r.tipo_reserva, r.fecha_inicio, r.fecha_fin, r.estado, u.nombre, u.email, r.fecha_creacion
        FROM
            RESERVACION r
            JOIN USUARIO u on u.id = r.usuario_id
        ORDER BY r.fecha_creacion DESC
    `; // Sin cláusula WHERE porque trae todas sin filtrar
    try{
        const rows = await db.query(query);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al cargar las reservaciones';
        throw error;
    }
};
/**
 * Query SELECT para reunir las reservaciones del sistema que cumplen con el estado solicitado
 * @param {String} state contiene el valor de estado de reservación a buscar: pendiente, confirmado, finalizado, etc.
 * @returns arreglo con todas las reservaciones que cumplen la condición de búsqueda
 */
const getReservationsByState = async (state) => {
    const query = `
        SELECT
            r.id, r.tipo_reserva, r.fecha_inicio, r.fecha_fin, r.estado, u.nombre, u.email, r.fecha_creacion
        FROM
            RESERVACION r
            JOIN USUARIO u on u.id = r.usuario_id
        WHERE r.estado = ?
        ORDER BY r.fecha_creacion DESC
    `;
    try{
        const rows = await db.query(query, state);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al cargar las reservaciones por estado de reservación';
        throw error;
    }
};
/**
 * Query SELECT que busca las reservaciones que hayan iniciado entre dos fechas
 * @param {Date} fecha_inferior límite de rango inferior para buscar reservaciones entre fechas
 * @param {Date} fecha_superior límite de rango superior para buscar reservaciones entre fechas
 * @returns arreglo con todas las reservaciones que tengan fecha de inicio entre el rango solicitado
 */
const getReservationsBetweenDates = async (fecha_inferior, fecha_superior) => {
    const query = `
        SELECT
            r.id, r.tipo_reserva, r.fecha_inicio, r.fecha_fin, r.estado, u.nombre, u.email, r.fecha_creacion
        FROM
            RESERVACION r
            JOIN USUARIO u on u.id = r.usuario_id
        WHERE r.fecha_inicio BETWEEN ? AND ?
        ORDER BY r.fecha_creacion DESC
    `;
    try {
        const rows = await db.query(query, [fecha_inferior, fecha_superior]);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error al cargar las reservaciones entre las fechas dadas';
        throw error;
    }
};
/**
 * Query SELECT que busca las reservaciones que coincidan con el tipo solicitado: salon o eventos privados
 * @param {String} type tipo de reservación
 * @returns arreglo con todas las reservaciones son del tipo solicitado
 */
const getReservationsByType = async (type) => {
    const query = `
        SELECT
            r.id, r.tipo_reserva, r.fecha_inicio, r.fecha_fin, r.estado, u.nombre, u.email, r.fecha_creacion
        FROM
            RESERVACION r
            JOIN USUARIO u on u.id = r.usuario_id
        WHERE r.tipo_reserva = ?
        ORDER BY r.fecha_creacion DESC
    `;
    try {
        const rows = await db.query(query, type);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error al cargar las reservaciones por tipo de reservación';
        throw error;
    }
};
/**
 * Query SELECT que busca las reservaciones de un usuario dado el nombre del usuario
 * @param {String} username nombre del usuario al cual peretenecen las reservaciones solicitadas
 * @returns arreglo con todas las reservaciones del usuario seleccionado
 */
const getReservationsByUsername = async (username) => {
    const query = `
        SELECT
            r.id, r.tipo_reserva, r.fecha_inicio, r.fecha_fin, r.estado, u.nombre, u.email, r.fecha_creacion
        FROM
            RESERVACION r
            JOIN USUARIO u on u.id = r.usuario_id
        WHERE u.nombre LIKE ?
        ORDER BY r.fecha_creacion DESC
    `;
    const param = `%${username}%`;  // Agregamos los comodines de forma manual
    try {
        const rows = await db.query(query, param);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error al cargar las reservaciones por nombre de usuario';
        throw error;
    }
};
/**
 * Query SELECT que busca todas las reservaciones donde aún no termine el tiempo de alquiler y no hayan sido finalizadas
 * @returns arreglo con todas las reservaciones que cumplen la condición
 */
const getReservationsToValidate = async () => {
    const query = `
        SELECT
            r.id, r.tipo_reserva, r.fecha_inicio, r.fecha_fin, r.estado, u.nombre, u.email, r.fecha_creacion
        FROM
            RESERVACION r
            JOIN USUARIO u on u.id = r.usuario_id
        WHERE r.fecha_fin < CURDATE() AND r.estado != 'finalizado'
        ORDER BY r.fecha_creacion DESC
    `;
    try {
        const rows = await db.query(query);
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error al cargar las reservaciones que no han sido validadas';
        throw error;
    }
};
/**
 * Hace un query SELECT para traer información sobre la reservación de un usuario
 * Jala información relevante para el Empleado
 * @param {int} id id de reservación
 */
const getReservationToEmployeeByReservationId = async (id) => {
    const query = `
        SELECT
            r.id,
            r.fecha_inicio,
            r.fecha_fin,
            r.estado,
            r.direccion_evento,
            r.telefono_contacto,
            r.notas,
            r.fecha_creacion,
            -- Datos del Cliente
            u.nombre AS nombre_cliente,
            u.email AS email_cliente,
            e.nombre AS nombre_empleado,
            s.nombre AS nombre_salon,
            drs.precio_salon AS costo_salon
        FROM
            RESERVACION r
            JOIN USUARIO u ON r.usuario_id = u.id
            LEFT JOIN USUARIO e ON r.empleado_id = e.id
            LEFT JOIN DETALLE_RESERVA_SALON drs ON r.id = drs.reservacion_id
            LEFT JOIN SALON s ON drs.salon_id = s.id
        WHERE
            r.id = ?
    `;
    try {
        if (!id || id < 1) throw new Error('Id inválido');
        const rows = await db.query(query, id);
        return rows.length > 0 ? rows : [];
    } catch (error) {
        error.message = 'Error al cargar detalles de una reservación para el empleado';
        throw error;
    }
};
/**
 * Hace un query SELECT para traer información sobre los items alquilados en una reserva
 * Jala información relevante para el empleado
 * @param {int} id id de reservación
 */
const getItemsDetailsToEmployeeByReservationId = async (id) => {
    const query = `
        SELECT dri.id, dri.cantidad, dri.precio_unitario, dri.subtotal, dri.es_extra, dri.dias_alquiler, ig.nombre_item,
            cat.nombre AS categoria
        FROM
            DETALLE_RESERVA_ITEM dri
            JOIN INVENTARIO_GENERAL ig ON dri.inventario_general_id = ig.id
            JOIN CATEGORIA_PRODUCTO cat ON ig.categoria_id = cat.id
        WHERE
            dri.reservacion_id = ?
    `;
    try {
        if (!id || id < 1) throw new Error('Id inválido');
        const rows = await db.query(query, id);
        return rows.length > 0 ? rows : [];
    } catch (error) {
        error.message = 'Error al cargar detalle de items de una reservación para el empleado';
        throw error;
    }
};
/**
 * Query que hace un múltiple SELECT para traer la información relevante para un empleado / admin de la reserva solicitada
 * Se hacen tres querys para evitar productos cartesianos (duplicar columnas)
 * Los tres querys se ejecutan en paralelo para formar una respuesta que incluya toda la información
 * @param {int} reservId id perteneciente a la reserva de la cual se solicitan los detalles
 */
const getDetailsToEmployeeByReservationById = async (reservId) => { // TODO: se produce una excepción al traer items de una reservación sin items
    try {
        if (!reservId || reservId < 1) throw new Error();
        // Ejecutamos las consultas
        const [
            rowsCabecera,
            rowsItems,
            rowsPagos
        ] = await Promise.all([
            getReservationToEmployeeByReservationId(reservId),
            getItemsDetailsToEmployeeByReservationId(reservId),
            getPayDetailsByReservationId(reservId)
        ]);
        // Si no existe la reserva regresamos null
        if (rowsCabecera.length === 0) return 'La reservación solicitada no existe.';
        // Si existe, empezamos a crear la respuesta
        const reserva = rowsCabecera[0];
        // Calculo del monto total de la reserva
        const totalItems = rowsItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const costoSalon = Number(reserva.costo_salon || 0);
        const granTotal = totalItems + costoSalon;
        // Calculo de lo que ya fue pagado
        const totalPagado = rowsPagos
            .filter(p => p.estado === 'completado')
            .reduce((sum, p) => sum + Number(p.monto), 0);
        return {
            ...reserva,
            costo_reserva: granTotal,
            total_pagado: totalPagado,
            saldo_pendiente: granTotal - totalPagado,
            items: rowsItems,
            pagos: rowsPagos
        };
    } catch (error) {
        error.message = 'Error al traer los detalles de la reservación solicitada';
        throw error;
    }
};
/**
 * Query que retorna la información de contacto, notas y vendedor de una reservación
 * @param {int} id id de la reservación que desea ser actualizada
 */
const getReservationById = async (id) => {
    try {
        if (!id || id < 1) {
            throw new Error('Id inválido');
        }
        const rows = await db.query(`
            SELECT id, telefono_contacto, notas, empleado_id
                FROM RESERVACION
            WHERE id = ?
            `, [id]);
        return rows.length > 0 ? rows[0] : [];
    } catch (error) {
        error.message = 'Error al cargar la reservación por id';
        throw error;
    }
};
/**
 * Query UPDATE que actualiza la información solicitada.
 * Se crea el query con los datos enviados porque lo hace de forma dinámica, es decir
 * no siempre se mandaran los mismos datos a actualizar
 */
const updateGeneralReservationInfo = async (updateFields, queryParams) => {
    const query = `UPDATE RESERVACION SET ${updateFields.join(', ')} WHERE id = ?`;
    try{
        await db.query(query, queryParams);
    }catch(error){
        error.message = 'Error al actualizar la información general de una reservación';
        throw error;
    }
};

export default {
    createDetailsReservationItems,
    getReservationsByUserId,
    getDetailsByReservationById,
    // Querys para empleados / administradores
    getAllReservations,
    getReservationsByState,
    getReservationsBetweenDates,
    getReservationsByType,
    getReservationsByUsername,
    getReservationsToValidate,
    getDetailsToEmployeeByReservationById,
    // querys de actualización de reservaciones
    getReservationById,
    updateGeneralReservationInfo
}