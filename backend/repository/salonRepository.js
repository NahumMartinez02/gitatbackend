// repository/salonRepository.js
import db from "../config/database.js";

/**
 * Obtiene todos los salones activos
 */
const getAllSalons = async () => {
  const rows = await db.query(
    "SELECT id, nombre, direccion, capacidad_personas, precio_base, descripcion, activo FROM SALON WHERE activo = 1"
  );
  return rows; // 🔥 devuelve el array completo
};

/**
 * Obtiene un salón por ID
 */
const getSalonById = async (id) => {
  const rows = await db.query(
    "SELECT id, nombre, direccion, capacidad_personas, precio_base, descripcion, activo FROM SALON WHERE id = ?",
    [id]
  );
  return rows[0];
};

export default {
  getAllSalons,
  getSalonById
};
