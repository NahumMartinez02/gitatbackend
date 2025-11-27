import axios from "axios";

export async function getAdminDashboardData() {
  try {
    // 1️⃣ KPIs generales
    const reservasRes = await axios.get("http://localhost:3000/api/reservation");
    const inventoryRes = await axios.get("http://localhost:3000/api/inventory/general");

    const reservas = reservasRes.data.reservaciones || [];
    const inventory = inventoryRes.data.inventory || [];

    // Reservas hoy
    const today = new Date().toISOString().slice(0, 10);
    const reservasHoy = reservas.filter(r => r.fecha_inicio.startsWith(today)).length;

    // Reservas pendientes
    const reservasPendientes = reservas.filter(r => r.estado === "pendiente").length;

    // Usuarios activos (únicos)
    const usuariosActivos = new Set(reservas.map(r => r.usuario_id)).size;

    // Inventario bajo
    const inventarioBajo = inventory.filter(item => item.cantidad_disponible < item.cantidad_total * 0.1);

    // Reservas por tipo
    const reservasPorTipo = reservas.reduce((acc, r) => {
      acc[r.tipo_reserva] = (acc[r.tipo_reserva] || 0) + 1;
      return acc;
    }, {});

    return {
      kpis: {
        reservasHoy,
        reservasPendientes,
        usuariosActivos,
        inventarioBajo: inventarioBajo.length
      },
      reservasPorTipo,
      inventarioBajo
    };
  } catch (error) {
    console.error("Error al obtener dashboard data:", error);
    return null;
  }
}
