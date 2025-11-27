import db from '../config/database.js';

/**
 * Hace un query trayendo un usuario dado un id.
 * @param {int} id id del usuario a buscar.
 * @returns {Promise<Array>} el resultado de la consulta.
 */
const getUserById = async (id) => {
    try{
        const rows = await db.query('SELECT NOMBRE,TELEFONO,CONTRASENA FROM USUARIO WHERE id = ?', [id])
        return rows.length > 0 ? rows[0] : null;
    }catch(error){
        error.message = 'Error obteniendo un usuario por id';
        throw error; 
    }
};
/**
 * Hace un query trayendo a un usuario dado un email.
 * @param {String} email Criterio de búsqueda.
 * @returns {Promise<Array>} El resultado de la consula.
 */
const getUserByEmail = async (email) => {
    try{
        const rows = await db.query('SELECT ID,NOMBRE,EMAIL,TELEFONO,ROL,ACTIVO,CONTRASENA,PHOTO_URL from USUARIO WHERE email = ? ', [email]);
        return rows.length > 0 ? rows[0] : null;
    }catch(error){
        error.message = 'Error al obtener un usuario por id';
        throw error;
    }
};
/**
 * Hace un query para insertar un usuario.
 * @param {Object<Usuario>} user contiene los datos necesarios para registrar un usuario.
 * @returns {Promise<Array>} Hace un llamado a otra función para retornar el usuario insertado.
 */
const createUser = async (user) => {
    const { nombre, email, password, tel } = user;
    try {
        if (tel) {
            await db.query('INSERT INTO USUARIO (NOMBRE, EMAIL, CONTRASENA, TELEFONO) VALUES (?, ?, ?, ?)', [nombre, email, password, tel]);
        } else {
            await db.query('INSERT INTO USUARIO (NOMBRE, EMAIL, CONTRASENA) VALUES (?, ?, ?)', [nombre, email, password]);
        }
        return getUserByEmail(email);
    } catch (error) {
        error.message = 'Error al crear usuario:';
        throw error;
    }
};
/**
 * Hace un query que actualiza el token de actualización de contraseña y su expiración
 * @param {*} req contiene la información necesaria para guardar el token en el usuario correcto
 */
const updateResetToken = async (req) => {
    const { token, exp, email } = req;
    try{
        await db.query('UPDATE USUARIO SET reset_token = ?, reset_token_exp = ? WHERE email = ?',
            [token, exp, email]
        );
    }catch(error){
        error.message = 'Error al crear token de actualización de contraseña'
        throw error;
    }
};
/**
 * Hace un query actualizando una contraseña, además limpia el token de cambio de contraseña y su tiempo de expiración
 * Busca a través del token dado y su expiración.
 * @param {*} req contiene la información para localizar al usuario y actualizar su contraseña
 */
const updatePassword = async (req) => {
    const { token, password } = req;
    try{
        await db.query(`UPDATE USUARIO SET CONTRASENA = ?, RESET_TOKEN = "", RESET_TOKEN_EXP = 0
            WHERE RESET_TOKEN = ? AND RESET_TOKEN_EXP > ?
            `,
            [password, token, Date.now().toString()]
        )
    }catch(error){
        error.message = 'Token expirado'
        throw error;
    }
};
/**
 * Hace un query actualizando la ruta donde se guarda su foto de perfil, la cual ya fue validada y almacenada en un sistema de archivos
 * @param {*} req contiene el criterio de búsqueda y la nueva información.
 */
const updatePfp = async (req) => {
    const { id, photoUrl  } = req;
    try{
        await db.query('UPDATE USUARIO SET PHOTO_URL = ? WHERE ID = ?', [photoUrl, id]);
    }catch(error){
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
    try{
        await db.query(query, queryParms);
    }catch(error){
        throw error;
    }
};
/**
 * Se exportan las funciones que manejan los querys de la base de datos.
 * Serán inyectadas en el controller para procesar la información de consultas.
 */
export default {
    getUserById,
    getUserByEmail,
    createUser,
    updateResetToken,
    updatePassword,
    updatePfp,
    updateUser
};