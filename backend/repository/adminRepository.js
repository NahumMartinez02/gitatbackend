import db from '../config/database.js';

/**
 * Hace un query trayendo a todos los usuarios.
 * Se puede usar para el llenado de tablas de usuarios
 * Contiene la información necesaria para mostrar al usuario
 * @returns {Promise<Array>} el resultado de la consulta.
 */
const getAllUsers = async () => {
    try {
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO');
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error obteniendo todos los usuarios';
        throw error;
    }
};
/**
 * Hace un query trayendo un usuario dado un id.
 * Se puede usar para buscar un usuario dado un criterio de búsqueda y tabularlos
 * @param {int} id id del usuario a buscar.
 * @returns {Promise<Array>} el resultado de la consulta.
 */
const getUserById = async (id) => {
    try {
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO WHERE id = ?', [id])
        return rows.length > 0 ? rows : null;
    } catch (error) {
        error.message = 'Error obteniendo un usuario por id';
        throw error;
    }
};
/**
 * Hace un query trayendo un usuario por email.
 * Se puede usar para buscar un usuario dado un criterio de búsqueda y tabularlo
 * @param {String} email email del usuario que se está buscando
 * @returns {Promise<Array>} el resultado de la consulta
 */
const getUserByEmail = async (email) => {
    try{
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO WHERE email = ?', [email]);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error obteniendo un usuario por email';
        throw error;
    }
};
/**
 * Hace un query trayendo un usuario por nombre.
 * Se puede usar para buscar un usuario dado un criterio de búsqueda y tabularlo
 * @param {String} name nombre del usuario que se está buscando
 * @returns {Promise<Array>} el resultado de la consulta
 */
const getUserByName = async (name) => {
    try{
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO WHERE nombre = ?', [name]);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error obteninedo un usuario por nombre';
        throw error;
    }
};
/**
 * Hace un query trayendo un usuario dado un teléfono
 * Se puede usar para buscar un usuario dado un criterio de búsqueda y tabularlo
 * @param {*} tel 
 * @returns 
 */
const getUserByTel = async (tel) => {
    try{
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO WHERE telefono = ?', [tel]);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error obteniendo un usuario por telefono';
        throw error;
    }
};
/**
 * Hace un query trayendo uno o más usuarios en base a su status Activo o Inactivo
 * Se puede usar para buscar un usuario dado un criterio de búsqueda y tabularlo
 * @param {Boolean} status recibe 1 o 0
 * @returns {Promise<Array>} el resultado de la consulta
 */
const getUserByStatus = async (status) => {
    try{
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO WHERE activo = ?', [status]);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al obtener usuarios por status';
        throw error;
    }
};
/**
 * Hace un query trayendo uno o más usuarios en base a su rol
 * Se puede usar para buscar un usuario o más y tabularlos
 * @param {String} rol 
 * @returns {Promise<Array>} el resultado de la consulta
 */
const getUserByRol = async (rol) => {
    try{
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION FROM USUARIO WHERE rol = ?', [rol]);
        return rows.length > 0 ? rows : null;
    }catch(error){
        error.message = 'Error al obtener usuarios por rol'
    }
};
/**
 * Hace un query de inserción para crear un usuario nuevo
 * La información debio ser validada en el controller, por lo que se hace la inserción directamente
 * Hace la inserción y no regresa nada porque se espera ver reflejado en la tabla de usuarios o donde se esté visualizando.
 * @param {*} user 
 * @returns regresa una promesa cumplida.
 */
const createUser = async (user) => {
    const { name, email, password, tel, rol, activo, direccion } = user;
    try {
        await db.query('INSERT INTO USUARIO (NOMBRE, EMAIL, CONTRASENA, TELEFONO, ROL, ACTIVO, DIRECCION) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, email, password, tel, rol, activo, direccion]);
    } catch (error) {
        error.message = 'Error al crear usuario:';
        throw error;
    }
};
/**
 * Hace un query de actualización para borrar lógicamente a un usuario.
 * No borra al usuario de la base de datos, cambia su estado a inactivo
 * @param {String} email email del usuario
 */
const deleteUser = async (email) => {
    try{
        await db.query('UPDATE USUARIO SET ACTIVO = 0 WHERE email = ?', [email]);
    }catch(error){
        error.message = 'Error al borrar lógicamente al usuario solicitado';
        throw error;
    }
};
/**
 * Hace un query update actualizando los campos que fueron recibidos por el controller.
 * Esto lo hace dinámico.
 * @param {Array<String>} updateFields contiene las columnas a actualizar: "columna = ?"
 * @param {Array} queryParms contiene los valores de actualización. El último objeto debe de ser el críterio de búsqueda.
 */
const updateUser = async (updateFields, queryParms) => {
    const query = `UPDATE USUARIO SET ${updateFields.join(", ")} WHERE id = ?`;
    try {
        await db.query(query, queryParms);
    } catch (error) {
        throw error;
    }
};
const toCompareUser = async (id) =>{
    try{
        const rows = await db.query('SELECT NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,DIRECCION,CONTRASENA FROM USUARIO WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }catch(error){
        error.message = 'Error al buscar usuario para actualizar';
        throw error;
    }
};
export default {
    getAllUsers,
    getUserById,
    getUserByName,
    getUserByEmail,
    getUserByTel,
    getUserByRol,
    getUserByStatus,
    createUser,
    updateUser,
    deleteUser,
    toCompareUser
};