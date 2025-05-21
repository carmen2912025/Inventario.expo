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
- `app/(tabs)/providers.tsx`: Pantalla de proveedores
- `app/(tabs)/statistics.tsx`: Pantalla de estadísticas

## Personalización
Puedes modificar los archivos de cada pantalla para agregar funcionalidades CRUD, gráficos, etc.

## Variables de entorno

La URL de la API se configura en `app.json` dentro del bloque `extra`:

```json
"extra": {
  "API_URL": "http://192.168.1.100:3001"
}
```

Puedes cambiar esta URL según tu entorno (desarrollo, producción, etc). La app la leerá automáticamente.

## Pruebas

Para ejecutar los tests:

```sh
npm test
```

## Seguridad

- No subas archivos sensibles como `google-services.json` o claves privadas al repositorio.
- Usa variables de entorno para claves y URLs.

## Paginación y rendimiento

Si tu inventario crece, implementa paginación en los fetch y en los FlatList usando `onEndReached`.

---

Proyecto creado con Expo Router y TypeScript.
