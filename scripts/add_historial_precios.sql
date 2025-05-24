-- Tabla para historial de precios de productos
CREATE TABLE IF NOT EXISTS HistorialPrecios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Trigger para registrar cambios de precio
DELIMITER //
CREATE TRIGGER trg_after_update_precio
AFTER UPDATE ON Productos
FOR EACH ROW
BEGIN
  IF NEW.precio <> OLD.precio THEN
    INSERT INTO HistorialPrecios(producto_id, precio, fecha)
    VALUES (NEW.id, NEW.precio, NOW());
  END IF;
END;//
DELIMITER ;
