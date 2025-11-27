import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./config/database.js";

// Importar rutas de Auth (Las demás se irán agregando conforme me pases los archivos)
import authRoutes from "./Features/Auth/authRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Servir carpeta de imagenes estáticas
app.use('/uploads', express.static('uploads'));

app.use(
  cors({
    origin: [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://gitat.grupolosifra.com",
        "https://gitat.grupolosifra.com"
    ],
    credentials: true,
  })
);

async function testDbConnection() {
  try {
    await db.query("SELECT 1");
    console.log("✅ Conexión a BD establecida.");
  } catch (error) {
    console.error("❌ Error DB:", error.message);
  }
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', msg: 'Backend GITAT Activo 🚀' });
});

async function startServer() {
  await testDbConnection(); 

  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  });

  // Rutas activas
  app.use("/api/auth", authRoutes); 
}

startServer();