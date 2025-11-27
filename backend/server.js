import authRoutes from "./Features/Auth/authRoutes.js";
import authorizationRoutes from "./Features/Authorization/authorizationRoutes.js";
import adminRoutes from "./Features/Admin/adminRoutes.js";
import inventoryRoutes from './Features/Inventory/inventoryRoutes.js';
import reservationRoutes from './Features/Reservations/reservationRoutes.js';
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./config/database.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json()); // Permite parsear correctamente json en express
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000", 
             "http://localhost:5173"],
    credentials: true,
  })
);

// funcion para verificar que la DB este encendida
async function testDbConnection() {
  try {
    // Consulta para verificar la conexion
    await db.query("SELECT 1");
    console.log("✅ Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    //
    console.error("No se pudo conectar a la base de datos:", error.message);
    process.exit(1); // Detiene el proceso con un código de error
  }
}

//Función que prueba e inicia el servidor

async function startServer() {
  await testDbConnection(); // prueba que la DB fucione

  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });

  app.use("/api/auth", authRoutes); // Ruta que maneja los recursos de autenticación
  app.use("/api/verification", authorizationRoutes); // Ruta que maneja los recursos de autorización
  app.use("/api/admin", adminRoutes); // Ruta que maneja los recursos de administrador
  app.use("/api/inventory", inventoryRoutes); // Ruta que maneja los recursos de inventario
  app.use('/api/reservation', reservationRoutes);
}

// Iniciar
startServer();
