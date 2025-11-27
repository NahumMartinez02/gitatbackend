import { useEffect, useState } from 'react';
import axios from 'axios';
import '../Style/UsersCrud.css';
import NavigationLayout from './NavigationLayout';

export default function UsersCrud() {
    // Mostrar errores en el front
    const [error, setError] = useState('');
    // Array para desplegar usuarios en una tabla
    const [currentUsers, setCurrentUsers] = useState([]);
    // Fetch a los usuarios
    const handleFetchUsers = async () => {
        try {
            setError('');
            const response = await axios.get('http://localhost:3000/api/admin/get-users', { withCredentials: true });
            setCurrentUsers(response.data.users);
        } catch (error) {
            setError('Error al cargar los usuarios. Refresque la página o consulte con un administrador.');
        }
    };
    // Obtiene los usuarios al cargar el componente
    useEffect(() => {
        handleFetchUsers();
    }, []); 
    // Objeto que contendrá los datos a insertar o actualizar
    const [user, setUser] = useState({
        id: 0,
        name: "",
        email: "",
        password: "",
        tel: "",
        rol: "cliente",
        activo: 1,
        direccion: ""
    });
    // Reinicia el objeto user para volverlo a usar
    const resetUserData = () => {
        setUser({
            id: 0,
            name: "",
            email: "",
            password: "",
            tel: "",
            rol: "cliente",
            activo: 1,
            direccion: ""
        });
    };
    // Creación
    // Se guardan los valores en su clave correspondiente
    const handleFormData = (e) => {
        setUser(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    // Manda la petición de creación
    const hadleCreateUser = async() => {
        try{
            setError('');
            await axios.post('http://localhost:3000/api/admin/post-user', user, { withCredentials: true });
            resetUserData();
        }catch(error){
            setError('Imposible crear un usuario con los datos actuales.');
        }finally{
            handleFetchUsers();
        }
    };
    // Edición
    const [isEditing, setIsEditing] = useState(false);
    const cancelEdition = () => {
        resetUserData();
        setIsEditing(false);
    };
    const handleUpdate = async () =>{
        try{
            setError('');
            await axios.put('http://localhost:3000/api/admin/put-user', user, { withCredentials: true });
            handleFetchUsers();
        }catch(error){
            setError('Imposible actualizar al usuario');
        }finally{
            cancelEdition();
        }
    };
    // Borrado lógico
    const handleDeleteUser = async(correo) => {
        try{
            await axios.post('http://localhost:3000/api/admin/delete-user', { email: correo }, { withCredentials: true });
            handleFetchUsers();
        }catch(error){
            setError('No se ha podido borrar este usuario.');
        }
    }
    // Búsqueda de usuarios
    const [valueToSearch, setValueToSearch] = useState({});
    const handleValueToSearch = (e) => {
        setValueToSearch(prev => ({ ...prev, [filtro]: e.target.value }));
    };
    // Filtro de búsqueda de usuarios
    const [filtro, setFiltro] = useState('nombre');
    const handleFiltro = (e) => {
        setFiltro(e.target.name);
    };
    // Fetch buscando al usuario solicitado dado un criterio de búsqueda
    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const response = await axios.post('http://localhost:3000/api/admin/search-user', valueToSearch, {withCredentials: true});
            setCurrentUsers(response.data.user);
            setValueToSearch({});
        } catch (error) {
            handleFetchUsers();
            setError('El usuario no existe');
        }
    };
    return (
        <NavigationLayout>
        <div className="user-management-panel">
            <h1>Panel de Gestión de Usuarios</h1>

            <div className="form-section">
                <h2>Formulario de Usuario</h2>
                <div>
                    <div>
                        <label>
                            Nombre:
                            <input
                                value={user.name}
                                type="text"
                                name="name"
                                onChange={handleFormData}
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Email:
                            <input
                                value={user.email}
                                type="email"
                                name="email"
                                onChange={handleFormData}
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Teléfono:
                            <input
                            value={user.tel}
                                type="tel"
                                name="tel"
                                onChange={handleFormData}
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Dirección:
                            <input
                                value={user.direccion}
                                type="text"
                                name="direccion"
                                onChange={handleFormData}
                            />
                        </label>
                    </div>
                    <div className='full-width'>
                        <label>
                            Contraseña:
                            <input
                                value={user.password}
                                type="password"
                                name="password"
                                onChange={handleFormData}
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Rol:
                            <select
                                name="rol"
                                onChange={handleFormData}
                                value={user.rol}
                            >
                                <option value="cliente">Cliente</option>
                                <option value="admin">Administrador</option>
                                <option value="empleado">Empleado</option>
                            </select>
                        </label>
                    </div>

                    <div>
                        <label>
                            Status:
                            <select
                                name="activo"
                                onChange={handleFormData}
                                value={user.activo}
                            >
                                <option value={1}>Activo</option>
                                <option value={0}>Inactivo</option>
                            </select>
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button type="button" disabled={isEditing} onClick={hadleCreateUser}>
                            Crear
                        </button>
                        <button type="button" disabled={!isEditing} onClick={handleUpdate}>
                            Actualizar
                        </button>
                        {isEditing && (
                            <button type="button" onClick={cancelEdition}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="search-section">
                <h2>Búsqueda de Usuarios</h2>
                <div className='search-wrapper'>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        onChange={handleValueToSearch}
                    />
                    <button onClick={handleSearch}>Buscar</button>
                </div>
                <div className="search-criteria">
                    <span>Buscar por: </span>
                    <button name='id' onClick={handleFiltro}>ID</button>
                    <button name='nombre' onClick={handleFiltro}>Nombre</button>
                    <button name='email' onClick={handleFiltro}>Email</button>
                    <button name='tel' onClick={handleFiltro}>Teléfono</button>
                    <button name='activo' onClick={handleFiltro}>Status</button>
                    <button name='rol' onClick={handleFiltro}>Rol</button>
                    
                </div>
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}
            </div>

            <div className="table-section">
                <h2>Lista de Usuarios</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Status</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="7">No hay usuarios para mostrar</td>
                            </tr>
                        ) : (
                            Array.isArray(currentUsers) && currentUsers.map(user => (
                                <tr key={user.ID}>
                                    <td>{user.ID}</td>
                                    <td>{user.NOMBRE.toUpperCase()}</td>
                                    <td>{user.EMAIL}</td>
                                    <td>{user.TELEFONO !== '' ? user.TELEFONO : 'SIN NÚMERO'}</td>
                                    <td>{user.ACTIVO === 1 ? 'ACTIVO' : 'INACTIVO'}</td>
                                    <td>{user.ROL.toUpperCase()}</td>
                                    <td>
                                        <button
                                            onClick={
                                                () => {
                                                    let userToUpdate = {
                                                        id: user.ID,
                                                        name: user.NOMBRE,
                                                        email: user.EMAIL,
                                                        password: "",
                                                        tel: user.TELEFONO,
                                                        rol: user.ROL,
                                                        activo: user.ACTIVO,
                                                        direccion: user.DIRECCION
                                                    };
                                                    setIsEditing(true);
                                                    setUser(userToUpdate);
                                                }
                                            }
                                        >Editar</button>
                                        <button
                                            onClick={() => {
                                                handleDeleteUser(user.EMAIL);
                                            }}
                                        >Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </NavigationLayout>
    );
}