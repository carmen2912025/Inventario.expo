-- inventario.sql completo y corregido para poblar con inventario.txt
-- Motor: InnoDB, soporta claves foráneas
--
CREATE DATABASE IF NOT EXISTS inventario;
USE inventario;

-- 1. Seguridad y control (RBAC)
CREATE TABLE IF NOT EXISTS Roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS RolPermisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permiso_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES Permisos(id) ON DELETE CASCADE,
  UNIQUE(role_id, permiso_id)
) ENGINE=InnoDB;

-- 2. Tablas de referencia
CREATE TABLE IF NOT EXISTS Categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Marcas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ubicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  direccion VARCHAR(100)
) ENGINE=InnoDB;

-- 3. Tablas principales
CREATE TABLE IF NOT EXISTS Proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(100),
  telefono VARCHAR(20),
  correo VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(30) NOT NULL UNIQUE,
  barcode VARCHAR(30) UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  categoria_id INT NOT NULL,
  marca_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  fecha_ultima_actualizacion_precio DATETIME,
  cantidad INT DEFAULT 0,
  fecha_ultima_repo DATE,
  imagen VARCHAR(255),
  FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE RESTRICT,
  FOREIGN KEY (marca_id) REFERENCES Marcas(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100),
  telefono VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ci VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  correo VARCHAR(100) UNIQUE,
  rol_id INT NOT NULL,
  FOREIGN KEY (rol_id) REFERENCES Roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ApiTokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  usuario_id INT NOT NULL,
  expiracion DATETIME,
  revoked TINYINT(1) DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tablas intermedias y movimientos
CREATE TABLE IF NOT EXISTS ProveedorProducto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT NOT NULL,
  producto_id INT NOT NULL,
  fecha DATE,
  cantidad INT,
  precio_compra DECIMAL(10,2),
  FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha DATETIME NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_by INT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES Clientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES Usuarios(id) ON DELETE RESTRICT
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

CREATE TABLE IF NOT EXISTS Stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  ubicacion_id INT NOT NULL,
  cantidad INT NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
  FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE CASCADE,
  UNIQUE(producto_id, ubicacion_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS StockMovimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  fecha DATETIME NOT NULL,
  tipo ENUM('COMPRA','VENTA','AJUSTE','TRASPASO') NOT NULL,
  cantidad INT NOT NULL,
  referencia_id INT,
  usuario_id INT,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Historial de precios
CREATE TABLE IF NOT EXISTS ProductosPrecioHistorial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  fecha_ultima_actualizacion_precio DATETIME NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Auditoría global
CREATE TABLE IF NOT EXISTS AuditLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  action VARCHAR(20) NOT NULL,
  changed_by INT,
  changes TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES Usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Triggers de ejemplo (puedes agregar más según tu lógica)
DELIMITER //
CREATE TRIGGER after_insert_producto
AFTER INSERT ON Productos
FOR EACH ROW
BEGIN
  IF NEW.fecha_ultima_actualizacion_precio IS NOT NULL THEN
    INSERT INTO ProductosPrecioHistorial (producto_id, precio, fecha_ultima_actualizacion_precio)
    VALUES (NEW.id, NEW.precio, NEW.fecha_ultima_actualizacion_precio);
  END IF;
END;//
DELIMITER ;

-- Fin del archivo
