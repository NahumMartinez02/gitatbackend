import inventoryRepository from "../../repository/inventoryRepository.js";
import reservationRepository from "../../repository/reservationRepository.js";
import salonRepository from "../../repository/salonRepository.js";

/**
 * Función que atiende una petición POST para crear una reservación:
 */
const createReservation = async (req, res) => {
  console.log("\n========== 🟦 NUEVA RESERVACIÓN RECIBIDA 🟦 ==========");
  console.log("Usuario autenticado:", req.user);
  console.log("Body recibido:", req.body);

  const { id } = req.user;

  try {
    const {
      tipo_reserva,
      fecha_inicio,
      fecha_fin,
      telefono_contacto,
      direccion_evento,
      notas,
      items,
      metodo_pago,
      salon_id,
    } = req.body;

    if (
      !tipo_reserva ||
      !fecha_inicio ||
      !fecha_fin ||
      !telefono_contacto ||
      !items ||
      !metodo_pago
    ) {
      return res.status(400).json({
        message:
          "No se han proporcionado datos suficientes para crear una reservación",
      });
    }

    if (
      tipo_reserva === "privado" &&
      (items.length === 0 || !direccion_evento || salon_id)
    ) {
      return res.status(400).json({
        message:
          "No se han proporcionado datos suficientes para crear una reserva privada",
      });
    }

    if (tipo_reserva === "salon" && (!salon_id || !direccion_evento)) {
      return res.status(400).json({
        message:
          "No se han proporcionado datos suficientes para crear una reservación de salón",
      });
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    const dias_alquiler =
      Math.ceil(Math.abs(fin - inicio) / (1000 * 60 * 60 * 24)) || 1;

    let insertFields = [
      "usuario_id",
      "tipo_reserva",
      "fecha_inicio",
      "fecha_fin",
      "telefono_contacto",
      "direccion_evento",
    ];
    let placeholders = ["?", "?", "?", "?", "?", "?"];
    let queryParams = [
      id,
      tipo_reserva,
      fecha_inicio,
      fecha_fin,
      telefono_contacto,
      direccion_evento,
    ];

    if (notas) {
      insertFields.push("notas");
      placeholders.push("?");
      queryParams.push(notas);
    }

    let detallesReservaItems = [];

    if (items.length > 0) {
      const ids = items.map((i) => i.inventario_general_id);
      const productos = await inventoryRepository.getPricesAndStockByIds(ids);

      const mapProductos = {};
      productos.forEach((p) => (mapProductos[p.id] = p));

      for (let item of items) {
        const productoReal = mapProductos[item.inventario_general_id];

        if (!productoReal)
          throw new Error(`Objeto ${item.inventario_general_id} inexistente`);

        if (productoReal.cantidad_disponible < item.cantidad)
          throw new Error(
            `Stock insuficiente para ID ${item.inventario_general_id}`
          );

        const precio_unitario = productoReal.precio_alquiler;
        const subtotal = precio_unitario * item.cantidad * dias_alquiler;
        const esExtraValue = tipo_reserva === "salon";

        detallesReservaItems.push([
          item.inventario_general_id,
          item.cantidad,
          precio_unitario,
          dias_alquiler,
          subtotal,
          esExtraValue,
        ]);
      }
    }

    let detalleReservaSalon = [];

    if (tipo_reserva === "salon") {
      const precio_salon = await inventoryRepository.getPartyRoomPriceById(
        salon_id
      );

      if (!precio_salon) {
        throw new Error(
          `El salón con ID ${salon_id} no existe o no tiene precio_base.`
        );
      }

      const subtotal_salon = precio_salon.precio_base * dias_alquiler;

      detalleReservaSalon.push(
        salon_id,
        precio_salon.precio_base,
        dias_alquiler,
        subtotal_salon
      );
    }

    await reservationRepository.createDetailsReservationItems(
      detallesReservaItems,
      insertFields,
      placeholders,
      queryParams,
      metodo_pago,
      detalleReservaSalon
    );

    return res.status(201).json({ message: "Reservación creada con éxito" });
  } catch (error) {
    console.error("\n🔥🔥 ERROR FATAL EN createReservation 🔥🔥");
    console.error(error);

    return res.status(500).json({
      message: "Error al crear una reservación",
      error: error.message,
    });
  }
};

/**
 * GET: Reservaciones de usuario
 */
const getReservationsByUserId = async (req, res) => {
  const { id } = req.user;

  if (!id || id < 1)
    return res.status(400).json({ message: "No se han proporcionado datos válidos" });

  try {
    const reservations = await reservationRepository.getReservationsByUserId(id);
    return res.status(200).json({
      message: "La operación se ha realizado con éxito",
      reservations: reservations,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al traer reservaciones del usuario",
      error: error.message,
    });
  }
};

/**
 * GET: Detalle de reservación para cliente
 */
const getDetailsToClientByReservationId = async (req, res) => {
  const { id } = req.params;

  if (!id || id < 1)
    return res.status(400).json({ message: "No se han proporcionado datos válidos" });

  try {
    const details =
      await reservationRepository.getDetailsByReservationById(id);
    return res.status(200).json({
      message: "La operación se ha realizado con éxito",
      details: details,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al cargar los detalles de la reservación",
      error: error.message,
    });
  }
};

/**
 * GET: Reservaciones generales (admin/empleado)
 */
const getReservations = async (req, res) => {
  const { fecha_inicio, fecha_fin, estado, tipo, cliente, validar } = req.query;

  let reservaciones = [];

  try {
    if (fecha_inicio) {
      const fin = fecha_fin || fecha_inicio;
      reservaciones = await reservationRepository.getReservationsBetweenDates(
        fecha_inicio,
        fin
      );
    } else if (estado) {
      reservaciones = await reservationRepository.getReservationsByState(estado);
    } else if (tipo) {
      reservaciones = await reservationRepository.getReservationsByType(tipo);
    } else if (cliente) {
      reservaciones =
        await reservationRepository.getReservationsByUsername(cliente);
    } else if (validar) {
      reservaciones = await reservationRepository.getReservationsToValidate();
    } else {
      reservaciones = await reservationRepository.getAllReservations();
    }

    return res.status(200).json({
      message: "Operación realizada con éxito",
      reservaciones: reservaciones,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al procesar las reservaciones",
      error: error.message,
    });
  }
};

/**
 * GET: Detalle de reservación para empleado
 */
const getDetailsToEmployeeByReservationId = async (req, res) => {
  const { id } = req.params;

  if (!id || id < 1)
    return res.status(400).json({ message: "No se han proporcionado datos válidos" });

  try {
    const reservations =
      await reservationRepository.getDetailsToEmployeeByReservationById(id);

    return res.status(200).json({
      message: "Operación realizada con éxito",
      reservations: reservations,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al procesar los detalles de la reservación",
      error: error.message,
    });
  }
};

/**
 * PATCH: Actualizar info general
 */
const updateGeneralReservationInfo = async (req, res) => {
  const { id: reserv_id } = req.params;
  const { telefono_contacto, notas, empleado_id, estado } = req.body;
  const { id: emp_id } = req.user;

  let updateFields = [];
  let queryParams = [];

  if (!reserv_id || reserv_id < 1)
    return res.status(400).json({
      message: "No se han proporcionado datos válidos para la operación",
    });

  try {
    const oldReservation = await reservationRepository.getReservationById(reserv_id);

    if (telefono_contacto && telefono_contacto !== oldReservation.telefono_contacto) {
      updateFields.push("telefono_contacto = ?");
      queryParams.push(telefono_contacto);
    }

    if (notas && notas !== oldReservation.notas) {
      updateFields.push("notas = ?");
      queryParams.push(notas);
    }

    if (empleado_id && emp_id !== oldReservation.empleado_id) {
      updateFields.push("empleado_id = ?");
      queryParams.push(emp_id);
    }

    
    if (estado && estado !== oldReservation.estado) {
      updateFields.push("estado = ?");
      queryParams.push(estado);
    }

    if (updateFields.length === 0)
      return res.status(400).json({ message: "No se han enviado datos para actualizar" });

    queryParams.push(reserv_id);

    await reservationRepository.updateGeneralReservationInfo(updateFields, queryParams);

    return res.status(200).json({
      message: "Se ha actualizado la información de la reservación exitosamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar la reservación",
      error: error.message,
    });
  }
};


const getAllSalons = async (req, res) => {
  try {
    const salons = await salonRepository.getAllSalons();

    if (!salons || salons.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay salones registrados", salons: [] });
    }

    return res.status(200).json({ message: "Operación exitosa", salons });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener salones",
      error: error.message,
    });
  }
};

export default {
  getAllSalons,
  createReservation,
  getReservationsByUserId,
  getDetailsToClientByReservationId,
  getReservations,
  getDetailsToEmployeeByReservationId,
  updateGeneralReservationInfo,
};
