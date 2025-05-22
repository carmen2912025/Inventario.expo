-- Consulta: Ventas del día de hoy
SELECT * FROM Ventas WHERE DATE(fecha) = CURDATE();

-- Consulta: Detalle de ventas del día de hoy
SELECT dv.* FROM DetalleVenta dv
JOIN Ventas v ON dv.venta_id = v.id
WHERE DATE(v.fecha) = CURDATE();

-- Consulta: Resumen de ventas diarias (últimos 30 días)
SELECT * FROM ResumenVentasDiarias ORDER BY dia DESC LIMIT 30;

-- Consulta: Productos más vendidos (top 5)
SELECT p.id, p.nombre, SUM(dv.cantidad) as total_vendidos, SUM(dv.cantidad * dv.precio_unitario) as total_ingresos
FROM DetalleVenta dv
JOIN Productos p ON dv.producto_id = p.id
GROUP BY p.id, p.nombre
ORDER BY total_vendidos DESC
LIMIT 5;
