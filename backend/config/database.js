import dotenv from 'dotenv'
import mysql from "mysql2/promise";

dotenv.config();
/**
 * Clase a importar en cada controlador
 */
class Database {
    static instance;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        // Pool de conexiones
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        Database.instance = this;
    }

    /**
     * Ejecuta una consulta SQL de forma segura.
     * @param {string} sql La consulta SQL a ejecutar.
     * @param {Array} params Los parámetros para la consulta.
     * @returns {Promise<Array>} El resultado de la consulta.
     */
    async query(sql, params) {
        try {
            /**
             * Se cambio de .execute(protocolo binario) a .query(protocolo de texto)
             * .query -> expande inteligentemente arreglos y ejecuta la sentencia en la llamada
             * .execute -> usa prepared statements, primero se preparan para el servidor y luego se ejecutan
             * ambos tienen seguridad contra inyecciones
             */
            const [rows] = await this.pool.query(sql, params);
            return rows;
        } catch (error) {
            console.error("Error al ejecutar la consulta:", error);
            throw error;
        }
    }

    /**
     *
     */
    async close() {
        await this.pool.end();
    }

    /**
     * Obtiene una conexión dedicada del pool
     * La conexión debe de ser liberada manualmente con connection.release()
     * La usamos para crear transacciones (commit, rollback, beginTrasaction)
     */
    async getConnection(){
        return await this.pool.getConnection();
    }
}

// Exportar la instancia
const instance = new Database();
Object.freeze(instance);

// module.exports = instance;
export default instance;
