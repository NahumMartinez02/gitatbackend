-- 1. Desactivamos temporalmente la revisión de llaves foráneas
-- Esto permite vaciar la tabla padre (RESERVACION) sin que MySQL se queje
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Vaciamos las tablas (TRUNCATE borra los datos Y resetea el ID a 1 automáticamente)
-- OJO: Es muy probable que también quieras limpiar estas tablas hermanas
-- para no dejar "basura" o datos huérfanos apuntando a reservas que ya no existen:
TRUNCATE TABLE DETALLE_RESERVA_ITEM;
TRUNCATE TABLE RESERVACION;
TRUNCATE TABLE DETALLE_RESERVA_SALON;
TRUNCATE TABLE PAGO;
-- TRUNCATE TABLE DANIO_INVENTARIO; -- Si ya creaste esta tabla
-- 3. Volvemos a activar la seguridad de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

SELECT * FROM `RESERVACION`;
SELECT * FROM `DETALLE_RESERVA_ITEM`;
SELECT * FROM `DETALLE_RESERVA_SALON`;
SELECT * FROM `PAGO`;