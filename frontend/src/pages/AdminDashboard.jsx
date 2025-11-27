import { useEffect, useState } from "react";
import NavigationLayout from "../pages/Navigationlayout.jsx";
import "../Style/AdminDashboard.css";
import { getAdminDashboardData } from "../services/adminDashboardService.js";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getAdminDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <NavigationLayout>
        <h2 style={{ padding: "20px" }}>Cargando dashboard...</h2>
      </NavigationLayout>
    );
  }

  if (!dashboardData) {
    return (
      <NavigationLayout>
        <h2 style={{ padding: "20px" }}>No se pudo cargar la información.</h2>
      </NavigationLayout>
    );
  }

  const { kpis, reservasPorTipo } = dashboardData;

  return (
    <NavigationLayout>
      <div className="admin-dashboard">

        <h1 className="dashboard-title">Dashboard de Administrador</h1>

        {/* Cards de KPIs */}
        <div className="kpi-cards">
          <div className="kpi-card">
            <h3>Reservas Hoy</h3>
            <p>{kpis.reservasHoy}</p>
          </div>
          <div className="kpi-card">
            <h3>Usuarios Activos</h3>
            <p>{kpis.usuariosActivos}</p>
          </div>
          <div className="kpi-card">
            <h3>Reservas Pendientes</h3>
            <p>{kpis.reservasPendientes}</p>
          </div>
        </div>

        {/* Gráfica de reservas por tipo */}
        <div className="dashboard-chart">
          <h2>Reservas por Tipo</h2>
          <Pie 
            data={{
              labels: Object.keys(reservasPorTipo),
              datasets: [{
                label: "Cantidad de reservas",
                data: Object.values(reservasPorTipo),
                backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"],
                borderWidth: 1
              }]
            }}
          />
        </div>

      </div>
    </NavigationLayout>
  );
}

export default AdminDashboard;
