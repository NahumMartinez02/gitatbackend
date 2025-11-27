import axios from "axios";

export async function getFakeUserSummary(role) {
    try {
        const today = new Date();

        if (role === "cliente") {
            const res = await axios.get("http://localhost:3000/api/reservation/my-reservations", {
                withCredentials: true,
            });
            const reservations = res.data.reservations || [];

            const reservasActivas = reservations.filter(r => {
                const inicio = new Date(r.fecha_inicio);
                const fin = new Date(r.fecha_fin);
                return inicio <= today && today <= fin;
            }).length;

            const proximasReservas = reservations
                .filter(r => new Date(r.fecha_inicio) > today)
                .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

            const totalReservas = reservations.length;
            const pagosPendientes = reservations.filter(r => r.estado === "pendiente").length;

            return {
                reservasActivas,
                proximasReservas: proximasReservas[0]
                    ? new Date(proximasReservas[0].fecha_inicio).toLocaleString()
                    : "Ninguna",
                pagosPendientes,
                totalReservas
            };
        }

        if (role === "admin") {
            const [reservRes, invRes] = await Promise.all([
                axios.get("http://localhost:3000/api/reservation", { withCredentials: true }),
                axios.get("http://localhost:3000/api/inventory/general", { withCredentials: true }),
            ]);

            const reservations = reservRes.data.reservaciones || [];
            const inventory = invRes.data.inventory || [];

            const reservasHoy = reservations.filter(r => {
                const inicio = new Date(r.fecha_inicio);
                const fin = new Date(r.fecha_fin);
                return inicio <= today && today <= fin;
            }).length;

            const usuariosActivos = [...new Set(reservations.map(r => r.usuario_id))].length;

            const inventarioBajo = inventory.filter(item => item.cantidad_disponible < item.cantidad_total * 0.1).length;

            const reportesPendientes = reservations.filter(r => r.estado === "pendiente").length;

            return {
                reservasHoy,
                usuariosActivos,
                inventarioBajo,
                reportesPendientes
            };
        }

        return {};
    } catch (error) {
        console.error("Error obteniendo resumen real:", error);
        return {};
    }
}
