use gitat_db;
-- Agregar campo de contraseña para usuarios
ALTER TABLE USUARIO
ADD COLUMN contrasena VARCHAR(100) NOT NULL;

-- Agregar un valor por defecto para el campo rol
-- por defecto los usuarios que son creados, se crean como clientes a menos que se especifique
ALTER TABLE USUARIO
MODIFY COLUMN rol ENUM('cliente', 'empleado', 'admin') NOT NULL DEFAULT 'cliente';

-- Cambiamos el tipo de dato text por varchar(255) aunque con 80 es suficiente
ALTER TABLE SALON
MODIFY COLUMN direccion VARCHAR(255) NOT NULL;

ALTER TABLE RESERVACION
MODIFY COLUMN direccion_evento VARCHAR(255) NOT NULL;

DESCRIBE USUARIO;

ALTER TABLE USUARIO
MODIFY COLUMN telefono VARCHAR(20) NULL DEFAULT '';

-- Trigger para encriptar las contraseñas al crear usuario
DELIMITER //
CREATE TRIGGER before_insert_password
BEFORE INSERT ON USUARIO
FOR EACH ROW
BEGIN
    SET NEW.contrasena = SHA2(NEW.contrasena, 256);
END;
//
DELIMITER ;