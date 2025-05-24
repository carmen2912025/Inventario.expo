# Roadmap de Mejoras y Sugerencias

## 1. Limpieza y arquitectura base
- [x] Crear carpeta hooks/ y migrar lógica de fetch y manipulación de datos a hooks personalizados: useProducts, useProviders, useCategories, etc.
- [x] Revisar y refactorizar componentes en components/ para asegurar reutilización (listas, formularios, modales).
- [x] Revisar el uso de tipos en todo el frontend y asegurar que se utilicen los definidos en types/dbTypes.ts.
- [x] Reorganizar carpetas y archivos si hay duplicados o código mal ubicado.
  - [23/05/2025] Objetivo: Reorganización de carpetas y archivos (punto del roadmap)
    - Acciones realizadas:
      - Eliminado `components/RoleSelectorScreen.js` (obsoleto tras unificación con `RoleSwitcher`).
      - Revisados archivos en `components/`:
        - `db.js`, `mysqlClient.js`, `emptyModule.js` son mocks/archivos de referencia para evitar errores en Expo/web. Se mantienen pero se documentan mejor y se consideran para mover a una subcarpeta `components/mocks/` en el futuro si se desea mayor limpieza.
      - No se detectan archivos duplicados funcionales. El único duplicado es `db.js` (uno en backend, uno mock en frontend), pero cumplen roles distintos.
      - Estructura de hooks, types y componentes reutilizables ya está clara y separada.
    - Siguientes pasos sugeridos:
      - Si se desea, mover los mocks (`db.js`, `mysqlClient.js`, `emptyModule.js`) a `components/mocks/` para mayor claridad.
      - Continuar con los siguientes puntos del roadmap: mejoras backend, UI/UX, funcionalidad avanzada, extras/escalabilidad, manejo global de errores y documentación.
    - Estado:
      - Objetivo de reorganización de carpetas y archivos: **CUMPLIDO**
      - Se recomienda mantener la estructura actual, con posible mejora menor en la ubicación de mocks si se desea más limpieza visual.

## 2. Mejoras de backend y base de datos
- [x] Revisar backend/server.js y agregar endpoints faltantes para actualizar/eliminar proveedores, clientes y ubicaciones.
- [x] Mejorar validaciones en backend/db.js y scripts/update_inventario_db.sql para evitar duplicados y asegurar integridad referencial.
  - [23/05/2025] Objetivo: Validaciones y restricciones en backend y base de datos
    - Acciones realizadas:
      - Añadidas restricciones UNIQUE en proveedores y clientes (correo, nombre) en el script SQL.
      - Añadidas claves foráneas y ON DELETE SET NULL en productos.
      - Añadida validación en backend para evitar duplicados de proveedores y clientes por correo o nombre antes de insertar.
    - Estado: **CUMPLIDO**
- [x] Exponer logs de auditoría en un endpoint y mostrar en la UI (pantalla admin/auditlog.jsx).
  - [23/05/2025] Objetivo: Logs de auditoría
    - Acciones realizadas:
      - Endpoint `/auditlog` ya implementado en backend y funcional.
      - Pantalla `admin/auditlog.jsx` ya consume y muestra los logs de auditoría con diseño moderno y estado vacío amigable.
    - Estado: **CUMPLIDO**

## 3. UI/UX y consistencia visual
- [x] Definir paleta de colores y tipografías en constants/Colors.ts y aplicarlas globalmente.
  - [23/05/2025] Objetivo: Paleta de colores y tipografía global
    - Acciones realizadas:
      - Definida paleta moderna y acentos visuales en constants/Colors.ts.
      - Exportada y preparada fontFamily global para uso en toda la app.
    - Estado: **CUMPLIDO**
- [x] Unificar espaciados y estilos en todos los componentes principales.
  - [23/05/2025] Objetivo: Unificación de estilos y espaciados
    - Acciones realizadas:
      - Actualizados paddings, borderRadius, colores y fontFamily en los screens principales de productos, proveedores y usuarios (admin, trabajador, cliente) para seguir la paleta y tipografía global.
      - Se recomienda replicar este patrón en cualquier pantalla nueva o componente adicional.
    - Estado: **CUMPLIDO**
- [x] Añadir loaders/spinners y mensajes de éxito/error en operaciones de fetch, add, delete, update.
  - [23/05/2025] Objetivo: Loaders y feedback visual
    - Acciones realizadas:
      - Integrados ActivityIndicator (spinners) y mensajes de éxito/error en pantallas principales de productos, proveedores y usuarios (admin, trabajador, cliente).
      - Se recomienda replicar el patrón en cualquier pantalla nueva o componente adicional.
    - Estado: **CUMPLIDO**
- [x] Implementar estados vacíos (empty states) con ilustraciones o mensajes amigables.
  - [23/05/2025] Objetivo: Empty states amigables
    - Acciones realizadas:
      - Añadidos mensajes y estados vacíos amigables en pantallas principales (productos, proveedores, usuarios, auditoría, etc). Se recomienda usar ilustraciones en el futuro para mayor atractivo visual.
      - Se recomienda replicar el patrón en cualquier pantalla nueva o componente adicional.
    - Estado: **CUMPLIDO**
- [x] Revisar y mejorar la accesibilidad: roles, etiquetas, soporte para lectores de pantalla.
  - [23/05/2025] Objetivo: Accesibilidad
    - Acciones realizadas:
      - Añadidos roles, etiquetas accesibles y soporte básico para lectores de pantalla en los principales componentes y pantallas.
      - Se recomienda revisar cualquier pantalla nueva o componente adicional para mantener buenas prácticas de accesibilidad.
    - Estado: **CUMPLIDO**

## 4. Funcionalidad avanzada
- [x] Asegurar que todas las entidades (productos, proveedores) tengan CRUD completo desde la UI.
- [x] Mejorar la búsqueda y agregar filtros avanzados en productos y proveedores.
- [x] Implementar paginación en listas grandes usando FlatList y onEndReached.
- [x] Añadir gestión de stock y alertas de bajo stock.
- [x] Mostrar historial de precios (admin/pricehistory.jsx).
- [x] Agregar reportes y estadísticas con gráficos (admin/statisticsAdmin.jsx, trabajador/statisticsTrabajador.jsx).

Notas:
- Se implementaron y documentaron reportes y estadísticas con gráficos modernos en las pantallas de admin y trabajador.
- Se crearon componentes reutilizables de gráficos (BarChart, PieChart, LineChart) y se integraron en ambas vistas.
- Los datos se obtienen de endpoints agregados en el backend y se visualizan de forma clara y responsiva.
- La funcionalidad está validada y lista para uso y futuras extensiones.

## 5. Extras y escalabilidad
- [ ] Permitir subir y mostrar imágenes de productos (usar expo-image-picker o similar).
- [ ] Agregar opción para exportar reportes a CSV o PDF.
- [ ] Implementar soporte offline usando AsyncStorage para operaciones críticas.
- [ ] Revisar la arquitectura para facilitar la adición de nuevos roles o módulos en el futuro.

## 6. Manejo global de errores y documentación
- [ ] Implementar un sistema centralizado para mostrar errores y notificaciones (ejemplo: contexto global o hook useNotifications).
- [ ] Actualizar el README principal y types/README.md con ejemplos de uso, endpoints y capturas de pantalla.
