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
-- 4. MOVIMIENTOS Y STOCK
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
-- 5. TRIGGERS
-- -----------------------------------------------------------
DELIMITER //

CREATE TRIGGER trg_after_proveedor_producto_insert
AFTER INSERT ON ProveedorProducto
FOR EACH ROW
BEGIN
    INSERT INTO StockMovimientos(producto_id, tipo, cantidad, referencia_id, usuario_id)
    VALUES (NEW.producto_id, 'COMPRA', NEW.cantidad, NEW.id, NULL);

    INSERT INTO Stock(producto_id, ubicacion_id, cantidad)
    VALUES (NEW.producto_id, 1, NEW.cantidad)
    ON DUPLICATE KEY UPDATE cantidad = cantidad + NEW.cantidad;
END;
//

CREATE TRIGGER trg_after_detalle_venta_insert
AFTER INSERT ON DetalleVenta
FOR EACH ROW
BEGIN
    INSERT INTO StockMovimientos(producto_id, tipo, cantidad, referencia_id, usuario_id)
    VALUES (NEW.producto_id, 'VENTA', NEW.cantidad, NEW.id, NULL);

    UPDATE Stock
    SET cantidad = cantidad - NEW.cantidad
    WHERE producto_id = NEW.producto_id AND ubicacion_id = 1;
END;
//

DELIMITER ;

-- -----------------------------------------------------------
-- 6. VISTA MATERIALIZADA / EVENTO
-- -----------------------------------------------------------
CREATE TABLE ResumenVentasDiarias (
    dia DATE PRIMARY KEY,
    total_ventas INT,
    monto_total DECIMAL(12,2)
);

-- Activar el Event Scheduler (temporal)
SET GLOBAL event_scheduler = ON;

-- Conceder permisos EVENT si es necesario
-- GRANT EVENT ON inventario.* TO 'tu_usuario'@'localhost';
-- FLUSH PRIVILEGES;

CREATE EVENT IF NOT EXISTS evt_refrescar_resumen_ventas
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP + INTERVAL 1 DAY
DO
  REPLACE INTO ResumenVentasDiarias (dia, total_ventas, monto_total)
  SELECT DATE(fecha), COUNT(*), SUM(total)
  FROM Ventas
  GROUP BY DATE(fecha);

-- -----------------------------------------------------------
-- 7. AUDITORÍA
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
-- 8. SCRIPT DE PRUEBA (POBLAR DATOS BÁSICOS)
-- -----------------------------------------------------------

INSERT INTO Roles(nombre) VALUES ('Admin'), ('Vendedor');
INSERT INTO Permisos(nombre) VALUES ('gestionar_usuarios'), ('registrar_ventas'), ('ver_reportes');

INSERT INTO RolPermisos(role_id, permiso_id)
SELECT r.id, p.id
FROM Roles r, Permisos p;

INSERT INTO Usuarios(nombre, ci, telefono, correo, rol_id)
VALUES ('Juan Pérez', '12345678', '789123456', 'juan@example.com', 1);

INSERT INTO Categorias(nombre) VALUES ('Electrónica');
INSERT INTO Marcas(nombre) VALUES ('Samsung');
INSERT INTO Ubicaciones(nombre) VALUES ('Almacén Principal');
INSERT INTO Proveedores(nombre, direccion) VALUES ('Tech Distribuidora', 'Calle Falsa 123');

INSERT INTO Productos(sku, nombre, categoria_id, marca_id, precio)
VALUES ('PROD001', 'Televisor 4K', 1, 1, 899.99);

INSERT INTO Clientes(nombre) VALUES ('Cliente Prueba');

INSERT INTO ProveedorProducto(proveedor_id, producto_id, fecha, cantidad, precio_compra)
VALUES (1, 1, CURDATE(), 10, 700.00);

INSERT INTO Ventas(cliente_id, total, created_by)
VALUES (1, 999.99, 1);

INSERT INTO DetalleVenta(venta_id, producto_id, cantidad, precio_unitario)
VALUES (1, 1, 1, 999.99);
