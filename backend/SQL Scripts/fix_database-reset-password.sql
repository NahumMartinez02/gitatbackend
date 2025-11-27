use gitat_db;
describe USUARIO;
-- Agregamos un los coampos reset_token y reset_token_expiry para el reseteo de contraseña
ALTER TABLE USUARIO 
ADD COLUMN reset_token VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN reset_token_exp BIGINT NOT NULL DEFAULT 0;
-- Agregamos un constraint al campo teléfono
ALTER TABLE USUARIO
MODIFY COLUMN telefono VARCHAR(20) NULL DEFAULT '';

-- Agregamos un campo photo_url para localizar la foto almacenada en un sistema de archivos
ALTER TABLE USUARIO
ADD COLUMN photo_url VARCHAR(255) NOT NULL DEFAULT '';