import React, { useState } from 'react';
import "../Style/ForgotPassword.css";
import "../Style/Register.css";
import { useAppNavigator } from "../hooks/useappNavigator";
import { useLocation } from "react-router-dom";
import axios from "axios";

const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.06 18.06 0 0 1 4.38-5.12M1.94 1.94 22 22"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

function ResetPassword() {
    const { ToLogin } = useAppNavigator();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 🚨 Si no hay token, no dejamos continuar
    if (!token) {
        return (
            <div className="main-C recovery-page">
                <div className="Form-Cont">
                    <p className="error-message">
                        No se encontró un token válido o ya expiró.
                    </p>
                    <button className="back-link-btn" onClick={ToLogin}>
                        Regresar al login
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/auth/reset-password", {
                token: token,
                newPassword: password
            });

            alert("¡Contraseña cambiada con éxito!");
            ToLogin();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Ocurrió un error al cambiar la contraseña.");
        }
    };

    return (
        <div className="main-C recovery-page">
            <form className="Form-Cont" onSubmit={handleSubmit}>
                <div className="tittle-Cont">
                    <h2>Restablecer Contraseña</h2>
                </div>

                <p className="instructions-text">
                    Ingresa tu nueva contraseña.
                </p>

                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}

                <h3>Nueva Contraseña</h3>
                <div className="password-input">
                    <input
                        className="input-field"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="toggle-visibility-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                    </button>
                </div>

                <h3>Confirmar Contraseña</h3>
                <div className="password-input">
                    <input
                        className="input-field"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu contraseña"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="toggle-visibility-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                    </button>
                </div>

                <div className="Btn-C">
                    <button type="submit">Cambiar Contraseña</button>
                </div>

                <div className="back-link-container">
                    <button
                        type="button"
                        className="back-link-btn"
                        onClick={ToLogin}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ResetPassword;


