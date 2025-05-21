use inventario;
-- -----------------------------------------------------------
-- 0. ELIMINAR TABLAS EN ORDEN DE DEPENDENCIAS
-- -----------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS ResumenVentasDiarias;
DROP TABLE IF EXISTS StockMovimientos;
DROP TABLE IF EXISTS Stock;
DROP TABLE IF EXISTS DetalleVenta;
DROP TABLE IF EXISTS Ventas;
DROP TABLE IF EXISTS ProveedorProducto;
DROP TABLE IF EXISTS ApiTokens;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Clientes;
DROP TABLE IF EXISTS Productos;
DROP TABLE IF EXISTS Proveedores;
DROP TABLE IF EXISTS Ubicaciones;
DROP TABLE IF EXISTS Marcas;
DROP TABLE IF EXISTS Categorias;
DROP TABLE IF EXISTS RolPermisos;
DROP TABLE IF EXISTS Permisos;
DROP TABLE IF EXISTS Roles;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------
-- 1. CREACIÓN DE LA BASE DE DATOS
-- -----------------------------------------------------------
CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;

-- -----------------------------------------------------------
-- 2. TABLAS DE DOMINIO Y RBAC
-- -----------------------------------------------------------
CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE RolPermisos (
    role_id INT NOT NULL,
    permiso_id INT NOT NULL,
    PRIMARY KEY (role_id, permiso_id),
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES Permisos(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------
-- 3. TABLAS PRINCIPALES
-- -----------------------------------------------------------
CREATE TABLE Categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE Marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE Ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE Proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
    marca_id INT,
    precio DECIMAL(10,2) NOT NULL,
    fecha_ultima_actualizacion_precio DATE,
    cantidad INT NOT NULL DEFAULT 0,
    fecha_ultima_repo DATE,
    imagen TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id),
    FOREIGN KEY (marca_id) REFERENCES Marcas(id),
    INDEX (categoria_id),
    INDEX (marca_id)
);

CREATE TABLE Clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ci VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(100) NOT NULL UNIQUE,
    rol_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (rol_id) REFERENCES Roles(id)
);

CREATE TABLE ApiTokens (
    token VARCHAR(128) PRIMARY KEY,
    usuario_id INT NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiracion DATETIME NOT NULL,
    revoked TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    INDEX (usuario_id)
);

-- -----------------------------------------------------------
-- 4. MOVIMIENTOS Y STOCK (VERSIÓN CORREGIDA)
-- -----------------------------------------------------------
CREATE TABLE ProveedorProducto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    producto_id INT NOT NULL,
    fecha DATE NOT NULL,
    cantidad INT NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
    INDEX (proveedor_id),
    INDEX (producto_id),
    INDEX idx_prod_fecha (producto_id, fecha)
);

CREATE TABLE Ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    created_by INT,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Usuarios(id),
    INDEX (cliente_id)
);

CREATE TABLE DetalleVenta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES Ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
    INDEX (venta_id),
    INDEX (producto_id)
);

CREATE TABLE Stock (
    producto_id INT NOT NULL,
    ubicacion_id INT NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (producto_id, ubicacion_id),
    FOREIGN KEY (producto_id) REFERENCES Productos(id),
    FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id)
);

CREATE TABLE StockMovimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('COMPRA','VENTA','AJUSTE') NOT NULL,
    cantidad INT NOT NULL,
    referencia_id INT,
    usuario_id INT,
    FOREIGN KEY (producto_id) REFERENCES Productos(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    INDEX (producto_id),
    INDEX (tipo)
);

-- -----------------------------------------------------------
-- 5. TRIGGERS ACTUALIZADOS
-- -----------------------------------------------------------
DELIMITER //

-- Trigger modificado para ubicación específica
CREATE TRIGGER trg_after_proveedor_producto_insert
AFTER INSERT ON ProveedorProducto
FOR EACH ROW
BEGIN
    -- Registrar movimiento de compra
    INSERT INTO StockMovimientos(producto_id, tipo, cantidad, referencia_id)
    VALUES (NEW.producto_id, 'COMPRA', NEW.cantidad, NEW.id);

    -- Actualizar stock en ubicación principal (1)
    INSERT INTO Stock(producto_id, ubicacion_id, cantidad)
    VALUES (NEW.producto_id, 1, NEW.cantidad)
    ON DUPLICATE KEY UPDATE cantidad = cantidad + NEW.cantidad;
END;
//

-- Trigger para ventas (sin cambios)
CREATE TRIGGER trg_after_detalle_venta_insert
AFTER INSERT ON DetalleVenta
FOR EACH ROW
BEGIN
    INSERT INTO StockMovimientos(producto_id, tipo, cantidad, referencia_id)
    VALUES (NEW.producto_id, 'VENTA', NEW.cantidad, NEW.id);

    UPDATE Stock
    SET cantidad = cantidad - NEW.cantidad
    WHERE producto_id = NEW.producto_id AND ubicacion_id = 1;
