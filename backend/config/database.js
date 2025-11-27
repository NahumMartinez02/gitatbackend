import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

class Database {
    static instance;

    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE, 
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        Database.instance = this;
    }

    async query(sql, params) {
        try {
            const [rows] = await this.pool.query(sql, params);
            return rows;
        } catch (error) {
            console.error("Error SQL:", error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }

    async getConnection() {
        return await this.pool.getConnection();
    }
}

const instance = new Database();
export default instance;