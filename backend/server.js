const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Simple validation utility
function validateFields(obj, schema) {
  for (const key in schema) {
    const { required, type, min, max, pattern } = schema[key];
    const value = obj[key];
    if (required && (value === undefined || value === null || value === '')) {
      return `${key} is required`;
    }
    if (type && value !== undefined && value !== null) {
      if (type === 'number' && typeof value !== 'number') return `${key} must be a number`;
      if (type === 'string' && typeof value !== 'string') return `${key} must be a string`;
    }
    if (min !== undefined && typeof value === 'number' && value < min) return `${key} must be >= ${min}`;
    if (max !== undefined && typeof value === 'number' && value > max) return `${key} must be <= ${max}`;
    if (pattern && typeof value === 'string' && !pattern.test(value)) return `${key} is invalid`;
  }
  return null;
}

// Endpoint para obtener productos
app.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Productos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener categorías
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Categorias');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para agregar un producto
app.post('/products', async (req, res) => {
  const { sku, nombre, descripcion, precio, cantidad, categoria_id } = req.body;
  const error = validateFields(req.body, {
    sku: { required: true, type: 'string' },
    nombre: { required: true, type: 'string' },
    descripcion: { required: false, type: 'string' },
    precio: { required: true, type: 'number', min: 0 },
    cantidad: { required: true, type: 'number', min: 0 },
    categoria_id: { required: true, type: 'number', min: 1 },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query(
      'INSERT INTO Productos (sku, nombre, descripcion, precio, cantidad, categoria_id) VALUES (?, ?, ?, ?, ?, ?)',

      [sku, nombre, descripcion, precio, cantidad, categoria_id]
    );
    res.json({ id: result.insertId, sku, nombre, descripcion, precio, cantidad, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para eliminar un producto
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Productos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener proveedores
app.get('/providers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Proveedores');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener clientes
app.get('/clients', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Clientes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener ventas
app.get('/sales', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Ventas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener detalle de ventas
app.get('/sales/:id/details', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM DetalleVenta WHERE venta_id = ?', [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener stock por producto
app.get('/stock/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM Stock WHERE producto_id = ?', [productId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener movimientos de stock
app.get('/stock-movements/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM StockMovimientos WHERE producto_id = ?', [productId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ENDPOINTS GENERALES CRUD Y CONSULTAS AVANZADAS ---

// Categorias
app.post('/categories', async (req, res) => {
  const { nombre, descripcion } = req.body;
  const error = validateFields(req.body, {
    nombre: { required: true, type: 'string' },
    descripcion: { required: false, type: 'string' },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query('INSERT INTO Categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    res.json({ id: result.insertId, nombre, descripcion });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    await db.query('UPDATE Categorias SET nombre=?, descripcion=? WHERE id=?', [nombre, descripcion, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Categorias WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ubicaciones
app.get('/locations', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Ubicaciones');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/locations', async (req, res) => {
  const { nombre, direccion } = req.body;
  const error = validateFields(req.body, {
    nombre: { required: true, type: 'string' },
    direccion: { required: false, type: 'string' },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query('INSERT INTO Ubicaciones (nombre, direccion) VALUES (?, ?)', [nombre, direccion]);
    res.json({ id: result.insertId, nombre, direccion });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/locations/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion } = req.body;
  try {
    await db.query('UPDATE Ubicaciones SET nombre=?, direccion=? WHERE id=?', [nombre, direccion, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Ubicaciones WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Proveedores
app.post('/providers', async (req, res) => {
  const { nombre, direccion, telefono, correo } = req.body;
  const error = validateFields(req.body, {
    nombre: { required: true, type: 'string' },
    direccion: { required: false, type: 'string' },
    telefono: { required: false, type: 'string' },
    correo: { required: false, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query('INSERT INTO Proveedores (nombre, direccion, telefono, correo) VALUES (?, ?, ?, ?)', [nombre, direccion, telefono, correo]);
    res.json({ id: result.insertId, nombre, direccion, telefono, correo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/providers/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono, correo } = req.body;
  try {
    await db.query('UPDATE Proveedores SET nombre=?, direccion=?, telefono=?, correo=? WHERE id=?', [nombre, direccion, telefono, correo, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/providers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Proveedores WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Clientes
app.post('/clients', async (req, res) => {
  const { nombre, correo, telefono } = req.body;
  const error = validateFields(req.body, {
    nombre: { required: true, type: 'string' },
    correo: { required: false, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
    telefono: { required: false, type: 'string' },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query('INSERT INTO Clientes (nombre, correo, telefono) VALUES (?, ?, ?)', [nombre, correo, telefono]);
    res.json({ id: result.insertId, nombre, correo, telefono });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono } = req.body;
  try {
    await db.query('UPDATE Clientes SET nombre=?, correo=?, telefono=? WHERE id=?', [nombre, correo, telefono, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/clients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Clientes WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ventas
app.post('/sales', async (req, res) => {
  const { cliente_id, total } = req.body;
  const error = validateFields(req.body, {
    cliente_id: { required: true, type: 'number', min: 1 },
    total: { required: true, type: 'number', min: 0 },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query('INSERT INTO Ventas (cliente_id, total) VALUES (?, ?)', [cliente_id, total]);
    res.json({ id: result.insertId, cliente_id, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_id, total } = req.body;
  try {
    await db.query('UPDATE Ventas SET cliente_id=?, total=? WHERE id=?', [cliente_id, total, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Ventas WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DetalleVenta
app.post('/sales/:id/details', async (req, res) => {
  const { id } = req.params;
  const { producto_id, cantidad, precio_unitario } = req.body;
  const error = validateFields(req.body, {
    producto_id: { required: true, type: 'number', min: 1 },
    cantidad: { required: true, type: 'number', min: 1 },
    precio_unitario: { required: true, type: 'number', min: 0 },
  });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query('INSERT INTO DetalleVenta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', [id, producto_id, cantidad, precio_unitario]);
    res.json({ id: result.insertId, venta_id: id, producto_id, cantidad, precio_unitario });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/sales/:saleId/details/:detailId', async (req, res) => {
  const { saleId, detailId } = req.params;
  const { producto_id, cantidad, precio_unitario } = req.body;
  try {
    await db.query('UPDATE DetalleVenta SET producto_id=?, cantidad=?, precio_unitario=? WHERE id=? AND venta_id=?', [producto_id, cantidad, precio_unitario, detailId, saleId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/sales/:saleId/details/:detailId', async (req, res) => {
  const { saleId, detailId } = req.params;
  try {
    await db.query('DELETE FROM DetalleVenta WHERE id=? AND venta_id=?', [detailId, saleId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Stock
app.post('/stock', async (req, res) => {
  const { producto_id, ubicacion_id, cantidad } = req.body;
  const error = validateFields(req.body, {
    producto_id: { required: true, type: 'number', min: 1 },
    ubicacion_id: { required: true, type: 'number', min: 1 },
    cantidad: { required: true, type: 'number', min: 0 },
  });
  if (error) return res.status(400).json({ error });
  try {
    await db.query('INSERT INTO Stock (producto_id, ubicacion_id, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = ?', [producto_id, ubicacion_id, cantidad, cantidad]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/stock', async (req, res) => {
  const { producto_id, ubicacion_id, cantidad } = req.body;
  try {
    await db.query('UPDATE Stock SET cantidad=? WHERE producto_id=? AND ubicacion_id=?', [cantidad, producto_id, ubicacion_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/stock', async (req, res) => {
  const { producto_id, ubicacion_id } = req.body;
  try {
    await db.query('DELETE FROM Stock WHERE producto_id=? AND ubicacion_id=?', [producto_id, ubicacion_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// StockMovimientos
app.post('/stock-movements', async (req, res) => {
  const { producto_id, tipo, cantidad, referencia_id } = req.body;
  const error = validateFields(req.body, {
    producto_id: { required: true, type: 'number', min: 1 },
    tipo: { required: true, type: 'string' },
    cantidad: { required: true, type: 'number', min: 1 },
    referencia_id: { required: false, type: 'number', min: 1 },
  });
  if (error) return res.status(400).json({ error });
  try {
    await db.query('INSERT INTO StockMovimientos (producto_id, tipo, cantidad, referencia_id) VALUES (?, ?, ?, ?)', [producto_id, tipo, cantidad, referencia_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ProveedorProducto
app.get('/provider-products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ProveedorProducto');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/provider-products', async (req, res) => {
  const { proveedor_id, producto_id, fecha, cantidad, precio_compra } = req.body;
  const error = validateFields(req.body, {
    proveedor_id: { required: true, type: 'number', min: 1 },
    producto_id: { required: true, type: 'number', min: 1 },
    fecha: { required: true, type: 'string' },
    cantidad: { required: true, type: 'number', min: 1 },
    precio_compra: { required: true, type: 'number', min: 0 },
  });
  if (error) return res.status(400).json({ error });
  try {
    await db.query('INSERT INTO ProveedorProducto (proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES (?, ?, ?, ?, ?)', [proveedor_id, producto_id, fecha, cantidad, precio_compra]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ResumenVentasDiarias
app.get('/sales-summary', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ResumenVentasDiarias ORDER BY dia DESC LIMIT 30');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
