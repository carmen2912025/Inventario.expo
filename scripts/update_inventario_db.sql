-- Script para actualizar la base de datos 'inventario' a la estructura óptima sugerida para la app Expo React Native
-- Ejecutar en phpMyAdmin o consola MySQL

-- Ejemplo de estructura óptima (ajustar según análisis real):

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS ubicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  direccion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255),
  telefono VARCHAR(50),
  correo VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  UNIQUE KEY unique_proveedor_correo (correo),
  UNIQUE KEY unique_proveedor_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100),
  telefono VARCHAR(50),
  UNIQUE KEY unique_cliente_correo (correo),
  UNIQUE KEY unique_cliente_nombre (nombre)
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  barcode VARCHAR(50) UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  categoria_id INT,
  precio DECIMAL(10,2) NOT NULL,
  fecha_ultima_actualizacion_precio DATE,
  cantidad INT DEFAULT 0,
  fecha_ultima_repo DATE,
  imagen VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

ALTER TABLE productos
  ADD CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;

ALTER TABLE productos
  ADD CONSTRAINT fk_producto_barcode UNIQUE (barcode);

ALTER TABLE productos
  ADD CONSTRAINT fk_producto_sku UNIQUE (sku);

-- Agregar/ajustar tablas adicionales según necesidades del proyecto
