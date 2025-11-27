

-- Tabla USUARIO
CREATE TABLE USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255) NOT NULL DEFAULT '',
    rol ENUM('cliente', 'empleado', 'admin') NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla INVENTARIO_GENERAL
CREATE TABLE INVENTARIO_GENERAL (
    id INT AUTO_INCREMENT PRIMARY KEY,
    objeto VARCHAR(100) NOT NULL,
    tipo VARCHAR(100),
    color VARCHAR(50),
    cantidad_disponible INT NOT NULL DEFAULT 0,
    cantidad_total INT NOT NULL DEFAULT 0,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla SALON
CREATE TABLE SALON (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    capacidad_personas INT,
    precio_base DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- Tabla INVENTARIO_SALON
CREATE TABLE INVENTARIO_SALON (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salon_id INT NOT NULL,
    inventario_general_id INT NOT NULL,  
    cantidad_disponible INT NOT NULL,

    FOREIGN KEY (salon_id) REFERENCES SALON(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (inventario_general_id) REFERENCES INVENTARIO_GENERAL(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Evita duplicados de items por salón
    UNIQUE KEY uk_salon_item (salon_id, inventario_general_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Tabla RESERVACION
CREATE TABLE RESERVACION (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    empleado_id INT NOT NULL,
    tipo_reserva ENUM('privado', 'salon') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_entrega_real DATE,
    estado ENUM('pendiente', 'confirmado', 'cancelado', 'entregado', 'finalizado') NOT NULL DEFAULT 'pendiente',
    telefono_contacto VARCHAR(20),
    direccion_evento TEXT NOT NULL,
    notas TEXT,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Llaves foráneas a la tabla USUARIO

    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (empleado_id) REFERENCES USUARIO(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Tabla PAGO
CREATE TABLE PAGO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservacion_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('tarjeta', 'efectivo', 'transferencia') NOT NULL,
    estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') NOT NULL DEFAULT 'pendiente',
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    referencia VARCHAR(255),
    notas TEXT,

    FOREIGN KEY (reservacion_id) REFERENCES RESERVACION(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla DETALLE_RESERVA_ITEM
CREATE TABLE DETALLE_RESERVA_ITEM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservacion_id INT NOT NULL,
    inventario_general_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    es_extra BOOLEAN DEFAULT FALSE,
    dias_alquiler INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,

    FOREIGN KEY (reservacion_id) REFERENCES RESERVACION(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (inventario_general_id) REFERENCES INVENTARIO_GENERAL(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla DETALLE_RESERVA_SALON
CREATE TABLE DETALLE_RESERVA_SALON (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservacion_id INT NOT NULL,
    salon_id INT NOT NULL,
    precio_salon DECIMAL(10, 2) NOT NULL,
    dias_alquiler INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,

    FOREIGN KEY (reservacion_id) REFERENCES RESERVACION(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (salon_id) REFERENCES SALON(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;