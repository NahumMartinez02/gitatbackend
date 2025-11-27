// El controller valida la información, la procesa y da una respuesta al servidor.
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { transporter } from "../../config/mailMan.js";
import authRepository from "../../repository/authRepository.js";
import path from "path";
import { uploadDir } from "../../utils/photoHandler.js";
import fs from 'fs';

// Función que retorna un texto hasheado con sha256
function getSHA256Hash(password){
    return crypto.createHash('sha256')
        .update(password)
        .digest('hex');
}
/**
 * Funcion que atiende una petición de register.
 * En caso de ser un registro exitoso se envia un response que contiene una cookie.
 * Esta cookie contiene el token de usuario y más información.
 * Esta cookie es "atrapada" y verificada para dar autorización
 * @param {String} nombre datos del usuario
 * @param {String} email 
 * @param {String} tel 
 * @param {String} password la usaremos para comparar la contraseña del usuario. Debe de llegar hasheada con sha256
 * @returns {Http Response} respuesta con código de status, cookie (en caso de ser exitosa), mensaje de respuesta
 */
const register = async (req, res) => {
    const {nombre, email, tel, password} = req.body;
    // Si falta un campo regresa un bad request
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try{
        // Hacemos un insert, como el telefono es opcional tenemos dos opciones
        let user = null;
        if(tel){
            user = await authRepository.createUser({ nombre, email, password, tel });
        }else{
            user = await authRepository.createUser({ nombre, email, password });
        }
        // Si el usuario fue creado exitosamente creamos un correo de confirmación de registro al sistema
        await transporter.sendMail({
            from: `"Registro Exitoso" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Confirmación de Registro ✔",
            // text: `Hola ${nombre}, tu registro se ha completado con éxito. Ahora puedes iniciar sesión en nuestra plataforma.`
            html: `
                <p>Hola ${nombre},</p>
                <p>Gracias por registrarte en <strong>GITAT</strong>. Tu cuenta ha sido creada exitosamente.</p>
            `
        });
        // Si el usuario fue creado exitosamente creamos un payload para cargar sus datos
        const payload = {
            id: user.ID,
            nombre: user.NOMBRE,
            email: user.EMAIL,
            tel: user.TELEFONO,
            rol: user.ROL,
            activo: user.ACTIVO,
            photo_url: user.PHOTO_URL
        };
        // Firmamos un token con jwt y lo agregamos en una cookie al retornarlo
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res
            .cookie('access_token', token, {
                httpOnly: true, // La cookie solo puede ser accedida en el servidor
                secure: process.env.NODE_ENV === 'production',  // true envía la cookie por https
                sameSite: 'strict',     // La cookie solo puede ser accedida en el mismo dominio
                maxAge: 1000 * 60 * 60      // La cookie tiene un tiempo de vida de 1h
            })
            .json({ message: "Registro exitoso" });
    }catch( error ){
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * Funcion que atiende una petición de login.
 * En caso de ser un login exitoso se envia un response que contiene una cookie.
 * Esta cookie contiene el token de usuario y más información.
 * Esta cookie es "atrapada" y verificada para dar autorización
 * @param {String} email lo usamos como criterio de búsqueda
 * @param {String} password la usaremos para comparar la contraseña del usuario. Debe de llegar hasheada con sha256
 * @returns {Http Response} respuesta con código de status, cookie (en caso de ser exitosa), mensaje de respuesta
 */
const login = async (req, res) => {
    console.log("BODY RECIBIDO:", req.body);

    const { email, password } = req.body;
    if(!email || !password){    // Si los datos estan incompletos se aborta la operación y se retorna un status erróneo
        return res.status(400).json({ message: 'El correo y la contraseña son requeridos' })
    }
    try{
        const user = await authRepository.getUserByEmail(email);    // Se hace la consulta al repositorio
        if(!user || user.CONTRASENA !== password){
            // La contraseña tiene que ser hasheada con sha256 antes de llegar al controlador, no puede viajar en texto plano
            return res.status(401).json({ message: 'Email o contraseña incorrecto' });
        }
        // Como la contraseña coincide creamos un payload con la información del usuario
        const payload = {
            id: user.ID,
            nombre: user.NOMBRE,
            // email: user.EMAIL,   // Se ha determinado que no debemos de incluir esta información dentro de la cookie
            // tel: user.TELEFONO,  // porque es info sensible del cliente, usada únicamente para cargar datos en el sistema
            rol: user.ROL,          // Si se necesita info sensible se hace una consulta con el id
            activo: user.ACTIVO,
            photo_url: user.PHOTO_URL
        };
        // Firmamos un token con jwt y lo agregamos en una cookie al retornarlo
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res
        .cookie('access_token', token, {
            httpOnly: true, // La cookie solo puede ser accedida en el servidor
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',     // La cookie solo puede ser accedida en el mismo dominio
            maxAge: 1000 * 60 * 60      // La cookie tiene un tiempo de vida de 1h
        })
        .json({ message: "Login exitoso" });

    }catch(error){
        return res.status(404).json({ message: 'Usuario no encontrado' })
    }
};
/**
 * Esta función levanta una incidencia de olvido de contraseña, lo que levanta un token y le da una expiración.
 * Este token es almacenado en la tabla de Usuario con el usuario correspondiente.
 * Se envia un correo al usuario para corroborar que el cambio de contraseña es deseado.
 * @param {*} req contiene el email
 * @param {*} res respuesta
 * @returns Se envia una respuesta con un código de estado y un mensaje referente al cumplimiento o no de la operación.
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "El email es requerido" });
    }

    try {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExp = Date.now() + 3600000; // 1 hora

        await authRepository.updateResetToken({
            token: resetToken,
            exp: resetTokenExp,
            email: email
        });

        const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Cambio de Contraseña" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Restablecimiento de contraseña",
            html: `
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Este enlace es válido por 1 hora.</p>
                <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Se ha enviado un correo con instrucciones para el cambio de contraseña"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
/**
 * Esta función atiende la incidencia de cambio de contraseña.
 * Recibe un token para identificar quién levantó el incidente además de una contraseña en texto plano.
 * La contraseña se hashea con sha256 antes de actualizarla en la base de datos.
 * @param {*} req contiene el criterio de búsqueda en la BD, además de la nueva contraseña
 * @param {*} res respuesta
 * @returns Se envía una respuesta con un código de estado relativo al fin de la operación.
 */
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if(!token || !newPassword){
        return res.status(400).json({ message: "Petición incompleta, intentalo de nuevo" });
    }
    try{
        // Hasheamos la contraseña para que no ingrese como texto plano
        const hashedPassword = getSHA256Hash(newPassword)
        await authRepository.updatePassword({ token: token, password: hashedPassword });
        return res.status(200).json({ message: "Contraseña restablecida" })
    }catch(error){
        return res.status(500).json({ message: error.message })
    }
};
/**
 * Esta función reibe un archivo (imagen) en su request, imagen que previamente fue guardada en el sistema de archivos
 * El controller se encarga de validar la información para actualizarla en la base de datos.
 * Si algo sale mal aborta la operación, borrando la foto que fue subida para evitar basura.
 * @param {*} req contiene file y user
 * @param {*} res es la respuesta 
 * @returns Se envía una respuesta con código de estado relativo al fin de la operación.
 */
const updatePfp = async (req, res) => {
    if(!req.file){
        return res.status(400).json({ message: "No se proporcionó un archivo válido" })
    }
    try{
        const oldPhoto = req.user.photo_url;
        const fileName = req.file.filename;
        const newPhotoUrl = `/uploads/pfp/${fileName}`;
        await authRepository.updatePfp({ id: req.user.id, photoUrl: newPhotoUrl });
        if(oldPhoto){
            const oldPhotoPath = path.join(uploadDir, path.basename(oldPhoto));
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }
        return res.status(200).json({ message: "Foto actualizada exitosamente" })
    }catch(error){
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: "Algo salió mal al borrar la foto existente", error: error.message })
    }
};
/**
 * Esta función envia un archivo (imagen) en su response.
 * Si el usuario no cuenta con foto de perfil, se envia un bad request
 * @param {*} req En el middleware se incluye el usuario en caso de ser una petición válida
 * @param {*} res respuesta
 * @returns se regresa un archivo imagen [ jpg, jpge, png ].
 */
const getPfp = async (req, res) => {
    const photoUrl = req.user.photo_url;
    if(!photoUrl){
        return res.status(400).json({ message: "El usuario no tiene foto" });
    }
    // Transformamos el nombre y la ubicación de la imagen a rutas que el fs pueda leer
    const fileName = path.basename(photoUrl);
    const absPath = path.join(uploadDir, fileName);
    try{
        if(fs.existsSync(absPath)){
            return res.sendFile(absPath);
        }else{
            return res.status(404).json({ message: "Imagen no encontrada" })
        }
    }catch(error){
        return res.status(500).json({ message: "No se pudo completar la operación. Error del servidor", error: error.message })
    }
};
/**
 * Esta función atiende una petición de actualización de perfil de un usuario
 * En base a la información de su token, se hace una búsqueda de los datos que puede cambiar.
 * Como la contraseña, nombre, direccion, teléfono
 * Mandamos la contraseña encriptada.
 * Solo se llenan los cambios que se actualizarán
 * @param {*} req 
 * @param {*} res 
 */
const updateUser = async (req, res) => {
    const userId = req.user.id; // id de usuario obtenido al momento de verificar el token en el middleware
    const { nombre, password, tel, direccion } = req.body;
    let updateFields = [];
    let queryParams = [];
    try{
        const oldUser = await authRepository.getUserById(userId);
        if (password) {
            const hashedPassword = getSHA256Hash(password);
            if (hashedPassword === oldUser.CONTRASENA) {
                return res.status(400).json({ message: "La contraseña no tiene cambios" });
            }
            updateFields.push("CONTRASENA = ?")
            queryParams.push(hashedPassword);
        }
        if(nombre){
            updateFields.push("NOMBRE = ?");
            queryParams.push(nombre);
        }
        if(tel){
            updateFields.push("TELEFONO = ?");
            queryParams.push(tel);
        }
        if(direccion){
            updateFields.push("DIRECCION = ?");
            queryParams.push(direccion);
        }
        if(updateFields.length === 0){
            return res.status(400).json({ message: "No se han proporcionado datos para actualizar" });
        }
        // Al final de todo se debe de agregar el criterio de búsqueda, así concuerda con la cláusula WHERE
        queryParams.push(userId);
        await authRepository.updateUser(updateFields, queryParams);
        return res.status(200).json({ message: "Se ha actualizado el usuario con éxito. Los cambios se verán reflejados al volver a iniciar la sesión" })
    }catch(error){
        return res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
    }
};
/**
 * Se exportan las funciones que atienden distintas operaciones segun lo asigne el router
 * El Controller se encarga de atender la petición, procesar la información y dar una respuesta.
 * La respuesta consta de:
 * Un código de status [exitoso o erróneo]
 * En caso de ser erróneo envía un mensaje sobre el error para que sea atendido en el front, p. ej:
 *      [información incompleta -> muestra un modal al usuario que incite a ingresar todos los datos]
 * En caso de ser exitoso levanta una cookie con la información del usuario
 * Una segunda petición al servidor toma esa cookie y la valida para dar acceso a los recursos solicitados.
 */
export default {
    register,
    login,
    forgotPassword,
    resetPassword,
    updatePfp,
    getPfp,
    updateUser
};