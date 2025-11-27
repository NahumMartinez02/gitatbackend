import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../Style/NavigationLayout.css";

export default function NavigationLayout({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();

    const currentPath = location.pathname;

    // ===============================
    // Obtener usuario (misma lógica que usas en Perfil y Home)
    // ===============================
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await axios.get(
                    "http://localhost:3000/api/verification/get-token",
                    { withCredentials: true }
                );
                setUser(res.data.user);
            } catch (err) {
                console.error("Error cargando usuario:", err);
            }
        }

        fetchUser();
    }, []);


    const baseMenu = [
        { name: "Inicio", path: "/home" },
        { name: "Mi Perfil", path: "/perfil" },
        { name: "Mis Reservas", path: "/reservas" },
        {name: "Reservar", path: "/create-reservation"}
    ];

   
    const adminMenu = [
        { name: "Gestión de Usuarios", path: "/test" },
        { name: "Gestión de Inventario", path: "/inventory-management" },
        { name: "Dashboard", path: "/admin-dashboard" }
    ];


    let menuItems = baseMenu;

    if (user?.rol === "admin") {
        menuItems = [...baseMenu, ...adminMenu];
    }

    return (
        <div className="layout-container">

            {/* Botón hamburguesa */}
            <button
                className="hamburger-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`line ${isOpen ? "open" : ""}`}></div>
                <div className={`line ${isOpen ? "open" : ""}`}></div>
                <div className={`line ${isOpen ? "open" : ""}`}></div>
            </button>

            {/* Menú desplegable */}
            <nav className={`dropdown-menu ${isOpen ? "open" : ""}`}>
                <ul>
                    {menuItems
                        .filter(item => item.path !== currentPath)  
                        .map(item => (
                            <li key={item.path}>
                                <a
                                    href={item.path}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </a>
                            </li>
                        ))}
                </ul>
            </nav>

            <div className="content">{children}</div>
        </div>
    );
}
