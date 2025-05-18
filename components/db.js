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
    tx.executeSql(`CREATE TABLE IF NOT EXISTS marcas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
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
      marca_id INTEGER,
      precio REAL NOT NULL,
      fecha_ultima_actualizacion_precio TEXT,
      cantidad INTEGER DEFAULT 0,
      fecha_ultima_repo TEXT,
      imagen TEXT,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (marca_id) REFERENCES marcas(id)
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT,
      telefono TEXT
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ci TEXT NOT NULL UNIQUE,
      telefono TEXT,
      correo TEXT UNIQUE,
      rol_id INTEGER
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      ubicacion_id INTEGER,
      cantidad INTEGER,
      UNIQUE(producto_id, ubicacion_id)
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS stock_movimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      fecha TEXT,
      tipo TEXT,
      cantidad INTEGER,
      referencia_id INTEGER,
      usuario_id INTEGER
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS productos_precio_historial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      precio REAL,
      fecha_ultima_actualizacion_precio TEXT
    );`);
    // Tablas de seguridad y control (opcional, para futuras mejoras)
    tx.executeSql(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS permisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS rol_permisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER,
      permiso_id INTEGER
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
    tx.executeSql('DELETE FROM marcas');
    tx.executeSql('DELETE FROM ubicaciones');
    // Insertar datos de prueba básicos (puedes expandir con más INSERTs según inventario.txt)
    // Categorías
    tx.executeSql('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', ['Frenos', 'Piezas relacionadas con el sistema de frenado']);
    tx.executeSql('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', ['Suspensión', 'Elementos para la suspensión de la moto']);
    tx.executeSql('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', ['Motor', 'Componentes del motor']);
    tx.executeSql('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', ['Transmisión', 'Piezas de la transmisión y cadena']);
    tx.executeSql('INSERT INTO categorias (nombre, descripcion) VALUES (?,?)', ['Accesorios', 'Complementos y accesorios varios']);
    // Marcas
    tx.executeSql('INSERT INTO marcas (nombre) VALUES (?)', ['Yamaha']);
    tx.executeSql('INSERT INTO marcas (nombre) VALUES (?)', ['Honda']);
    tx.executeSql('INSERT INTO marcas (nombre) VALUES (?)', ['Suzuki']);
    tx.executeSql('INSERT INTO marcas (nombre) VALUES (?)', ['Kawasaki']);
    tx.executeSql('INSERT INTO marcas (nombre) VALUES (?)', ['Ducati']);
    // Ubicaciones
    tx.executeSql('INSERT INTO ubicaciones (nombre, direccion) VALUES (?,?)', ['Almacén Central', 'Calle Principal 100']);
    tx.executeSql('INSERT INTO ubicaciones (nombre, direccion) VALUES (?,?)', ['Sucursal Norte', 'Av. Norte 200']);
    tx.executeSql('INSERT INTO ubicaciones (nombre, direccion) VALUES (?,?)', ['Sucursal Sur', 'Av. Sur 300']);
    tx.executeSql('INSERT INTO ubicaciones (nombre, direccion) VALUES (?,?)', ['Almacén Temporario', 'Calle Temporal 50']);
    tx.executeSql('INSERT INTO ubicaciones (nombre, direccion) VALUES (?,?)', ['Depósito de Respaldo', 'Calle Respaldo 10']);
    // Proveedores
    tx.executeSql('INSERT INTO proveedores (nombre, direccion, telefono, correo) VALUES (?,?,?,?)', ['Proveedor A', 'Calle 10', '1234567890', 'proveedora@example.com']);
    tx.executeSql('INSERT INTO proveedores (nombre, direccion, telefono, correo) VALUES (?,?,?,?)', ['Proveedor B', 'Av. Central 123', '2345678901', 'proveedorb@example.com']);
    tx.executeSql('INSERT INTO proveedores (nombre, direccion, telefono, correo) VALUES (?,?,?,?)', ['Proveedor C', 'Calle 20', '3456789012', 'proveedorc@example.com']);
    tx.executeSql('INSERT INTO proveedores (nombre, direccion, telefono, correo) VALUES (?,?,?,?)', ['Proveedor D', 'Av. Industrial 50', '4567890123', 'proveedord@example.com']);
    tx.executeSql('INSERT INTO proveedores (nombre, direccion, telefono, correo) VALUES (?,?,?,?)', ['Proveedor E', 'Calle Comercio 5', '5678901234', 'proveedore@example.com']);
    // Productos (relacionados con categoría y marca por id)
    tx.executeSql('INSERT INTO productos (sku, barcode, nombre, descripcion, categoria_id, marca_id, precio, fecha_ultima_actualizacion_precio, cantidad, fecha_ultima_repo, imagen) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ['SKU001','BAR001','Pastilla de freno','Pastillas de freno de alta calidad',1,1,50.00,'2025-05-01',100,'2025-05-02','http://example.com/img001.jpg']);
    tx.executeSql('INSERT INTO productos (sku, barcode, nombre, descripcion, categoria_id, marca_id, precio, fecha_ultima_actualizacion_precio, cantidad, fecha_ultima_repo, imagen) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ['SKU002','BAR002','Amortiguador','Amortiguador robusto para suspensión',2,2,120.00,'2025-05-02',50,'2025-05-03','http://example.com/img002.jpg']);
    tx.executeSql('INSERT INTO productos (sku, barcode, nombre, descripcion, categoria_id, marca_id, precio, fecha_ultima_actualizacion_precio, cantidad, fecha_ultima_repo, imagen) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ['SKU003','BAR003','Filtro de aire','Filtro de aire para motores',3,3,30.00,'2025-05-03',70,'2025-05-04','http://example.com/img003.jpg']);
    tx.executeSql('INSERT INTO productos (sku, barcode, nombre, descripcion, categoria_id, marca_id, precio, fecha_ultima_actualizacion_precio, cantidad, fecha_ultima_repo, imagen) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ['SKU004','BAR004','Cadena','Cadena de transmisión resistente',4,4,80.00,'2025-05-04',40,'2025-05-05','http://example.com/img004.jpg']);
    tx.executeSql('INSERT INTO productos (sku, barcode, nombre, descripcion, categoria_id, marca_id, precio, fecha_ultima_actualizacion_precio, cantidad, fecha_ultima_repo, imagen) VALUES (?,?,?,?,?,?,?,?,?,?,?)', ['SKU005','BAR005','Casco','Casco de protección integral',5,5,200.00,'2025-05-05',25,'2025-05-06','http://example.com/img005.jpg']);
  });
  return true;
}
