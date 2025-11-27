const API_BASE_URL = "http://localhost:3000/api"

// ----------------------------------------------------
// 1. OBTENER SALONES
// ----------------------------------------------------
export const getSalons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservation/salons`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) throw new Error("No se pudieron cargar los salones")

    const data = await response.json()
    return data.salons || []
  } catch (error) {
    console.error("Error al obtener salones:", error)
    throw error
  }
}

// ----------------------------------------------------
// 2. OBTENER INVENTARIO DISPONIBLE
// ----------------------------------------------------
export const getAvailableInventory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/general`, {
      method: "GET",
      credentials: "include",
    })

    const data = await response.json()
    return data.inventory || []
  } catch (error) {
    console.error("Error al obtener inventario:", error)
    return []
  }
}

// ----------------------------------------------------
// 3. CREAR RESERVA (CORREGIDO AL 100%)
// ----------------------------------------------------
export const submitReservation = async (reservationData) => {
  try {
  const payload = {
  tipo_reserva: reservationData.tipo_reserva,
  fecha_inicio: reservationData.fecha_inicio,
  fecha_fin: reservationData.fecha_fin,
  telefono_contacto: reservationData.telefono_contacto,

  // 🔥 Arreglo clave
  direccion_evento:
    reservationData.tipo_reserva === "salon"
      ? reservationData.salon?.direccion || "Sin dirección"
      : reservationData.direccion_evento,

  notas: reservationData.notas || "",
  salon_id: reservationData.salon?.id || null,
  metodo_pago: "efectivo",

  items: reservationData.items.map((i) => ({
    inventario_general_id: i.id,
    cantidad: i.cantidad,
    es_extra: reservationData.tipo_reserva === "salon",
  })),
}


    const response = await fetch(`${API_BASE_URL}/reservation`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.message || "Error al crear reservación")

    return { success: true, message: data.message }
  } catch (error) {
    console.error("Error al crear reservación:", error)
    throw error
  }
}
