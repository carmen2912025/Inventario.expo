-- Script para poblar la base de datos inventario con datos de prueba adicionales

-- 1. Roles y Permisos (si no existen)
INSERT IGNORE INTO Roles (id, nombre) VALUES
  (1, 'Administrador'),
  (2, 'Vendedor'),
  (3, 'Comprador'),
  (4, 'Almacenista'),
  (5, 'Auditor');

INSERT IGNORE INTO Permisos (id, nombre) VALUES
  (1, 'Crear Producto'),
  (2, 'Editar Producto'),
  (3, 'Eliminar Producto'),
  (4, 'Ver Ventas'),
  (5, 'Administrar Usuarios');

INSERT IGNORE INTO RolPermisos (id, role_id, permiso_id) VALUES
  (1, 1, 1), (2, 1, 2), (3, 2, 4), (4, 3, 4), (5, 4, 2);

-- 2. Categorías, Ubicaciones
INSERT IGNORE INTO Categorias (id, nombre, descripcion) VALUES
  (1, 'Frenos', 'Piezas relacionadas con el sistema de frenado'),
  (2, 'Suspensión', 'Elementos para la suspensión de la moto'),
  (3, 'Motor', 'Componentes del motor'),
  (4, 'Transmisión', 'Piezas de la transmisión y cadena'),
  (5, 'Accesorios', 'Complementos y accesorios varios');

INSERT IGNORE INTO Ubicaciones (id, nombre, direccion) VALUES
  (1, 'Almacén Central', 'Calle Principal 100'),
  (2, 'Sucursal Norte', 'Av. Norte 200'),
  (3, 'Sucursal Sur', 'Av. Sur 300'),
  (4, 'Almacén Temporario', 'Calle Temporal 50'),
  (5, 'Depósito de Respaldo', 'Calle Respaldo 10');

-- 3. Proveedores
INSERT IGNORE INTO Proveedores (id, nombre, direccion, telefono, correo) VALUES
  (1, 'Proveedor A', 'Calle 10', '1234567890', 'proveedora@example.com'),
  (2, 'Proveedor B', 'Av. Central 123', '2345678901', 'proveedorb@example.com'),
  (3, 'Proveedor C', 'Calle 20', '3456789012', 'proveedorc@example.com'),
  (4, 'Proveedor D', 'Av. Industrial 50', '4567890123', 'proveedord@example.com'),
  (5, 'Proveedor E', 'Calle Comercio 5', '5678901234', 'proveedore@example.com');

-- 4. Productos
INSERT IGNORE INTO Productos (id, sku, barcode, nombre, descripcion, categoria_id, precio, fecha_ultima_actualizacion_precio, cantidad, fecha_ultima_repo, imagen) VALUES
  (1, 'SKU001','BAR001','Pastilla de freno','Pastillas de freno de alta calidad',1,50.00,'2025-05-01',100,'2025-05-02','http://example.com/img001.jpg'),
  (2, 'SKU002','BAR002','Amortiguador','Amortiguador robusto para suspensión',2,120.00,'2025-05-02',50,'2025-05-03','http://example.com/img002.jpg'),
  (3, 'SKU003','BAR003','Filtro de aire','Filtro de aire para motores',3,30.00,'2025-05-03',70,'2025-05-04','http://example.com/img003.jpg'),
  (4, 'SKU004','BAR004','Cadena','Cadena de transmisión resistente',4,80.00,'2025-05-04',40,'2025-05-05','http://example.com/img004.jpg'),
  (5, 'SKU005','BAR005','Casco','Casco de protección integral',5,200.00,'2025-05-05',25,'2025-05-06','http://example.com/img005.jpg');

-- 5. Clientes
INSERT IGNORE INTO Clientes (id, nombre, correo, telefono) VALUES
  (1, 'Juan Pérez', 'juan@example.com', '1111111111'),
  (2, 'María García', 'maria@example.com', '2222222222'),
  (3, 'Pedro Martínez', 'pedro@example.com', '3333333333'),
  (4, 'Lucía López', 'lucia@example.com', '4444444444'),
  (5, 'Carlos Sánchez', 'carlos@example.com', '5555555555');

-- 6. Usuarios
INSERT IGNORE INTO Usuarios (id, nombre, ci, telefono, correo, rol_id) VALUES
  (1, 'Admin User', 'CI001', '1010101010', 'admin@example.com', 1),
  (2, 'Vendedor Uno', 'CI002', '2020202020', 'vendedor1@example.com', 2),
  (3, 'Comprador Uno', 'CI003', '3030303030', 'comprador1@example.com', 3),
  (4, 'Almacenista Uno', 'CI004', '4040404040', 'almacenista@example.com', 4),
  (5, 'Auditor Uno', 'CI005', '5050505050', 'auditor@example.com', 5);

