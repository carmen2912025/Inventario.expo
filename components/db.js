import { Platform } from 'react-native';

let realDb = null;

async function getSQLiteDb() {
  // Solo cargar expo-sqlite dinámicamente en Android/iOS
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const SQLite = await import('expo-sqlite');
    if (SQLite.openDatabase) {
      return SQLite.openDatabase('inventario.db');
    } else if (SQLite.default?.openDatabase) {
      return SQLite.default.openDatabase('inventario.db');
    } else {
      console.error('expo-sqlite: openDatabase no está disponible. Reinstala expo-sqlite o revisa la versión.');
      return null;
    }
  }
  return null;
}

function getWebMockDb() {
  return {
    _data: { productos: [], proveedores: [], categorias: [] },
    transaction(cb) {
      const tx = {
        executeSql: (sql, params, onSuccess, onError) => {
          // Simulación básica de SQL para web
          if (sql.startsWith('CREATE TABLE')) return onSuccess && onSuccess();
          if (sql.startsWith('DELETE FROM productos')) { this._data.productos = []; return onSuccess && onSuccess(); }
          if (sql.startsWith('DELETE FROM proveedores')) { this._data.proveedores = []; return onSuccess && onSuccess(); }
          if (sql.startsWith('DELETE FROM categorias')) { this._data.categorias = []; return onSuccess && onSuccess(); }
          if (sql.startsWith('INSERT INTO categorias')) { this._data.categorias.push(params); return onSuccess && onSuccess(); }
          if (sql.startsWith('INSERT INTO proveedores')) { this._data.proveedores.push(params); return onSuccess && onSuccess(); }
          if (sql.startsWith('INSERT INTO productos')) { this._data.productos.push(params); return onSuccess && onSuccess(); }
          if (sql.startsWith('SELECT * FROM productos')) { return onSuccess && onSuccess(null, { rows: { _array: this._data.productos.map((p, i) => ({ id: i+1, ...p })) } }); }
          if (sql.startsWith('SELECT * FROM proveedores')) { return onSuccess && onSuccess(null, { rows: { _array: this._data.proveedores.map((p, i) => ({ id: i+1, ...p })) } }); }
          if (sql.startsWith('SELECT * FROM categorias')) { return onSuccess && onSuccess(null, { rows: { _array: this._data.categorias.map((p, i) => ({ id: i+1, ...p })) } }); }
          if (onError) onError('Not implemented in web mock');
        },
        _data: this._data
      };
      cb(tx);
    }
  };
}

export async function getDb() {
  if (realDb) return realDb;
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    realDb = await getSQLiteDb();
  } else {
    realDb = getWebMockDb();
  }
  return realDb;
}

export async function initDB() {
  const db = await getDb();
  if (!db) return;
  db.transaction((tx) => {
    // Tablas de referencia
    tx.executeSql(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS ubicaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      direccion TEXT
    );`);
    // Tablas principales
    tx.executeSql(`CREATE TABLE IF NOT EXISTS proveedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      correo TEXT
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      barcode TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      categoria_id INTEGER,
      precio REAL NOT NULL,
      fecha_ultima_actualizacion_precio TEXT,
      cantidad INTEGER DEFAULT 0,
      fecha_ultima_repo TEXT,
      imagen TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT,
      telefono TEXT
    );`);
    // Tablas de movimientos y relaciones
    tx.executeSql(`CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      fecha TEXT,
      total REAL,
      created_by INTEGER
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS detalle_venta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venta_id INTEGER,
      producto_id INTEGER,
      cantidad INTEGER,
      precio_unitario REAL
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS stock (
      producto_id INTEGER,
      ubicacion_id INTEGER,
      cantidad INTEGER,
      PRIMARY KEY (producto_id, ubicacion_id)
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS stock_movimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      fecha TEXT DEFAULT (datetime('now')),
      tipo TEXT,
      cantidad INTEGER,
      referencia_id INTEGER
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS proveedor_producto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proveedor_id INTEGER,
      producto_id INTEGER,
      fecha TEXT,
      cantidad INTEGER,
      precio_compra REAL
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS resumen_ventas_diarias (
      dia TEXT PRIMARY KEY,
      total_ventas INTEGER,
      monto_total REAL
    );`);
  });
}

let dbInitErrorShown = false;

export async function initDBWithTestData() {
  const db = await getDb();
  if (!db) {
    if (!dbInitErrorShown) {
      console.error('No se pudo inicializar la base de datos. ¿Estás en Android/iOS y tienes expo-sqlite instalado?');
      dbInitErrorShown = true;
    }
    return false;
  }
  dbInitErrorShown = false;
  db.transaction((tx) => {
    // Limpiar tablas principales
    tx.executeSql('DELETE FROM productos');
    tx.executeSql('DELETE FROM proveedores');
    tx.executeSql('DELETE FROM categorias');
    tx.executeSql('DELETE FROM ubicaciones');
    tx.executeSql('DELETE FROM clientes');
    tx.executeSql('DELETE FROM stock');
    tx.executeSql('DELETE FROM stock_movimientos');
    tx.executeSql('DELETE FROM proveedor_producto');
    tx.executeSql('DELETE FROM ventas');
    tx.executeSql('DELETE FROM detalle_venta');
    tx.executeSql('DELETE FROM resumen_ventas_diarias');
    // Insertar datos de prueba mínimos
    tx.executeSql('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', ['Electrónica', null]);
    tx.executeSql('INSERT INTO ubicaciones (nombre, direccion) VALUES (?,?)', ['Almacén Principal', null]);
    tx.executeSql('INSERT INTO proveedores (nombre, direccion, telefono, correo) VALUES (?,?,?,?)', ['Tech Distribuidora', 'Calle Falsa 123', null, null]);
    tx.executeSql('INSERT INTO productos (sku, nombre, categoria_id, precio) VALUES (?,?,?,?)', ['PROD001', 'Televisor 4K', 1, 899.99]);
    tx.executeSql('INSERT INTO clientes (nombre) VALUES (?)', ['Cliente Prueba']);
    tx.executeSql('INSERT INTO proveedor_producto (proveedor_id, producto_id, fecha, cantidad, precio_compra) VALUES (?,?,?,?,?)', [1, 1, new Date().toISOString().slice(0,10), 10, 700.00]);
    tx.executeSql('INSERT INTO ventas (cliente_id, total) VALUES (?,?)', [1, 999.99]);
    tx.executeSql('INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?,?,?,?)', [1, 1, 1, 999.99]);
  });
  return true;
}
