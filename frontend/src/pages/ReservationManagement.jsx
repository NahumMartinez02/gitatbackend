import React, { useState, useEffect } from "react";
import {
  getReservations,
  cancelReservation,
  getReservationDetails,
} from "../services/reservationService";
import "../Style/InventoryManagement.css";
import "../Style/CreateReservation.css";
import "../Style/ReservationManagement.css"; 
import Navigationlayout from "./Navigationlayout.jsx";

const API_BASE_URL = "http://localhost:3000/api"; // necesario para handleComplete

function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDetails, setCurrentDetails] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filterState, filterType, filterDate, reservations]);

  const loadReservations = async () => {
    setLoading(true);
    const data = await getReservations();
    setReservations(data);
    setLoading(false);
  };

  const applyFilters = () => {
    let result = [...reservations];

    if (search.trim() !== "") {
      result = result.filter((r) =>
        `${r.usuario_nombre} ${r.id} ${r.tipo_reserva} ${r.estado} ${r.direccion_evento}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (filterState !== "") result = result.filter((r) => r.estado === filterState);
    if (filterType !== "") result = result.filter((r) => r.tipo_reserva === filterType);
    if (filterDate !== "") result = result.filter((r) => r.fecha_inicio.split("T")[0] === filterDate);

    setFiltered(result);
    setPage(1);
  };

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleViewDetails = async (id) => {
    setCurrentDetails(null);
    setIsModalOpen(true);

    const details = await getReservationDetails(id);
    if (details) {
      if (details.items) {
        details.items = details.items.map((item) => ({
          ...item,
          subtotal: Number(item.subtotal) || 0,
        }));
      }
      if (details.salon) {
        details.salon.precio_salon = Number(details.salon.precio_salon) || 0;
      }
    }

    setCurrentDetails(details);
  };

  const handleCancel = async (id) => {
    if (window.confirm("¿Deseas cancelar esta reservación?")) {
      await cancelReservation(id);
      loadReservations();
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm("¿Deseas marcar esta reservación como completada?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/reservation/${id}/info`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "finalizado" }),
        });
        if (!res.ok) throw new Error("Error al marcar como completado");
        loadReservations();
      } catch (error) {
        console.error("Error en handleComplete:", error);
        alert("No se pudo marcar la reservación como completada.");
      }
    }
  };

  if (loading) {
    return (
      <div className="Form-Cont">
        <h2>Cargando Reservaciones...</h2>
      </div>
    );
  }

  const getStatusChip = (status) => {
    return <span className={`status-chip ${status}`}>{status}</span>;
  };

  return (
    <Navigationlayout>
      <div className="reservation-container">
        {/* 🔍 Barra de búsqueda y filtros */}
        <div className="filters-container">
          <input
            type="text"
            placeholder="Buscar por cliente, ID, tipo, estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="filter-select"
          >
            <option value="">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">Tipo</option>
            <option value="salon">Salón</option>
            <option value="privado">Privado</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-date"
          />
        </div>

        {/* TABLA MEJORADA */}
        <div className="table-container">
          <table className="reservations-table improved-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((res) => (
                <tr key={res.id}>
                  <td>{res.id}</td>
                  <td>{res.usuario_nombre}</td>
                  <td>{res.tipo_reserva}</td>
                  <td>{new Date(res.fecha_inicio).toLocaleDateString()}</td>
                  <td>{getStatusChip(res.estado)}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => handleViewDetails(res.id)}>
                      Ver Detalles
                    </button>

                    {res.estado !== "cancelado" && res.estado !== "finalizado" && (
                      <>
                        <button className="btn-complet" onClick={() => handleComplete(res.id)}>
                          Marcar como Completado
                        </button>
                        <button className="btn-delete" onClick={() => handleCancel(res.id)}>
                          Cancelar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ◀
          </button>

          <span>
            Página {page} de {totalPages}
          </span>

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            ▶
          </button>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div
              className="Form-Cont modal-content reservation-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {!currentDetails ? (
                <p>Cargando detalles...</p>
              ) : (
                <>
                  <h2>Reserva #{currentDetails.id}</h2>

                  <p>
                    <strong>Cliente:</strong> {currentDetails.usuario_nombre}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {currentDetails.direccion_evento}
                  </p>

                  <hr />

                  <h4>Mobiliario</h4>
                  <ul>
                    {currentDetails.items?.length > 0 ? (
                      currentDetails.items.map((item, i) => (
                        <li key={i}>
                          {item.cantidad}x {item.nombre_item} — $
                          {(Number(item.subtotal) || 0).toFixed(2)}
                        </li>
                      ))
                    ) : (
                      <li>No hay mobiliario registrado</li>
                    )}
                  </ul>

                  {currentDetails.salon && (
                    <>
                      <hr />
                      <h4>Salón</h4>
                      <p>
                        {currentDetails.salon.nombre} — $
                        {(Number(currentDetails.salon.precio_salon) || 0).toFixed(2)}
                      </p>
                    </>
                  )}

                  <hr />

                  <p>
                    <strong>Total:</strong> $
                    {(
                      (currentDetails.items?.reduce(
                        (sum, item) => sum + (Number(item.subtotal) || 0),
                        0
                      ) || 0) +
                      (Number(currentDetails.salon?.precio_salon) || 0)
                    ).toFixed(2)}
                  </p>

                  <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Navigationlayout>
  );
}

export default ReservationManagement;
