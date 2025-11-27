import { useState } from "react";
import { useAppNavigator } from "../hooks/useappNavigator.js";
import { registerUser } from "../services/authService.js"; 
import "../Style/Register.css";

function Register() {

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

    const { ToLogin } = useAppNavigator();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(""); 
    
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [tel, setTel] = useState("");
    
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [formError, setFormError] = useState("");

    const validateUsername = (name) => {
        if (name.length < 5) {
            setUsernameError("*Debe tener al menos 5 caracteres.");
            return false; 
        }
        if (!/[A-Z]/.test(name)) {
            setUsernameError("*Debe tener al menos una letra mayúscula.");
            return false;
        }
        if (!/[0-9]/.test(name)) {
            setUsernameError("*Debe tener al menos un número.");
            return false;
        }
        if (/\s/.test(name)) {
            setUsernameError("*No puede contener espacios.");
            return false;
        }
        setUsernameError(""); 
        return true; 
    };
    
    const validateEmail = (email) => {
        if (!email) {
            setEmailError("*El correo es obligatorio.");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("*Ingresa un correo válido.");
            return false;
        }
        setEmailError("");
        return true;
    };

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
            setPasswordError("*Debe tener un carácter especial (!@#$%).");
            return false;
        }
        setPasswordError("");
        return true;
    };
    
    const validateConfirm = (confirmPassValue, passValue) => {
        if (confirmPassValue !== passValue) {
            setConfirmPasswordError("Las contraseñas no coinciden.");
            return false;
        }
        setConfirmPasswordError("");
        return true;
    };

    const handleUsernameChange = (e) => {
        const newUsername = e.target.value;
        setUsername(newUsername); 
        validateUsername(newUsername); 
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        validateEmail(newEmail);
    };

    const handleTelChange = (e) => {
        setTel(e.target.value);
    };

    const handlePasswordChange = (e) => {
        const newPass = e.target.value;
        setPassword(newPass);
        validatePassword(newPass);
        if (confirmPassword) {
            validateConfirm(confirmPassword, newPass);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPass = e.target.value;
        setConfirmPassword(newConfirmPass);
        validateConfirm(newConfirmPass, password); 
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setFormError(""); 

        const isUsernameValid = validateUsername(username);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const isConfirmPasswordValid = validateConfirm(confirmPassword, password);

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            setFormError("Por favor, corrige los errores en el formulario.");
            return; 
        }

        try {
            // 🚫 ENVIAMOS TEXTO PLANO AL BACK
            const userData = {
                nombre: username, 
                email: email,
                password: password,
                ...(tel && { tel: tel }) 
            };

            await registerUser(userData);

            console.log("Registro exitoso!");
            ToLogin(); 

        } catch (error) {
            console.error('Error en el registro:', error);
            setFormError(error.message || "No se pudo conectar al servidor.");
        }
    }
    
    return (
        <form className="Form-Cont" onSubmit={handleRegisterSubmit}>
            <div className="tittle-Cont">
                <h2> Crear Cuenta</h2>
            </div>

            <h3>Nombre de Usuario</h3>
            <input 
                className="input-field" 
                type="text" 
                placeholder="Ingresa tu nombre de usuario" 
                required 
                value={username} 
                onChange={handleUsernameChange} 
            />
            {usernameError && <p className="error-message">{usernameError}</p>}
            
            <h3>Correo Electrónico</h3>
            <input 
                className="input-field" 
                type="email" 
                placeholder="Ingresa tu correo electrónico" 
                required
                value={email}
                onChange={handleEmailChange}
            />
            {emailError && <p className="error-message">{emailError}</p>}
            
            <h3>Telefono</h3>
            <input 
                className="input-field" 
                type="tel" 
                placeholder="Ingresa tu número de teléfono (Opcional)" 
                value={tel}
                onChange={handleTelChange}
            />
            
            <h3>Contraseña</h3>
            <div className="password-input">
                <input 
                    className="input-field" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Ingresa tu contraseña" 
                    required
                    value={password}
                    onChange={handlePasswordChange}
                />
                <button type="button" className="toggle-visibility-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon/> : <EyeOpenIcon/>}
                </button>
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
            
            <h3>Confirmar Contraseña</h3>
            <div className="password-input">
                <input 
                    className="input-field" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirma tu contraseña" 
                    required 
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                />
                <button type="button" className="toggle-visibility-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOffIcon/> : <EyeOpenIcon/>}
                </button>
            </div>
            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
            {formError && <p className="error-message">{formError}</p>}

            <div className="Btn-C">
                <button type="submit">Crear Cuenta</button>
            </div>
            <a id="return" onClick={ToLogin}> Ya tienes una cuenta? Inicia sesión</a>
        </form>
    )
}

export default Register;
