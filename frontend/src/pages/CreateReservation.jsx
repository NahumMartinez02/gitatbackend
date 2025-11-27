
import { useState, useEffect } from "react"
import { getSalons, getAvailableInventory, submitReservation } from "../services/salonService"
import { useAppNavigator } from "../hooks/useappNavigator"
import "../Style/Register.css"
import "../Style/InventoryManagement.css"
import "../Style/CreateReservation.css"
import Navigationlayout from "../pages/Navigationlayout.jsx"

function CreateReservation() {
  const { ToHome } = useAppNavigator()
  const [step, setStep] = useState(1)

  const [reservation, setReservation] = useState({
    salon: null,
    fecha_inicio: "",
    fecha_fin: "",
    tipo_reserva: "privado",
    direccion_evento: "",
    telefono_contacto: "",
    items: [],
    total: 0,
  })

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  const updateReservation = (field, value) => {
    setReservation((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFinalSubmit = async () => {
    try {
      const result = await submitReservation(reservation)
      alert(result.message)
      ToHome()
    } catch (error) {
      alert(`Error al crear la reservación: ${error.message}`)
      console.error("Error completo:", error)
    }
  }

  return (
    <Navigationlayout>
    <div className="Form-Cont reservation-wizard">
      <div className="wizard-header">
        <h2>Crear Nueva Reservación</h2>
        <div className="step-indicator">
          <span className={step === 1 ? "active" : ""}>Paso 1: Evento</span>
          <span className={step === 2 ? "active" : ""}>Paso 2: Mobiliario</span>
          <span className={step === 3 ? "active" : ""}>Paso 3: Confirmar</span>
        </div>
      </div>

      <div className="wizard-content">
        {step === 1 && (
          <Step1_SelectEvent reservation={reservation} updateReservation={updateReservation} nextStep={nextStep} />
        )}
        {step === 2 && (
          <Step2_SelectItems
            reservation={reservation}
            updateReservation={updateReservation}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {step === 3 && (
          <Step3_Confirm reservation={reservation} handleFinalSubmit={handleFinalSubmit} prevStep={prevStep} />
        )}
      </div>
    </div>
    </Navigationlayout>
  )
    
}

function Step1_SelectEvent({ reservation, updateReservation, nextStep }) {
  const [salons, setSalons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSalons = async () => {
      setLoading(true)
      const data = await getSalons()
      setSalons(data)
      setLoading(false)
    }
    loadSalons()
  }, [])

  const handleNext = (e) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <Navigationlayout>
    <form onSubmit={handleNext}>
      <h3>Tipo de Reserva</h3>
      <select
        className="input-field"
        value={reservation.tipo_reserva}
        onChange={(e) => updateReservation("tipo_reserva", e.target.value)}
      >
        <option value="privado">Evento Privado (a domicilio)</option>
        <option value="salon">Renta de Salón</option>
      </select>

      {reservation.tipo_reserva === "salon" ? (
        <>
          <h3>Selecciona un Salón</h3>
          {loading ? (
            <p>Cargando salones disponibles...</p>
          ) : salons.length === 0 ? (
            <p>No hay salones disponibles en este momento.</p>
          ) : (
            <div className="salon-list">
              {salons.map((s) => (
                <div
                  key={s.id}
                  className={`item-card ${reservation.salon?.id === s.id ? "selected" : ""}`}
                  onClick={() => updateReservation("salon", s)}
                >
                  <h4>{s.nombre}</h4>
                  <p>{s.descripcion}</p>
                  <strong>${Number.parseFloat(s.precio_base).toFixed(2)}</strong>
                </div>
              ))}
            </div>
            
          )}
          
        </>
        
      ) : (
        <>
          <h3>Dirección del Evento</h3>
          <input
            className="input-field"
            type="text"
            placeholder="Calle, Número, Colonia"
            value={reservation.direccion_evento}
            onChange={(e) => updateReservation("direccion_evento", e.target.value)}
          />
        </>
      )}

      <h3>Fechas del Evento</h3>
      <div className="date-inputs">
        <input
          className="input-field"
          type="date"
          value={reservation.fecha_inicio}
          onChange={(e) => updateReservation("fecha_inicio", e.target.value)}
        />
        <input
          className="input-field"
          type="date"
          value={reservation.fecha_fin}
          onChange={(e) => updateReservation("fecha_fin", e.target.value)}
        />
      </div>

      <h3>Teléfono de Contacto</h3>
      <input
        className="input-field"
        type="tel"
        placeholder="Número de teléfono"
        value={reservation.telefono_contacto}
        onChange={(e) => updateReservation("telefono_contacto", e.target.value)}
      />

      <div className="wizard-nav">
        <button type="submit" className="btn-edit">
          Siguiente
        </button>
      </div>
    </form>
    </Navigationlayout>
  )
  
}

function Step2_SelectItems({ reservation, updateReservation, nextStep, prevStep }) {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true)
      const data = await getAvailableInventory(reservation.fecha_inicio, reservation.fecha_fin)
      setInventory(data)
      setLoading(false)
    }
    loadInventory()
  }, [reservation.fecha_inicio, reservation.fecha_fin])

  const addToCart = (item) => {
    const existingItem = reservation.items.find((i) => i.id === item.id)
    let newItems = []
    if (existingItem) {
      newItems = reservation.items.map((i) => (i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i))
    } else {
      newItems = [...reservation.items, { ...item, cantidad: 1 }]
    }
    updateReservation("items", newItems)
  }

  const removeFromCart = (itemId) => {
    const existingItem = reservation.items.find((i) => i.id === itemId)
    let newItems = []
    if (existingItem.cantidad === 1) {
      newItems = reservation.items.filter((i) => i.id !== itemId)
    } else {
      newItems = reservation.items.map((i) => (i.id === itemId ? { ...i, cantidad: i.cantidad - 1 } : i))
    }
    updateReservation("items", newItems)
  }

  if (loading) return <p>Cargando inventario disponible...</p>

  return (
    <Navigationlayout>
    <div>
      <h3>Selecciona Mobiliario Adicional</h3>
      {inventory.length === 0 ? (
        <p>No hay inventario disponible para las fechas seleccionadas.</p>
      ) : (
        <div className="inventory-selection">
          <div className="item-list">
            {inventory.map((item) => (
              <div key={item.id} className="item-card-simple">
                <span>
                  {item.nombre_item} (${Number.parseFloat(item.precio_alquiler).toFixed(2)})
                </span>
                <button type="button" className="btn-add-cart" onClick={() => addToCart(item)}>
                  +
                </button>
              </div>
            ))}
          </div>

          <div className="cart">
            <h4>Carrito</h4>
            {reservation.items.length === 0 ? (
              <p>Aún no has agregado items.</p>
            ) : (
              reservation.items.map((item) => (
                <div key={item.id} className="cart-item">
                  <span>
                    {item.cantidad}x {item.nombre_item}
                  </span>
                  <button type="button" className="btn-remove-cart" onClick={() => removeFromCart(item.id)}>
                    -
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="wizard-nav">
        <button type="button" className="btn-delete" onClick={prevStep}>
          Anterior
        </button>
        <button type="button" className="btn-edit" onClick={nextStep}>
          Siguiente
        </button>
      </div>
    </div>
    </Navigationlayout>
  )
}

function Step3_Confirm({ reservation, handleFinalSubmit, prevStep }) {
  const totalSalon = reservation.salon ? Number.parseFloat(reservation.salon.precio_base) : 0
  const totalItems = reservation.items.reduce(
    (acc, item) => acc + Number.parseFloat(item.precio_alquiler) * item.cantidad,
    0,
  )
  const totalFinal = totalSalon + totalItems

  return (
    <Navigationlayout>
    <div className="confirmation-summary">
      <h3>Confirmar Reservación</h3>

      <div className="summary-section">
        <h4>Detalles del Evento:</h4>
        <p>
          <strong>Tipo:</strong> {reservation.tipo_reserva}
        </p>
        {reservation.tipo_reserva === "salon" ? (
          <p>
            <strong>Salón:</strong> {reservation.salon?.nombre || "No seleccionado"}
          </p>
        ) : (
          <p>
            <strong>Dirección:</strong> {reservation.direccion_evento}
          </p>
        )}
        <p>
          <strong>Fecha:</strong> {new Date(reservation.fecha_inicio).toLocaleDateString()}
        </p>
        <p>
          <strong>Teléfono:</strong> {reservation.telefono_contacto}
        </p>
      </div>

      <div className="summary-section">
        <h4>Mobiliario:</h4>
        {reservation.items.length === 0 ? (
          <p>Sin mobiliario adicional.</p>
        ) : (
          <ul>
            {reservation.items.map((item) => (
              <li key={item.id}>
                {item.cantidad}x {item.nombre_item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="summary-total">
        <p>
          Subtotal Salón: <span>${totalSalon.toFixed(2)}</span>
        </p>
        <p>
          Subtotal Items: <span>${totalItems.toFixed(2)}</span>
        </p>
        <hr />
        <p>
          <strong>Total Estimado:</strong> <span>${totalFinal.toFixed(2)}</span>
        </p>
      </div>

      <div className="wizard-nav">
        <button type="button" className="btn-delete" onClick={prevStep}>
          Anterior
        </button>
        <button type="button" className="add-item-btn" onClick={handleFinalSubmit}>
          Confirmar y Crear Reserva
        </button>
      </div>
    </div>
    </Navigationlayout>
  )
}

export default CreateReservation
