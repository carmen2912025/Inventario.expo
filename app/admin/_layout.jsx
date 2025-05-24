import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProductosScreen from './productos';
import ProvidersScreen from './providers';
import SalesAdminScreen from './salesAdmin';
import StatisticsAdminScreen from './statisticsAdmin';
import AuditlogScreen from './auditlog';
import PricehistoryScreen from './pricehistory';
import UsersAdminScreen from './usersAdmin';
import VentasDiaAdminScreen from './ventasDiaAdmin';

const Drawer = createDrawerNavigator();

export default function AdminDrawerLayout() {
  return (
    <Drawer.Navigator initialRouteName="productos"
      screenOptions={{
        drawerType: 'permanent',
        drawerStyle: { width: 240 },
      }}
    >
      <Drawer.Screen name="productos" component={ProductosScreen} options={{ title: 'Productos' }} />
      <Drawer.Screen name="providers" component={ProvidersScreen} options={{ title: 'Proveedores' }} />
      <Drawer.Screen name="salesAdmin" component={SalesAdminScreen} options={{ title: 'Ventas' }} />
      <Drawer.Screen name="statisticsAdmin" component={StatisticsAdminScreen} options={{ title: 'Estadísticas' }} />
      <Drawer.Screen name="auditlog" component={AuditlogScreen} options={{ title: 'Auditoría' }} />
      <Drawer.Screen name="pricehistory" component={PricehistoryScreen} options={{ title: 'Historial Precios' }} />
      <Drawer.Screen name="usersAdmin" component={UsersAdminScreen} options={{ title: 'Usuarios' }} />
      <Drawer.Screen name="ventasDiaAdmin" component={VentasDiaAdminScreen} options={{ title: 'Ventas del Día' }} />
    </Drawer.Navigator>
  );
}
