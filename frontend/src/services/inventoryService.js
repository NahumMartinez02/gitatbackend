import axios from "axios";

// ⬅️ MUY IMPORTANTE: permite enviar cookies httpOnly (access_token)
axios.defaults.withCredentials = true;

const API_URL = "http://localhost:3000/api/inventory";

// ---------------------------------------------
// GET → Inventario General
// ---------------------------------------------
export const getInventoryItems = async () => {
    const res = await axios.get(`${API_URL}/general`);
    return res.data.inventory; // el backend retorna { message, inventory }
};

// ---------------------------------------------
// PATCH → Editar propiedades del item
// (precio_alquiler, categoria_id, tipo_id, color_id)
// ---------------------------------------------
export const updateInventoryItem = async (id, data) => {
    const res = await axios.patch(
        `${API_URL}/general/items/${id}`,
        {
            precio_alquiler: data.precio_alquiler,
            categoria_id: data.categoria_id,
            tipo_id: data.tipo_id,
            color_id: data.color_id,
        }
    );
    return res.data;
};

// ------------------------------------------------------
// PATCH → Ajustar stock total y disponible
// ------------------------------------------------------
export const updateInventoryStock = async (id, total, disponible) => {
    const res = await axios.patch(
        `${API_URL}/general/items/${id}/stock`,
        {
            ajuste_total: total,
            ajuste_disponible: disponible,
        }
    );
    return res.data;
};

// ------------------------------------------------------
// POST → Crear un nuevo item en inventario general
// ------------------------------------------------------
export const createInventoryItem = async (data) => {
    const res = await axios.post(
        `${API_URL}/general/items`,
        {
            precio_alquiler: data.precio_alquiler,
            categoria_id: data.categoria_id,
            tipo_id: data.tipo_id,
            color_id: data.color_id,
            descripcion: data.descripcion
        }
    );

    return res.data; // backend regresará { message, id }
};
