import adminRepository from "../../repository/adminRepository.js";
import crypto, { hash } from 'crypto';
// Función que retorna un texto hasheado con sha256
function getSHA256Hash(password){
    return crypto.createHash('sha256')
        .update(password)
        .digest('hex');
}
/**
 * Función que atiende una petición para traer a todos los usuarios de la base de datos.
 * Función pensada para el llenado de tablas.
 * @param {*} req La petición no contiene parámetros extra 
 * @param {*} res La respuesta de la petición.
 * @returns En caso de ser exitosa se retorna un código de estado, un mensaje referente a
 * la operación y una carga útil.
 */
const getAllUsers = async (req, res) => {
    try{
        const users = await adminRepository.getAllUsers();
        if(users === null){
            return res.status(404).json({ message: "No se encontraron usuarios" });
        }
        return res.status(200).json({ message: "Operación realizada con éxito", users: users });
    }catch(error){
        return res.status(500).json({ message: "Error cargando los usuarios", error: error.message });
    }
};
/**
 * Función que atiende una petición de búsqueda dado un criterio.
 * Puede traer uno o más usuarios dependiendo de la búsqueda.
 * Función pensada para tabular usuarios individualmente
 * @param {*} req La petición contiene el criterio de búsqueda
 * @param {*} res La respuesta de la petición
 * @returns Se retorna un código de estado, un mensaje referente al resultado de la operación y una carga útil o no.
 */
const searchUser = async (req, res) => {
    const { id, nombre, email, tel, activo, rol } = req.body;   // En la petición sólo puede haber un criterio
    try{
        // Se valida el criterio por el que se realiza la búsqueda
        let users = null;
        if(id && id > 0){
            users = await adminRepository.getUserById(id);
        }
        if(nombre && nombre !== ''){
            users = await adminRepository.getUserByName(nombre);
        }
        if(email && email !== ''){
            users = await adminRepository.getUserByEmail(email);
        }
        if(tel && tel !== ''){
            users = await adminRepository.getUserByTel(tel);
        }
        if (activo === 0 || activo === 1){
            users = await adminRepository.getUserByStatus(activo);
        }
        if(rol && (rol === 'admin' || rol === 'empleado' || rol === 'cliente')){
            users = await adminRepository.getUserByRol(rol);
        }
        // Bad request si no se indicó un criterio
        if(users === null){
            return res.status(400).json({ message: "No se encontraron usuarios" })
        }
        return res.status(200).json({ message: "Búsqueda realizada con éxito", user: users })
    }catch(error){
        // Error de servidor si la BD no pudo procesar la consulta
        return res.status(500).json({ message: "Error al buscar los usuarios", error: error.message });
    }
};
/**
 * Función que atiende una petición POST para crear un usuario.
 * Se esperan valores por defecto desde el frontend: 
 * tel = '', rol = 'cliente', activo = 1, direccion = ''
 * @param {*} req contiene los datos del nuevo usuario
 * @param {*} res respuesta de la petición
 * @returns se retorna un código de estado y un mensaje referente a la operación
 */
const createUser = async (req, res) => {
    const { name, email, password, tel, rol, activo, direccion } = req.body;
    if(!name || !email || !password || tel === null || rol === null || activo === null || direccion === null){
        return res.status(400).json({ message: "Ingresa los campos obligatorios" });
    }
    try{
        await adminRepository.createUser({ name: name, email: email, password: password, tel: tel, rol: rol, activo: activo, direccion: direccion });
        return res.status(201).json({ message: "Usuario creado con éxito" });
    }catch(error){
        return res.status(500).json({ message: "Error al insertar usuario", error: error.message });
    }
};
/**
 * Función que atiende una petición POST para eliminar un usuario lógicamente
 * Se cambia el estado del usuario dado su email
 * El borrado lógico nos permite mantener al usuario en la base de datos, pero sin brindarle acceso al sistema
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteUser = async (req, res) => {
    const { email } = req.body;
    if(!email){
        return res.status(400).json({ message: "No hay suficientes datos para completar la operación" });
    }
    try{
        await adminRepository.deleteUser(email);
        return res.status(200).json({ message: "Usuario eliminado con éxito" });
    }catch(error){
        res.status(500).json({ message: "Error al borrar un usuario", error: error.message });
    }
};
/**
 * Esta función atiende una petición de actualización de perfil de un usuario
 * Se hace la búsqueda de su información por su id para comparar qué datos requieren ser actualizados;
 * Como la contraseña, nombre, direccion, teléfono, etc.
 * Mandamos la contraseña encriptada.
 * Solo se llenan los cambios que se actualizarán
 * @param {*} req 
 * @param {*} res 
 */
const updateUser = async (req, res) => {
    const { id, name, email, password, tel, rol, activo, direccion } = req.body;
    let updateFields = [];
    let queryParams = [];
    try{
        const oldUser = await adminRepository.toCompareUser(id);
        if(password){
            const hashedPassword = getSHA256Hash(password);
            if(hashedPassword !== oldUser.CONTRASENA){
                updateFields.push("CONTRASENA = ?");
                queryParams.push(hashedPassword);
            }
        }
        if (name && name !== oldUser.NOMBRE) {
            updateFields.push('NOMBRE = ?');
            queryParams.push(name);
        }
        if(email && email !== oldUser.EMAIL){
            updateFields.push('EMAIL = ?');
            queryParams.push(email);
        }
        if(tel && tel !== oldUser.TELEFONO){
            updateFields.push('TELEFONO = ?');
            queryParams.push(tel);
        }
        if(rol && rol !== oldUser.ROL){
            updateFields.push('ROL = ?');
            queryParams.push(rol);
        }
        if(activo && activo !== oldUser.ACTIVO){
            updateFields.push('ACTIVO = ?');
            queryParams.push(activo);
        }
        if(direccion && direccion !== oldUser.DIRECCION){
            updateFields.push('DIRECCION = ?');
            queryParams.push(direccion);
        }
        if(updateFields.length === 0){
            return res.status(400).json({ message: "No se han enviado datos para actualizar" })
        }
        // Al final se debe de agregar el criterio de búsqueda para la cláusula WHERE
        queryParams.push(id);
        await adminRepository.updateUser(updateFields, queryParams);
        return res.status(200).json({ message: "Se ha actualizado el usuario con éxito" })
    }catch(error){
        return res.status(500).json({ message: "Error al actualizar usuario.", error: error.message })
    }
};

export default {
    getAllUsers,
    searchUser,
    createUser,
    deleteUser,
    updateUser
}