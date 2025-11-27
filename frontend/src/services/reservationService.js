const API_BASE_URL = "http://localhost:3000/api";

export const getReservations = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/reservation`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Error al obtener reservaciones");

    const data = await res.json();
    return data.reservaciones || [];
  } catch (error) {
    console.error("Error en getReservations:", error);
    return [];
  }
};

export const getReservationDetails = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/reservation/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Error al obtener detalles");

    const data = await res.json();
    return data.reservations || null;
  } catch (error) {
    console.error("Error en getReservationDetails:", error);
    return null;
  }
};

export const cancelReservation = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/reservation/${id}/info`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "cancelado" }),
    });

    if (!res.ok) throw new Error("Error al cancelar reservación");

    return true;
  } catch (error) {
    console.error("Error en cancelReservation:", error);
    return false;
  }
};
