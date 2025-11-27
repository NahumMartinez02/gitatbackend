import React, { useState } from 'react';
import axios from "axios";
import "../Style/ForgotPassword.css"
import { useAppNavigator } from "../hooks/useappNavigator";

function ForgotPassword() {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { ToLogin } = useAppNavigator();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post(
                "http://localhost:3000/api/auth/forgot-password",
                { email },
                { withCredentials: true }
            );

            setMessage(res.data.message);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Error en la solicitud");
            } else {
                setError("Error de conexión con el servidor");
            }
        }

        setLoading(false);
    };

    return (
        <div className="main-C recovery-page">
            <form className="Form-Cont" onSubmit={handleSubmit}>

                <div className="tittle-Cont">
                    <h2>Recuperar Contraseña</h2>
                </div>

                <p className="instructions-text">
                    Ingresa tu correo electrónico y te enviaremos un enlace para
                    restablecer tu contraseña.
                </p>

                <h3>Correo Electrónico</h3>

                <input
                    className="input-field"
                    type="email"
                    placeholder="Ingresa tu correo"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {message && <p className="success-msg">{message}</p>}
                {error && <p className="error-msg">{error}</p>}

                <div className="Btn-C">
                    <button type="submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar Enlace"}
                    </button>
                </div>

                <div className="back-link-container">
                    <button
                        type="button"
                        className="back-link-btn"
                        onClick={ToLogin}
                    >
                        Volver a Inicio de Sesión
                    </button>
                </div>

            </form>
        </div>
    );
}

export default ForgotPassword;