END;
//
DELIMITER ;

-- -----------------------------------------------------------
-- 6. VISTA MATERIALIZADA / EVENTO (SIN CAMBIOS)
-- -----------------------------------------------------------
CREATE TABLE ResumenVentasDiarias (
    dia DATE PRIMARY KEY,
    total_ventas INT,
    monto_total DECIMAL(12,2)
);

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS evt_refrescar_resumen_ventas
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
  REPLACE INTO ResumenVentasDiarias (dia, total_ventas, monto_total)
  SELECT DATE(fecha), COUNT(*), SUM(total)
  FROM Ventas
  GROUP BY DATE(fecha);

-- -----------------------------------------------------------
-- 7. AUDITORÍA (SIN CAMBIOS)
-- -----------------------------------------------------------
CREATE TABLE AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    changed_by INT,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changes JSON,
    FOREIGN KEY (changed_by) REFERENCES Usuarios(id)
);

-- -----------------------------------------------------------
-- 8. DATOS DE PRUEBA OPTIMIZADOS (VERSIÓN FINAL)
-- -----------------------------------------------------------
START TRANSACTION;

-- Roles y permisos
INSERT INTO Roles(nombre) VALUES 
('Admin'), ('Vendedor'), ('Inventario'), ('Gerente'), ('Soporte');

INSERT INTO Permisos(nombre) VALUES 
('gestionar_usuarios'), ('registrar_ventas'), ('ver_reportes'),
('gestionar_stock'), ('auditoria'), ('configuracion_sistema');

INSERT INTO RolPermisos(role_id, permiso_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(2, 2), (2, 3), (3, 4), (3, 3), (4, 3), (4, 5), (5, 3);

-- Usuarios
INSERT INTO Usuarios (nombre, ci, telefono, correo, rol_id) VALUES
('Ana García', '11223344', '611223344', 'ana.garcia@empresa.com', 1),
('Carlos Ruiz', '22334455', '622334455', 'carlos.ruiz@empresa.com', 2),
('María López', '33445566', '633445566', 'maria.lopez@empresa.com', 3);

-- Catálogos base
INSERT INTO Categorias (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos electrónicos y componentes'),
('Electrodomésticos', 'Aparatos para el hogar'),
('Informática', 'Equipos y accesorios de computación');

INSERT INTO Marcas (nombre) VALUES
('Samsung'), ('LG'), ('Apple'), ('Sony'), ('Philips');

INSERT INTO Ubicaciones (nombre, direccion) VALUES
('Almacén Principal', 'Calle Industria 123'),
('Almacén Secundario', 'Avenida Comercio 456'),
('Mostrador Ventas', 'Centro Comercial MegaPlaza');

INSERT INTO Proveedores (nombre, direccion, telefono, correo) VALUES
('TechWorld Distribuidora', 'Av. Tecnológica 789', '912345678', 'ventas@techworld.com'),
('ElectroSuministros SA', 'Calle Circuito 321', '915555555', 'contacto@electrosuministros.com');

-- Productos (Stock inicial se genera via ProveedorProducto)
INSERT INTO Productos (sku, nombre, categoria_id, marca_id, precio) VALUES
('TV-LED-55', 'Televisor LED 55" 4K', 1, 1, 899.99),
('LAP-APP-M1', 'MacBook Air M1', 3, 3, 1299.00),
('REF-LG-500', 'Refrigerador LG 500L', 2, 2, 1599.00);

-- Compras iniciales (generan stock en ubicación 1 via trigger)
INSERT INTO ProveedorProducto (proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES
(1, 1, CURDATE(), 20, 650.00),
(1, 3, CURDATE(), 10, 1200.00),
(2, 2, CURDATE(), 15, 1100.00);

-- Stock adicional en otras ubicaciones (inserts manuales seguros)
INSERT INTO Stock (producto_id, ubicacion_id, cantidad) VALUES
(1, 3, 5),    -- Mostrador Ventas
(3, 2, 5);    -- Almacén Secundario

-- Clientes y ventas
INSERT INTO Clientes (nombre, correo, telefono) VALUES
('Marta Rodríguez', 'marta.rodriguez@mail.com', '600112233'),
('Empresa Tech Solutions', 'compras@techsolutions.com', '900111222');

INSERT INTO Ventas (cliente_id, total, created_by) VALUES
(1, 1799.98, 2),
(2, 3198.00, 2);

INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 2, 899.99),
(2, 2, 1, 1299.00),
(2, 3, 1, 1899.00);

COMMIT;