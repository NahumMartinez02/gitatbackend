import jwt from 'jsonwebtoken';

/**
 * Función que se encarga de autorizar a los usuarios para ingresar al sistema.
 * Esta función no funge como middleware, al registrarse o iniciar sesión
 * los usuarios levantan una cookie con su token pero para poder ver el contenido del 
 * sistema, alguien debe validar esa cookie, en todo caso se hace una llamada a este método.
 * Esta función es asíncrona porque no es un middleware
 * @param {Cookie} req 
 * @returns response que contiene token de usuario e información del usuario.
 */
const getToken = async (req, res) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: "No se proporciono un token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ token: token, user: decoded });
    } catch (error) {
        return res.status(403).json({ message: "Token Invalido" });
    }
};
/**
 * Esta función actúa como middleware, verificando el token del usuario para brindar acceso.
 * Este es el tunel que filtra las peticiones entre capas, antes de llegar al controlador se 
 * corrobora la autorización a través del token.
 * @param {*} req petición Inicial.
 * @param {*} res respuesta que se atenderá en la siguiente capa.
 * @param {*} next pasa el control a la siguiente capa.
 * @returns si el token es inválido, aborta la solicitud porque no hay autorización.
 */
const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: "No se proporciono un token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token invalido. Acceso denegado" });
    }
};
/**
 * Esta función es un middleware que verifica los permisos de administrador del usuario logeado por su cookie.
 * En caso de que su token sea inválido o no exista, no hay autorización porque debe de logearse.
 * Si el token es válido se decodifica y se compara el rol del usuario con el rol de administrador.
 * Si tiene permisos avanza a la siguiente capa
 * @param {*} req petición Inicial.
 * @param {*} res respuesta que se atenderá en la siguiente capa.
 * @param {*} next pasa el control a la siguiente capa.
 * @returns si el token es inválido o no tiene permisos aborta la operación.
 */
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token){
        return res.status(401).json({ message: "No se proporcionó un token de autenticación" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.rol !== "admin") {
            return res.status(403).json({ message: "Se requieren permisos de administrador" });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" })
    }
}
/**
 * Esta función es un middleware que verifica los permisos de empleado del usuario logeado por su cookie.
 * En caso de que su token sea inválido o no exista, no hay autorización porque debe de logearse.
 * Si el token es válido se decodifica y se compara el rol del usuario con el rol de empleado o administrador.
 * Si tiene permisos avanza a la siguiente capa
 * @param {*} req petición Inicial.
 * @param {*} res respuesta que se atenderá en la siguiente capa.
 * @param {*} next pasa el control a la siguiente capa.
 * @returns si el token es inválido o no tiene permisos aborta la operación.
 */
const verifyStaff = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: "No se proporcionó un token de autenticación" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.rol === 'cliente') {
            return res.status(403).json({ message: "Se requieren permisos de empleado o mayores" });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido" })
    }
}
/**
 * Borra la cookie y el usuario del local storage
 * @param {*} req petición inicial
 * @param {*} res respuesta
 * @returns si falla porque no existe una cookie manda un estado de éxito
 */
const removeToken = async (req, res) => {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return res.clearCookie('access_token').json({ message: "Cookie removed" });
    } catch (error) {
        return res.status(200).json({ message: "Cookie inexistente" });
    }
};

export default{
    getToken,
    verifyToken,
    verifyAdmin,
    verifyStaff,
    removeToken
};