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
  role_id: number;
  permiso_id: number;
};

export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Marca = {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Ubicacion = {
  id: number;
  nombre: string;
  direccion: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Proveedor = {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Producto = {
  id: number;
  sku: string;
  barcode: string | null;
  nombre: string;
  descripcion: string | null;
  categoria_id: number | null;
  marca_id: number | null;
  precio: number;
  fecha_ultima_actualizacion_precio: string | null;
  cantidad: number;
  fecha_ultima_repo: string | null;
  imagen: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Cliente = {
  id: number;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Usuario = {
  id: number;
  nombre: string;
  ci: string;
  telefono: string | null;
  correo: string;
  rol_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type ApiToken = {
  token: string;
  usuario_id: number;
  creado_en: string;
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
  created_at: string;
};

export type Venta = {
  id: number;
  cliente_id: number | null;
  fecha: string;
  total: number;
  created_by: number | null;
};

export type DetalleVenta = {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
};

export type Stock = {
  producto_id: number;
  ubicacion_id: number;
  cantidad: number;
};

export type StockMovimiento = {
  id: number;
  producto_id: number;
  fecha: string;
  tipo: 'COMPRA' | 'VENTA' | 'AJUSTE';
  cantidad: number;
  referencia_id: number | null;
  usuario_id: number | null;
};

export type ResumenVentasDiarias = {
  dia: string;
  total_ventas: number;
  monto_total: number;
};

export type AuditLog = {
  id: number;
  entity: string;
  entity_id: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by: number | null;
  changed_at: string;
  changes: string;
};
// ...otros tipos según sea necesario...
