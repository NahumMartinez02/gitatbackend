import "../Style/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import milogo from "../assets/milogo.png";
import axios from "axios";

//Función para hashear contraseña a SHA-256 HEX
async function hashPasswordToHex(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmail = (e) => setEmail(e.target.value);
    const handlePassword = (e) => setPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Debes ingresar email y contraseña");
            return;
        }

        try {
            const hashedPassword = await hashPasswordToHex(password);
            console.log("Contraseña hashed:", hashedPassword);

            // Enviar hash al backend
            const loginResponse = await axios.post(
                "http://localhost:3000/api/auth/login",
                {
                    email: email.trim(),
                    password: hashedPassword,
                },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            );

            console.log("Login OK:", loginResponse.data);

            const response = await axios.get(
                "http://localhost:3000/api/verification/get-token",
                { withCredentials: true }
            );

            console.log("Token data:", response.data);

            const userRole = response.data.user?.rol;

            if (userRole === "admin") {
                navigate("/home");
            } else if (userRole === "cliente") {
                navigate("/home");
            } else if (userRole === "empleado") {
                navigate("/home"); 
            } else {
                setError("Rol de usuario no reconocido");
            }
        } catch (err) {
            console.log("ERROR AXIOS:", err.response?.data || err);
            setError(err.response?.data?.msg || "Correo o contraseña inválidos");
        }
    };

    return (
        <div className="main-cont">
            <form className="c1" onSubmit={handleSubmit}>
                <h2>Iniciar Sesión</h2>

                <h3>Usuario</h3>
                <input
                    type="email"
                    placeholder="Ingresa tu correo"
                    required
                    name="email"
                    value={email}
                    onChange={handleEmail}
                />

                <h3>Contraseña</h3>
                <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    required
                    name="password"
                    value={password}
                    onChange={handlePassword}
                />

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <div className="Btn-c">
                    <button type="submit">Iniciar Sesión</button>
                    <button type="button" onClick={() => navigate("/register")}>
                        Registrarse
                    </button>
                </div>

                <a id="forgot-password" onClick={() => navigate("/forgot-password")}>
                    ¿Olvidaste tu contraseña?
                </a>
            </form>

            <div className="c2">
                <img src={milogo} className="logo" alt="Logo" />
            </div>
        </div>
    );
}

export default Login;
