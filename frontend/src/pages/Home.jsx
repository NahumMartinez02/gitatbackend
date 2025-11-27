import { useEffect, useState } from "react";
import axios from "axios";
import NavigationLayout from "../pages/Navigationlayout.jsx";
import "../Style/Home.css";
import { useNavigate } from "react-router-dom";
import { getFakeUserSummary } from "../services/UserSummaryData";

function Home() {
    const [user, setUser] = useState(null);
    const [shortcuts, setShortcuts] = useState([]);
    const [summary, setSummary] = useState(null); // ✅ nuevo estado para resumen
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await axios.get(
                    "http://localhost:3000/api/verification/get-token",
                    { withCredentials: true }
                );

                const usuario = res.data.user;
                setUser(usuario);

                // ACCESOS POR ROL
                if (usuario.rol === "cliente") {
                    setShortcuts([
                        {
                            label: "Reservar",
                            description: "Realiza una nueva reserva",
                            to: "/create-reservation"
                        },
                        {
                            label: "Mis Reservas",
                            description: "Ver y gestionar tus reservas",
                            to: "/mis-reservas"
                        },
                        {
                            label: "Perfil",
                            description: "Visualiza y administra tu perfil",
                            to: "/perfil"
                        }
                    ]);
                }

                if (usuario.rol === "admin") {
                    setShortcuts([
                        {
                            label: "Gestión de Reservas",
                            description: "Administra todas las reservas del sistema",
                            to: "/reservas"
                        },
                        {
                            label: "Gestión de Inventario",
                            description: "Control de inventario y recursos",
                            to: "/inventory-management"
                        },
                        {
                            label: "Gestión de Usuarios",
                            description: "Administra los usuarios del sistema",
                            to: "/test"
                        },
                        {
                            label: "Perfil",
                            description: "Visualiza y administra tu perfil",
                            to: "/perfil"
                        },
                        {
                            label: "Dashboard",
                            description: "Ver estadísticas y KPIs del sistema",
                            to: "/admin-dashboard"
                        },
                        {
                            label: "Reservar",
                            description: "Realiza una nueva reserva",
                            to: "/create-reservation"
                        }
                    ]);
                }

                // 🔹 Obtener resumen real desde backend
                const summaryData = await getFakeUserSummary(usuario.rol);
                setSummary(summaryData);

            } catch (error) {
                console.error("Error obteniendo usuario o resumen:", error);
            }
        }

        fetchUser();
    }, []);

    if (!user) {
        return (
            <NavigationLayout>
                <h2 style={{ padding: "20px" }}>Cargando información...</h2>
            </NavigationLayout>
        );
    }

    if (!summary) {
        return (
            <NavigationLayout>
                <h2 style={{ padding: "20px" }}>Cargando resumen...</h2>
            </NavigationLayout>
        );
    }

    return (
        <NavigationLayout>
            <div className="home-header">
                <h1 className="home-title">¡Bienvenido, {user.nombre}!</h1>

                {/* ACCESOS DIRECTOS */}
                <div className="shortcut-scroll">
                    {shortcuts.map((item) => (
                        <div
                            key={item.label}
                            className="shortcut-card"
                            onClick={() => navigate(item.to)}
                        >
                            <h3>{item.label}</h3>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>

                {/* TABLA DE RESUMEN */}
                <div className="user-summary-table">
                    <h2>Resumen</h2>
                    <div className="table-wrapper">
                        <table>
                            <tbody>
                                {Object.entries(summary).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>{key.replace(/([A-Z])/g, " $1")}</td>
                                        <td>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </NavigationLayout>
    );
}

export default Home;
