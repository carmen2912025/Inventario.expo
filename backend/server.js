const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para obtener productos
app.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE is_active = 1');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener categorías
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener marcas
app.get('/brands', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM marcas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para agregar un producto (con todos los campos)
app.post('/products', async (req, res) => {
  const { sku, nombre, descripcion, precio, cantidad, categoria_id, marca_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO productos (sku, nombre, descripcion, precio, cantidad, categoria_id, marca_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [sku, nombre, descripcion, precio, cantidad, categoria_id, marca_id]
    );
    res.json({ id: result.insertId, sku, nombre, descripcion, precio, cantidad, categoria_id, marca_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para eliminar (desactivar) un producto
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE productos SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
