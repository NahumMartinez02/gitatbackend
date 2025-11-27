import { useEffect, useState } from "react";
import axios from "axios";
import "../Style/Perfil.css";
import NavigationLayout from "./NavigationLayout";

function Perfil() {
    const [user, setUser] = useState(null);
    const [nombre, setNombre] = useState("");
       const [tel, setTel] = useState("");
    const [direccion, setDireccion] = useState("");
    const [password, setPassword] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validatePassword = (pass) => {
        if (pass.length < 8) {
            setPasswordError("*Debe tener al menos 8 caracteres.");
            return false;
        }
        if (!/[A-Z]/.test(pass)) {
            setPasswordError("*Debe tener al menos una mayúscula.");
            return false;
        }
        if (!/[0-9]/.test(pass)) {
            setPasswordError("*Debe tener al menos un número.");
            return false;
        }
        if (!/[!@#$%^&*]/.test(pass)) {
            setPasswordError("*Debe tener un carácter especial (!@#$%^&*).");
            return false;
        }

        setPasswordError("");
        return true;
    };

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await axios.get(
                    "http://localhost:3000/api/verification/get-token",
                    { withCredentials: true }
                );

                setUser(res.data.user);

                setNombre(res.data.user.nombre || "");
                setTel(res.data.user.tel || "");
                setDireccion(res.data.user.direccion || "");
            } catch (error) {
                console.error("Error cargando usuario:", error);
            }
        }

        fetchUser();
    }, []);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhotoPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("photo", file);

        try {
            setLoading(true);
            const res = await axios.patch(
                "http://localhost:3000/api/auth/profile-picture",
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setMsg(res.data.message);
        } catch (error) {
            console.error(error);
            setMsg("Error al subir imagen");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMsg("");

        const data = {};

        if (nombre.trim() !== user.nombre) data.nombre = nombre;
        if (tel.trim() !== user.tel) data.tel = tel;
        if (direccion.trim() !== user.direccion) data.direccion = direccion;

        if (password.trim() !== "") {
            if (!validatePassword(password)) {
                return;
            }
            data.password = password;
        }

        if (Object.keys(data).length === 0) {
            setMsg("No hay datos nuevos para actualizar.");
            return;
        }

        try {
            const res = await axios.put(
                "http://localhost:3000/api/auth/profile",
                data,
                { withCredentials: true }
            );

            setMsg(res.data.message + " (Debes volver a iniciar sesión)");
        } catch (err) {
            console.error(err);
            setMsg("Error al actualizar usuario");
        }
    };

    if (!user) return (
        <NavigationLayout>
            <h2>Cargando información...</h2>
        </NavigationLayout>
    );

    return (
        <NavigationLayout> 
            <div className="perfil-container">
                <h1>Mi Perfil</h1>

                <div className="perfil-foto-section">
                    <img
                        src={
                            photoPreview
                                ? photoPreview
                                : "http://localhost:3000/api/auth/profile/photo"
                        }
                        alt="Foto de perfil"
                        className="perfil-foto"
                    />

                    <label className="btn-upload">
                        Cambiar Foto
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: "none" }}
                        />
                    </label>
                </div>

                <form className="perfil-form" onSubmit={handleUpdate}>
                    <label>Nombre</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />

                    <label>Teléfono</label>
                    <input
                        type="text"
                        value={tel}
                        onChange={(e) => setTel(e.target.value)}
                    />

                    <label>Dirección</label>
                    <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                    />

                    <label>Contraseña (nueva)</label>
                    <input
                        type="password"
                        placeholder="Déjala vacía si no quieres cambiarla"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (e.target.value !== "") validatePassword(e.target.value);
                            else setPasswordError("");
                        }}
                    />

                    {passwordError && (
                        <p style={{ color: "red", fontSize: "13px", marginTop: "-5px" }}>
                            {passwordError}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Actualizando..." : "Guardar Cambios"}
                    </button>
                </form>

                {msg && <p className="perfil-msg">{msg}</p>}
            </div>
        </NavigationLayout>
    );
}

export default Perfil;