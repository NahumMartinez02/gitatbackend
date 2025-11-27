/**
 * Envía la petición de registro al backend.
 * @param {object} userData 
 * @returns {Promise<object>} 
 * @throws {Error} 
 */

export async function registerUser(userData) {

    const API_URL = 'http://localhost:3000/api/auth/register';

    try {

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: "include"   
        });

        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error("El servidor no devolvió un JSON válido.");
        }

        // Si la respuesta NO es ok, generamos el error que mostrará el front
        if (!response.ok) {
            throw new Error(data.message || "Ocurrió un error en el registro.");
        }

        // Todo OK → retornamos la data del backend
        return data;

    } catch (error) {
        console.error("Error en registerUser:", error);
        throw new Error(error.message || "No se pudo conectar al servidor.");
    }
}
