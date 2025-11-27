import db from '../config/database.js';

const getUserById = async (id) => {
    try {
        const rows = await db.query('SELECT id, nombre, telefono, contrasena, photo_url FROM USUARIO WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch(error) { throw error; }
};

const getUserByEmail = async (email) => {
    try {
        const rows = await db.query('SELECT id, nombre, email, telefono, rol, activo, contrasena, photo_url FROM USUARIO WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    } catch(error) { throw error; }
};

const createUser = async ({ nombre, email, password, tel }) => {
    try {
        if (tel) {
            await db.query('INSERT INTO USUARIO (nombre, email, contrasena, telefono, rol, activo) VALUES (?, ?, ?, ?, "cliente", 1)', [nombre, email, password, tel]);
        } else {
            await db.query('INSERT INTO USUARIO (nombre, email, contrasena, rol, activo) VALUES (?, ?, ?, "cliente", 1)', [nombre, email, password]);
        }
        return getUserByEmail(email);
    } catch (error) { throw error; }
};

const updateResetToken = async ({ token, exp, email }) => {
    await db.query('UPDATE USUARIO SET reset_token = ?, reset_token_exp = ? WHERE email = ?', [token, exp, email]);
};

const updatePassword = async ({ token, password }) => {
    await db.query(`UPDATE USUARIO SET contrasena = ?, reset_token = NULL, reset_token_exp = 0 WHERE reset_token = ? AND reset_token_exp > ?`, [password, token, Date.now()]);
};

const updatePfp = async ({ id, photoUrl }) => {
    await db.query('UPDATE USUARIO SET photo_url = ? WHERE id = ?', [photoUrl, id]);
};

const updateUser = async (updateFields, queryParms) => {
    const query = `UPDATE USUARIO SET ${updateFields.join(", ")} WHERE id = ?`;
    await db.query(query, queryParms);
};

export default { getUserById, getUserByEmail, createUser, updateResetToken, updatePassword, updatePfp, updateUser };