-- 7. ApiTokens
INSERT IGNORE INTO ApiTokens (id, token, usuario_id, expiracion, revoked) VALUES
  (1, 'TOKEN1', 1, '2025-12-31 23:59:59', 0),
  (2, 'TOKEN2', 2, '2025-12-31 23:59:59', 0),
  (3, 'TOKEN3', 3, '2025-12-31 23:59:59', 0),
  (4, 'TOKEN4', 4, '2025-12-31 23:59:59', 0),
  (5, 'TOKEN5', 5, '2025-12-31 23:59:59', 0);

-- 8. ProveedorProducto
INSERT IGNORE INTO ProveedorProducto (id, proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES
  (1, 1, 1, '2025-05-01', 50, 45.00),
  (2, 2, 2, '2025-05-02', 30, 110.00),
  (3, 3, 3, '2025-05-03', 40, 28.00),
  (4, 4, 4, '2025-05-04', 20, 75.00),
  (5, 5, 5, '2025-05-05', 15, 190.00);

-- 9. Ventas
INSERT IGNORE INTO Ventas (id, cliente_id, fecha, total, created_by) VALUES
  (1, 1, '2025-05-10 10:00:00', 150.00, 2),
  (2, 2, '2025-05-11 11:00:00', 200.00, 2),
  (3, 3, '2025-05-12 12:00:00', 120.00, 2),
  (4, 4, '2025-05-13 13:00:00', 300.00, 2),
  (5, 5, '2025-05-14 14:00:00', 250.00, 2);

-- 10. DetalleVenta
INSERT IGNORE INTO DetalleVenta (id, venta_id, producto_id, cantidad, precio_unitario) VALUES
  (1, 1, 1, 2, 50.00),
  (2, 2, 2, 1, 120.00),
  (3, 3, 3, 3, 30.00),
  (4, 4, 4, 1, 80.00),
  (5, 5, 5, 1, 200.00);

-- 11. Stock
INSERT IGNORE INTO Stock (id, producto_id, ubicacion_id, cantidad) VALUES
  (1, 1, 1, 100),
  (2, 2, 1, 50),
  (3, 3, 1, 70),
  (4, 4, 1, 40),
  (5, 5, 1, 25);

-- 12. StockMovimientos
INSERT IGNORE INTO StockMovimientos (id, producto_id, fecha, tipo, cantidad, referencia_id, usuario_id) VALUES
  (1, 1, '2025-05-01 09:00:00', 'COMPRA', 50, 1, 1),
  (2, 2, '2025-05-02 09:30:00', 'COMPRA', 30, 2, 1),
  (3, 3, '2025-05-03 10:00:00', 'COMPRA', 40, 3, 1),
  (4, 4, '2025-05-04 10:30:00', 'COMPRA', 20, 4, 1),
  (5, 5, '2025-05-05 11:00:00', 'COMPRA', 15, 5, 1);

-- 13. ProductosPrecioHistorial
INSERT IGNORE INTO ProductosPrecioHistorial (id, producto_id, precio, fecha_ultima_actualizacion_precio) VALUES
  (1, 1, 50.00, '2025-05-01 08:00:00'),
  (2, 1, 52.00, '2025-05-02 08:00:00'),
  (3, 2, 120.00, '2025-05-02 09:00:00'),
  (4, 3, 30.00, '2025-05-03 09:00:00'),
  (5, 4, 80.00, '2025-05-04 09:00:00');

-- 14. AuditLog
INSERT IGNORE INTO AuditLog (id, entity, entity_id, action, changed_by, changes) VALUES
  (1, 'Producto', 1, 'INSERT', 1, '{"nombre": "Pastilla de freno", "precio": "50.00"}'),
  (2, 'Venta', 1, 'INSERT', 2, '{"total": "150.00"}'),
  (3, 'Cliente', 1, 'UPDATE', 5, '{"telefono": "1111111111"}'),
  (4, 'Proveedor', 2, 'INSERT', 1, '{"nombre": "Proveedor B"}'),
  (5, 'Usuario', 3, 'UPDATE', 1, '{"correo": "comprador1@example.com"}');

-- Puedes agregar más datos de prueba si lo deseas
