import inventoryRepository from "../../repository/inventoryRepository.js";

/**
 * GET - Obtener inventario general
 */
const getGeneralInventory = async (req, res) => {
    try {
        const inv = await inventoryRepository.getGeneralInventory();
        if (inv === null) {
            return res.status(404).json({ message: "No hay un inventario registrado" });
        }
        return res.status(200).json({ message: "Operación realizada con éxito", inventory: inv });
    } catch (error) {
        return res.status(500).json({ message: "Error al cargar el inventario general", error: error.message });
    }
};

/**
 * GET - Obtener inventario de un salón por ID
 */
const getPartyRoomInventory = async (req, res) => {
    const { id } = req.params;
    if (!id || id <= 0) {
        return res.status(400).json({ message: "No se proporcionó un id válido" });
    }
    try {
        const inv = await inventoryRepository.getPartyRoomInventory(id);
        if (inv === null) {
            return res.status(404).json({ message: "No hay inventario registrado para este salón" });
        }
        return res.status(200).json({ message: "Operación realizada con éxito", inventory: inv });
    } catch (error) {
        return res.status(500).json({ message: "Error al cargar el inventario del salón solicitado", error: error.message });
    }
};

/**
 * POST - Crear un nuevo item en inventario general
 */
const createGeneralInventoryItem = async (req, res) => {
    const { categoria_id, tipo_id, color_id, precio_alquiler, descripcion } = req.body;

    if (!categoria_id || !precio_alquiler || !tipo_id) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    try {
        // Obtener nombres para construir nombre_item
        const { nombre: nombreCategoria } = await inventoryRepository.getCategoryNameById(categoria_id);
        const { nombre: nombreTipo } = await inventoryRepository.getTypeNameById(tipo_id);

        let nombreColor = null;
        if (color_id) {
            const color = await inventoryRepository.getColorNameById(color_id);
            nombreColor = color?.nombre || null;
        }

        const nombreItem = [nombreCategoria, nombreTipo, nombreColor]
            .filter(Boolean)
            .join(" ");

        const newId = await inventoryRepository.createGeneralInventoryItem(
            categoria_id,
            tipo_id,
            color_id,
            precio_alquiler,
            nombreItem,
            descripcion
        );

        return res.status(201).json({
            message: "Item creado correctamente",
            id: newId
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error al crear item",
            error: error.message
        });
    }
};

/**
 * PATCH - Actualizar propiedades de un item del inventario general
 */
const updateGeneralInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { precio_alquiler, categoria_id, tipo_id, color_id } = req.body;

    let updateFields = [];
    let queryParams = [];
    let needsNameUpdate = false;

    let newNameParts = {
        categoria: null,
        tipo: null,
        color: null
    };

    if (!id || id <= 0) {
        return res.status(400).json({ message: "No se ha proporcionado un id válido" });
    }

    try {
        const oldItem = await inventoryRepository.getGeneralInventoryItemById(id);

        if (precio_alquiler && precio_alquiler !== oldItem.precio_alquiler) {
            updateFields.push("precio_alquiler = ?");
            queryParams.push(precio_alquiler);
        }

        if (categoria_id && categoria_id !== oldItem.categoria_id) {
            updateFields.push("categoria_id = ?");
            queryParams.push(categoria_id);
            needsNameUpdate = true;
        }

        if (tipo_id && tipo_id !== oldItem.tipo_id) {
            updateFields.push("tipo_id = ?");
            queryParams.push(tipo_id);
            needsNameUpdate = true;
        }

        if (color_id && color_id !== oldItem.color_id) {
            updateFields.push("color_id = ?");
            queryParams.push(color_id);
            needsNameUpdate = true;
        }

        // Cambiar nombre si es necesario
        if (needsNameUpdate) {
            const catId = categoria_id || oldItem.categoria_id;
            const tipoId = tipo_id || oldItem.tipo_id;
            const colorId = color_id || oldItem.color_id;

            const { nombre: nombreCategoria } = await inventoryRepository.getCategoryNameById(catId);
            newNameParts.categoria = nombreCategoria;

            const { nombre: nombreTipo } = await inventoryRepository.getTypeNameById(tipoId);
            newNameParts.tipo = nombreTipo;

            if (colorId) {
                const { nombre: nombreColor } = await inventoryRepository.getColorNameById(colorId);
                newNameParts.color = nombreColor;
            }

            const nuevoNombre = [
                newNameParts.categoria,
                newNameParts.tipo,
                newNameParts.color
            ]
                .filter(Boolean)
                .join(" ");

            if (nuevoNombre !== oldItem.nombre_item) {
                updateFields.push("nombre_item = ?");
                queryParams.push(nuevoNombre);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No se han enviado datos para actualizar" });
        }

        queryParams.push(id);
        await inventoryRepository.updateInventoryGeneralItem(updateFields, queryParams);

        return res.status(200).json({ message: "Se han actualizado las propiedades del objeto correctamente" });

    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar inventario", error: error.message });
    }
};

/**
 * PATCH - Actualizar stock general
 */
const updateGeneralInventoryStock = async (req, res) => {
    const { id } = req.params;
    let { ajuste_total, ajuste_disponible } = req.body;

    if (!id) {
        return res.status(400).json({ message: "No se proporcionó un id válido" });
    }

    try {
        ajuste_total = ajuste_total ?? 0;
        ajuste_disponible = ajuste_disponible ?? 0;

        await inventoryRepository.updateGeneralInventoryStock(ajuste_total, ajuste_disponible, id);

        return res.status(200).json({ message: "Stock actualizado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el stock", error: error.message });
    }
};

/**
 * PATCH - Actualizar stock del inventario de un salón
 */
const updatePartyRoomInventoryStock = async (req, res) => {
    const { salonId, itemId } = req.params;
    let { ajuste } = req.body;

    if (!salonId || !itemId) {
        return res.status(400).json({ message: "No se han proporcionado datos válidos" });
    }

    try {
        ajuste = ajuste ?? 0;

        await inventoryRepository.updatePartyRoomInventoryStock(ajuste, itemId, salonId);

        return res.status(200).json({ message: "Stock actualizado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el stock", error: error.message });
    }
};

export default {
    getGeneralInventory,
    getPartyRoomInventory,
    createGeneralInventoryItem,
    updateGeneralInventoryItem,
    updateGeneralInventoryStock,
    updatePartyRoomInventoryStock
};
