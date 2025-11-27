import React, { useState, useEffect } from 'react';
import {
    getInventoryItems,
    updateInventoryItem,
    updateInventoryStock,
    createInventoryItem
} from '../services/inventoryService';
import "../Style/Register.css";
import "../Style/InventoryManagement.css";
import NavigationLayout from './NavigationLayout';

function InventoryManagement() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal Editar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [precio, setPrecio] = useState(0);
    const [categoriaId, setCategoriaId] = useState("");
    const [tipoId, setTipoId] = useState("");
    const [colorId, setColorId] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const [ajusteTotal, setAjusteTotal] = useState(0);
    const [ajusteDisponible, setAjusteDisponible] = useState(0);

    // Modal Agregar
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [newCategoria, setNewCategoria] = useState("");
    const [newTipo, setNewTipo] = useState("");
    const [newColor, setNewColor] = useState("");
    const [newPrecio, setNewPrecio] = useState("");
    const [newDescripcion, setNewDescripcion] = useState("");
    const [newTotal, setNewTotal] = useState(0);
    const [newDisponible, setNewDisponible] = useState(0);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getInventoryItems();
            setItems(data);
        } catch (err) {
            console.error("Error:", err);
            alert("Error al cargar el inventario.");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setPrecio(item.precio_alquiler);
        setCategoriaId(item.categoria_id);
        setTipoId(item.tipo_id);
        setColorId(item.color_id);
        setDescripcion(item.descripcion || "");
        setAjusteTotal(0);
        setAjusteDisponible(0);
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            await updateInventoryItem(currentItem.id, {
                precio_alquiler: parseFloat(precio),
                categoria_id: categoriaId,
                tipo_id: tipoId,
                color_id: colorId,
                descripcion: descripcion
            });

            if (ajusteTotal !== 0 || ajusteDisponible !== 0) {
                await updateInventoryStock(
                    currentItem.id,
                    parseInt(ajusteTotal),
                    parseInt(ajusteDisponible)
                );
            }

            alert("¡Item actualizado!");
            setIsModalOpen(false);
            loadItems();

        } catch (err) {
            alert("Error al actualizar el item.");
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            await createInventoryItem({
                categoria_id: parseInt(newCategoria),
                tipo_id: newTipo ? parseInt(newTipo) : null,
                color_id: newColor ? parseInt(newColor) : null,
                precio_alquiler: parseFloat(newPrecio),
                descripcion: newDescripcion,
                cantidad_total: parseInt(newTotal),
                cantidad_disponible: parseInt(newDisponible)
            });

            alert("¡Nuevo material agregado!");

            setIsAddModalOpen(false);

            setNewCategoria("");
            setNewTipo("");
            setNewColor("");
            setNewPrecio("");
            setNewDescripcion("");
            setNewTotal(0);
            setNewDisponible(0);

            loadItems();

        } catch (err) {
            console.error(err);
            alert("Error al agregar el item.");
        }
    };

    if (loading) {
        return <div className="Form-Cont"><h2>Cargando Inventario...</h2></div>
    }

    return (
        <NavigationLayout>
            <h1>Gestión de Inventario</h1>
            <div className="inventory-container">

                <button
                    className="btn-add"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Agregar Material
                </button>

                {/* CONTENEDOR CON SCROLL */}
                <div className="inventory-table-wrapper">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Precio</th>
                                <th>Disponible</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.nombre_item}</td>
                                    <td>${item.precio_alquiler}</td>
                                    <td>{item.cantidad_disponible}</td>
                                    <td>{item.cantidad_total}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => openEditModal(item)}>
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL EDITAR */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <form className="Form-Cont modal-content" onSubmit={handleUpdate}>
                            <h2>Editar Item</h2>

                            <h3>Precio Alquiler</h3>
                            <input className="input-field" type="number"
                                value={precio} onChange={e => setPrecio(e.target.value)} required />

                            <h3>Categoría ID</h3>
                            <input className="input-field"
                                value={categoriaId} onChange={e => setCategoriaId(e.target.value)} />

                            <h3>Tipo ID</h3>
                            <input className="input-field"
                                value={tipoId} onChange={e => setTipoId(e.target.value)} />

                            <h3>Color ID</h3>
                            <input className="input-field"
                                value={colorId} onChange={e => setColorId(e.target.value)} />

                            <h3>Descripción</h3>
                            <textarea className="input-field"
                                value={descripcion} onChange={e => setDescripcion(e.target.value)} />

                            <h3>Ajuste Total</h3>
                            <input className="input-field" type="number"
                                value={ajusteTotal} onChange={e => setAjusteTotal(e.target.value)} />

                            <h3>Ajuste Disponible</h3>
                            <input className="input-field" type="number"
                                value={ajusteDisponible} onChange={e => setAjusteDisponible(e.target.value)} />

                            <div className="Btn-C">
                                <button type="submit">Guardar Cambios</button>
                                <a id="return" onClick={() => setIsModalOpen(false)}>Cancelar</a>
                            </div>
                        </form>
                    </div>
                )}

                {/* MODAL AGREGAR */}
                {isAddModalOpen && (
                    <div className="modal-overlay">
                        <form className="Form-Cont modal-content" onSubmit={handleCreate}>
                            <h2>Agregar Nuevo Material</h2>

                            <h3>Categoría ID *</h3>
                            <input className="input-field" required
                                value={newCategoria} onChange={e => setNewCategoria(e.target.value)} />

                            <h3>Tipo ID</h3>
                            <input className="input-field"
                                value={newTipo} onChange={e => setNewTipo(e.target.value)} />

                            <h3>Color ID</h3>
                            <input className="input-field"
                                value={newColor} onChange={e => setNewColor(e.target.value)} />

                            <h3>Precio *</h3>
                            <input className="input-field" type="number" required
                                value={newPrecio} onChange={e => setNewPrecio(e.target.value)} />

                            <h3>Descripción</h3>
                            <textarea className="input-field"
                                value={newDescripcion} onChange={e => setNewDescripcion(e.target.value)} />

                            <h3>Cantidad Total *</h3>
                            <input className="input-field" type="number" required
                                value={newTotal} onChange={e => setNewTotal(e.target.value)} />

                            <h3>Cantidad Disponible *</h3>
                            <input className="input-field" type="number" required
                                value={newDisponible} onChange={e => setNewDisponible(e.target.value)} />

                            <div className="Btn-C">
                                <button type="submit">Agregar</button>
                                <a id="return" onClick={() => setIsAddModalOpen(false)}>Cancelar</a>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </NavigationLayout>
    );
}

export default InventoryManagement;
