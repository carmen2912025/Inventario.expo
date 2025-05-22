-- inventario.sql definitivo para Expo React Native (sin autenticación)
-- Motor: InnoDB, soporta claves foráneas y triggers
-- Tablas: productos, proveedores, stock, ventas, estadísticas, movimientos

CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;

-- 1. Tablas de referencia
CREATE TABLE IF NOT EXISTS Categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ubicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  direccion VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tablas principales
CREATE TABLE IF NOT EXISTS Proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255),
  telefono VARCHAR(20),
  correo VARCHAR(100),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria_id INT,
  precio DECIMAL(10,2) NOT NULL,
  fecha_ultima_actualizacion_precio DATE,
  cantidad INT NOT NULL DEFAULT 0,
  fecha_ultima_repo DATE,
  imagen TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Clientes y ventas
CREATE TABLE IF NOT EXISTS Clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100),
  telefono VARCHAR(20),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2),
  FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DetalleVenta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES Ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Stock y movimientos
CREATE TABLE IF NOT EXISTS Stock (
  producto_id INT NOT NULL,
  ubicacion_id INT NOT NULL,
  cantidad INT NOT NULL,
  PRIMARY KEY (producto_id, ubicacion_id),
  FOREIGN KEY (producto_id) REFERENCES Productos(id),
  FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS StockMovimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('COMPRA','VENTA','AJUSTE') NOT NULL,
  cantidad INT NOT NULL,
  referencia_id INT,
  FOREIGN KEY (producto_id) REFERENCES Productos(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ProveedorProducto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT NOT NULL,
  producto_id INT NOT NULL,
  fecha DATE NOT NULL,
  cantidad INT NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Estadísticas y reportes
CREATE TABLE IF NOT EXISTS ResumenVentasDiarias (
  dia DATE PRIMARY KEY,
  total_ventas INT,
  monto_total DECIMAL(12,2)
) ENGINE=InnoDB;

-- 6. Triggers para automatización de stock
DELIMITER //
CREATE TRIGGER trg_after_proveedor_producto_insert
AFTER INSERT ON ProveedorProducto
FOR EACH ROW
BEGIN
    INSERT INTO StockMovimientos(producto_id, tipo, cantidad, referencia_id)
    VALUES (NEW.producto_id, 'COMPRA', NEW.cantidad, NEW.id);

    INSERT INTO Stock(producto_id, ubicacion_id, cantidad)
    VALUES (NEW.producto_id, 1, NEW.cantidad)
    ON DUPLICATE KEY UPDATE cantidad = cantidad + NEW.cantidad;
END;//

CREATE TRIGGER trg_after_detalle_venta_insert
AFTER INSERT ON DetalleVenta
FOR EACH ROW
BEGIN
    INSERT INTO StockMovimientos(producto_id, tipo, cantidad, referencia_id)
    VALUES (NEW.producto_id, 'VENTA', NEW.cantidad, NEW.id);

    UPDATE Stock
    SET cantidad = cantidad - NEW.cantidad
    WHERE producto_id = NEW.producto_id AND ubicacion_id = 1;
END;//
DELIMITER ;

-- 7. Evento para refrescar resumen de ventas
SET GLOBAL event_scheduler = ON;
CREATE EVENT IF NOT EXISTS evt_refrescar_resumen_ventas
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
  REPLACE INTO ResumenVentasDiarias (dia, total_ventas, monto_total)
  SELECT DATE(fecha), COUNT(*), SUM(total)
  FROM Ventas
  GROUP BY DATE(fecha);

-- 8. Datos de prueba mínimos
INSERT INTO Categorias(nombre) VALUES ('Electrónica');
INSERT INTO Ubicaciones(nombre) VALUES ('Almacén Principal');
INSERT INTO Proveedores(nombre, direccion) VALUES ('Tech Distribuidora', 'Calle Falsa 123');
INSERT INTO Productos(sku, nombre, categoria_id, precio)
VALUES ('PROD001', 'Televisor 4K', 1, 899.99);
INSERT INTO Clientes(nombre) VALUES ('Cliente Prueba');
INSERT INTO ProveedorProducto(proveedor_id, producto_id, fecha, cantidad, precio_compra)
VALUES (1, 1, CURDATE(), 10, 700.00);
INSERT INTO Ventas(cliente_id, total)
VALUES (1, 999.99);
INSERT INTO DetalleVenta(venta_id, producto_id, cantidad, precio_unitario)
VALUES (1, 1, 1, 999.99);

-- Datos de prueba adicionales
-- Categorías
INSERT INTO Categorias(nombre, descripcion) VALUES ('Hogar', 'Artículos para el hogar');
INSERT INTO Categorias(nombre, descripcion) VALUES ('Deportes', 'Equipos deportivos');
INSERT INTO Categorias(nombre, descripcion) VALUES ('Oficina', 'Suministros de oficina');

-- Ubicaciones
INSERT INTO Ubicaciones(nombre, direccion) VALUES ('Sucursal Centro', 'Av. Central 456');
INSERT INTO Ubicaciones(nombre, direccion) VALUES ('Depósito Secundario', 'Calle 2 #45');

-- Proveedores
INSERT INTO Proveedores(nombre, direccion, telefono, correo) VALUES ('Distribuidora Hogar', 'Calle 10 #20', '555-1234', 'hogar@proveedor.com');
INSERT INTO Proveedores(nombre, direccion, telefono, correo) VALUES ('DeportesMax', 'Av. Deportes 100', '555-5678', 'ventas@deportesmax.com');

-- Productos
INSERT INTO Productos(sku, nombre, categoria_id, precio) VALUES ('PROD002', 'Licuadora', 2, 49.99);
INSERT INTO Productos(sku, nombre, categoria_id, precio) VALUES ('PROD003', 'Balón de fútbol', 3, 19.99);
INSERT INTO Productos(sku, nombre, categoria_id, precio) VALUES ('PROD004', 'Silla ergonómica', 4, 129.99);

-- Clientes
INSERT INTO Clientes(nombre, correo, telefono) VALUES ('Ana Pérez', 'ana@mail.com', '555-0001');
INSERT INTO Clientes(nombre, correo, telefono) VALUES ('Carlos Ruiz', 'carlos@mail.com', '555-0002');

-- Compras a proveedores
INSERT INTO ProveedorProducto(proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES (2, 2, CURDATE(), 20, 35.00);
INSERT INTO ProveedorProducto(proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES (3, 3, CURDATE(), 50, 12.00);
INSERT INTO ProveedorProducto(proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES (1, 4, CURDATE(), 5, 100.00);

-- Ventas
INSERT INTO Ventas(cliente_id, total) VALUES (2, 59.98);
INSERT INTO Ventas(cliente_id, total) VALUES (3, 149.99);

-- Detalle de ventas
INSERT INTO DetalleVenta(venta_id, producto_id, cantidad, precio_unitario) VALUES (2, 2, 1, 49.99);
INSERT INTO DetalleVenta(venta_id, producto_id, cantidad, precio_unitario) VALUES (2, 3, 1, 19.99);
INSERT INTO DetalleVenta(venta_id, producto_id, cantidad, precio_unitario) VALUES (3, 4, 1, 129.99);

-- Proveedores de piezas de motos
DELETE FROM Proveedores;
INSERT INTO Proveedores(nombre, direccion, telefono, correo) VALUES
('MotoRepuestos S.A.', 'Av. Motociclistas 101', '700-1111', 'ventas@motorepuestos.com'),
('Repuestos Rápidos', 'Calle Motor 202', '700-2222', 'info@repuestosrapidos.com'),
('Mundo Moto', 'Boulevard Biker 303', '700-3333', 'contacto@mundomoto.com');

-- Productos de piezas de motos
DELETE FROM Productos;
INSERT INTO Productos(sku, nombre, categoria_id, precio) VALUES
('MOTO001', 'Bujía NGK', 1, 5.50),
('MOTO002', 'Filtro de aceite', 1, 8.99),
('MOTO003', 'Pastillas de freno', 1, 15.00),
('MOTO004', 'Cadena DID', 1, 35.00),
('MOTO005', 'Kit de transmisión', 1, 60.00),
('MOTO006', 'Aceite sintético 10W40', 1, 12.00),
('MOTO007', 'Llanta delantera 90/90-18', 1, 45.00),
('MOTO008', 'Llanta trasera 120/80-18', 1, 55.00),
('MOTO009', 'Amortiguador trasero', 1, 38.00),
('MOTO010', 'Espejo retrovisor', 1, 7.50);
