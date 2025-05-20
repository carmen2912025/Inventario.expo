// Tipos para las tablas principales de la base de datos

export type Rol = {
  id: number;
  nombre: string;
};

export type Permiso = {
  id: number;
  nombre: string;
};

export type RolPermiso = {
  id: number;
  role_id: number;
  permiso_id: number;
};

export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string;
};

export type Ubicacion = {
  id: number;
  nombre: string;
  direccion: string;
};

export type Proveedor = {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
};

export type Producto = {
  id: number;
  sku: string;
  barcode: string;
  nombre: string;
  descripcion: string;
  categoria_id: number;
  precio: number;
  fecha_ultima_actualizacion_precio: string;
  cantidad: number;
  fecha_ultima_repo: string;
  imagen: string;
};

export type Cliente = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
};

export type Usuario = {
  id: number;
  nombre: string;
  ci: string;
  telefono: string;
  correo: string;
  rol_id: number;
};

export type ApiToken = {
  id: number;
  token: string;
  usuario_id: number;
  expiracion: string;
  revoked: boolean;
};

export type ProveedorProducto = {
  id: number;
  proveedor_id: number;
  producto_id: number;
  fecha: string;
  cantidad: number;
  precio_compra: number;
};

export type Venta = {
  id: number;
  cliente_id: number;
  fecha: string;
  total: number;
  created_by: number;
};

export type DetalleVenta = {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
};

export type Stock = {
  id: number;
  producto_id: number;
  ubicacion_id: number;
  cantidad: number;
};

export type StockMovimiento = {
  id: number;
  producto_id: number;
  fecha: string;
  tipo: string;
  cantidad: number;
  referencia_id: number;
  usuario_id: number;
};

export type ProductoPrecioHistorial = {
  id: number;
  producto_id: number;
  precio: number;
  fecha_ultima_actualizacion_precio: string;
};

export type AuditLog = {
  id: number;
  entity: string;
  entity_id: number;
  action: string;
  changed_by: number;
  changes: string;
};
