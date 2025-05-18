# VM - Gestión de Productos

Este proyecto es una app Expo React Native para la gestión de productos, proveedores y estadísticas, con una interfaz moderna y navegación por tabs usando Expo Router.

## Características
- **Productos:** Administra tu inventario de productos.
- **Proveedores:** Gestiona tus proveedores y contactos.
- **Estadísticas:** Visualiza métricas y reportes de tu inventario.
- Sin autenticación, acceso directo a todas las funcionalidades.

## Instalación y uso

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Inicia el proyecto:
   ```sh
   npm start
   ```
   Luego escanea el QR con la app Expo Go o usa un emulador/simulador.

## Estructura
- `app/(tabs)/index.tsx`: Pantalla de productos
- `app/(tabs)/two.tsx`: Pantalla de proveedores
- `app/(tabs)/statistics.tsx`: Pantalla de estadísticas

## Personalización
Puedes modificar los archivos de cada pantalla para agregar funcionalidades CRUD, gráficos, etc.

---

Proyecto creado con Expo Router y TypeScript.
