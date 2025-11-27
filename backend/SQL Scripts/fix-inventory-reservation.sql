USE gitat_db;
-- Para 'objeto' (Mesas, Sillas, Manteles)
CREATE TABLE CATEGORIA_PRODUCTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Para 'tipo' (Redonda, Rectangular, Plegable)
CREATE TABLE TIPO_PRODUCTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Para 'color'
CREATE TABLE COLOR (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    hex_code VARCHAR(7) -- Opcional, pero genial para el frontend
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Modificamos inventario general para adaptarlo a las nuevas tablas normalizadas
ALTER TABLE INVENTARIO_GENERAL
    DROP COLUMN objeto,
    DROP COLUMN tipo,
    DROP COLUMN color;

ALTER TABLE INVENTARIO_GENERAL
    ADD COLUMN categoria_id INT NOT NULL AFTER id,
    ADD COLUMN tipo_id INT AFTER categoria_id, -- Puede ser NULL si no aplica
    ADD COLUMN color_id INT AFTER tipo_id,     -- Puede ser NULL si no aplica
    ADD COLUMN nombre_item VARCHAR(255) NOT NULL AFTER id, -- "Silla Negra"

    -- Agregamos los Foreign Keys
    ADD CONSTRAINT fk_inv_categoria FOREIGN KEY (categoria_id) REFERENCES CATEGORIA_PRODUCTO(id),
    ADD CONSTRAINT fk_inv_tipo FOREIGN KEY (tipo_id) REFERENCES TIPO_PRODUCTO(id),
    ADD CONSTRAINT fk_inv_color FOREIGN KEY (color_id) REFERENCES COLOR(id);
	
-- Tabla para reportar daños en el mobiliario rentado
CREATE TABLE DANIO_INVENTARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservacion_id INT NOT NULL,
    inventario_general_id INT NOT NULL, -- El item que se dañó
    cantidad INT NOT NULL DEFAULT 1,
    notas TEXT,
    costo_reposicion DECIMAL(10, 2) DEFAULT 0.00, -- Cuánto se le cobró
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reservacion_id) REFERENCES RESERVACION(id),
    FOREIGN KEY (inventario_general_id) REFERENCES INVENTARIO_GENERAL(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Eliminamos total y subtotal de la tabla reservación
-- Ya contamos con columnas para hacer el cálculo de la reserva en detalle item y detalle salon
ALTER TABLE RESERVACION
    DROP COLUMN subtotal,
    DROP COLUMN total;
	
-- Agregamos una columna para el precio de alquiler
ALTER TABLE INVENTARIO_GENERAL
ADD COLUMN precio_alquiler DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER color_id;

-- Ahora podemos empezar a poblar los catálogos y después las tablas de inventario para posteriormente ligar los salones con su inventario

-- --------------------------------------------------------
-- Llenar los catálogos (CATEGORIA, TIPO, COLOR)
-- --------------------------------------------------------

-- Llenar CATEGORIA_PRODUCTO
INSERT IGNORE INTO CATEGORIA_PRODUCTO (nombre) VALUES
('Mesa'),
('Silla'),
('Mantel'),
('Cubremantel');

-- Llenar TIPO_PRODUCTO
-- (Aquí 'negra' y 'cromada' eran 'subcategoria' de silla)
INSERT IGNORE INTO TIPO_PRODUCTO (nombre) VALUES
('Rectangular'),
('Redonda'),
('Negra'),         -- Tipo de Silla
('Cromada');       -- Tipo de Silla

-- Llenar COLOR
INSERT IGNORE INTO COLOR (nombre) VALUES
('Blanco'),
('Negro'),
('Verde'),
('Azul'),
('Azul Cielo'),
('Azul Marino'),
('Rojo'),
('Dorado'),
('Plata'),
('Morado');

-- -----------------------------------------------------------------
-- Llenar INVENTARIO_GENERAL (usando los IDs de catálogo)
-- Usamos subqueries (SELECT id FROM...) para encontrar los IDs
-- También mapeamos los precios de la antigua tabla 'tarifas'
-- -----------------------------------------------------------------

-- Mesas (Precio 'mesa_extra' = 50)
INSERT INTO INVENTARIO_GENERAL (nombre_item, categoria_id, tipo_id, color_id, precio_alquiler, cantidad_total, cantidad_disponible) VALUES
('Mesa Rectangular', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mesa'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), NULL, 50.00, 250, 250),
('Mesa Redonda', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mesa'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), NULL, 50.00, 200, 200);

-- Sillas (Precio 'silla_extra' = 5)
INSERT INTO INVENTARIO_GENERAL (nombre_item, categoria_id, tipo_id, color_id, precio_alquiler, cantidad_total, cantidad_disponible) VALUES
('Silla Negra', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Silla'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Negra'), NULL, 5.00, 3000, 3000),
('Silla Cromada', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Silla'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Cromada'), NULL, 5.00, 2500, 2500);

-- Manteles (Precio 'mantel_cubremantel_extra' = 25)
INSERT INTO INVENTARIO_GENERAL (nombre_item, categoria_id, tipo_id, color_id, precio_alquiler, cantidad_total, cantidad_disponible) VALUES
('Mantel Redondo Blanco', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Blanco'), 25.00, 200, 200),
('Mantel Redondo Negro', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Negro'), 25.00, 200, 200),
('Mantel Redondo Verde', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Verde'), 25.00, 200, 200),
('Mantel Redondo Azul', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Azul'), 25.00, 200, 200),
('Mantel Rectangular Blanco', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Blanco'), 25.00, 250, 250),
('Mantel Rectangular Negro', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Negro'), 25.00, 250, 250),
('Mantel Rectangular Verde', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Verde'), 25.00, 250, 250),
('Mantel Rectangular Azul', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Mantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Azul'), 25.00, 250, 250);

-- Cubremanteles (Precio 'mantel_cubremantel_extra' = 25)
INSERT INTO INVENTARIO_GENERAL (nombre_item, categoria_id, tipo_id, color_id, precio_alquiler, cantidad_total, cantidad_disponible) VALUES
('Cubremantel Redondo Azul Cielo', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Azul Cielo'), 25.00, 200, 200),
('Cubremantel Redondo Azul Marino', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Azul Marino'), 25.00, 200, 200),
('Cubremantel Redondo Rojo', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Rojo'), 25.00, 200, 200),
('Cubremantel Redondo Dorado', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Dorado'), 25.00, 200, 200),
('Cubremantel Redondo Negro', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Negro'), 25.00, 200, 200),
('Cubremantel Redondo Plata', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Plata'), 25.00, 200, 200),
('Cubremantel Redondo Morado', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Redonda'), (SELECT id FROM COLOR WHERE nombre = 'Morado'), 25.00, 200, 200),
('Cubremantel Rectangular Azul Cielo', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Azul Cielo'), 25.00, 250, 250),
('Cubremantel Rectangular Azul Marino', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Azul Marino'), 25.00, 250, 250),
('Cubremantel Rectangular Rojo', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Rojo'), 25.00, 250, 250),
('Cubremantel Rectangular Dorado', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Dorado'), 25.00, 250, 250),
('Cubremantel Rectangular Negro', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Negro'), 25.00, 250, 250),
('Cubremantel Rectangular Plata', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Plata'), 25.00, 250, 250),
('Cubremantel Rectangular Morado', (SELECT id FROM CATEGORIA_PRODUCTO WHERE nombre = 'Cubremantel'), (SELECT id FROM TIPO_PRODUCTO WHERE nombre = 'Rectangular'), (SELECT id FROM COLOR WHERE nombre = 'Morado'), 25.00, 250, 250);

-- -----------------------------------------------------------------
-- Llenar SALON
-- Usamos el precio 'salon_base' (3500) de la antigua tabla 'tarifas'
-- -----------------------------------------------------------------

INSERT INTO SALON (nombre, direccion, precio_base, capacidad_personas, activo) VALUES
('Salón A', 'Dirección salón A', 3500.00, NULL, TRUE),
('Salón B', 'Dirección salón B', 3500.00, NULL, TRUE),
('Salón C', 'Dirección salón C', 3500.00, NULL, TRUE);

-- -----------------------------------------------------------------
-- Llenar INVENTARIO_SALON
-- Ahora vinculamos el SALON.id con el INVENTARIO_GENERAL.id
-- -----------------------------------------------------------------

-- Inventario Salón A (salon_id = 1)
INSERT IGNORE INTO INVENTARIO_SALON (salon_id, inventario_general_id, cantidad_disponible) VALUES
(1, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mesa Rectangular'), 10),
(1, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mesa Redonda'), 10),
(1, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Silla Negra'), 100),
(1, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Silla Cromada'), 100),
(1, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mantel Redondo Blanco'), 10),
(1, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mantel Rectangular Blanco'), 10);

DESCRIBE INVENTARIO_SALON;
-- Inventario Salón B (salon_id = 2)
INSERT IGNORE INTO INVENTARIO_SALON (salon_id, inventario_general_id, cantidad_disponible) VALUES
(2, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mesa Rectangular'), 10),
(2, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mesa Redonda'), 10),
(2, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Silla Negra'), 100),
(2, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Silla Cromada'), 100),
(2, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mantel Redondo Blanco'), 10),
(2, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mantel Rectangular Blanco'), 10);

-- Inventario Salón C (salon_id = 3)
INSERT IGNORE INTO INVENTARIO_SALON (salon_id, inventario_general_id, cantidad_disponible) VALUES
(3, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mesa Rectangular'), 10),
(3, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mesa Redonda'), 10),
(3, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Silla Negra'), 100),
(3, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Silla Cromada'), 100),
(3, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mantel Redondo Blanco'), 10),
(3, (SELECT id FROM INVENTARIO_GENERAL WHERE nombre_item = 'Mantel Rectangular Blanco'), 10);

SELECT * FROM INVENTARIO_SALON;
SELECT * FROM INVENTARIO_GENERAL;
SELECT * FROM CATEGORIA_PRODUCTO; -- ID N' NOMBRE: CUBREMANTEL, MANTEL, MESA, SILLA
SELECT * FROM COLOR; -- ID, NOMBRE N' HEX_CODE: BLANCO, NEGRO, VERDE, AZUL, ETC.
SELECT * FROM TIPO_PRODUCTO; -- ID N' NOMBRE: CROMADA, NEGRA, RECTANGULAR, REDONDA