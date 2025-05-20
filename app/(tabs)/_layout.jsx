import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useRole } from '../../components/RoleContext';

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { role } = useRole();

  // Definir las tabs permitidas por rol
  const tabsByRole = {
    administrador: [
      { name: 'index', title: 'Productos', icon: 'archive' },
      { name: 'providers', title: 'Proveedores', icon: 'truck' },
      { name: 'sales', title: 'Ventas', icon: 'shopping-cart' },
      { name: 'stock', title: 'Stock', icon: 'database' },
      { name: 'statistics', title: 'Estadísticas', icon: 'bar-chart' },
      { name: 'auditlog', title: 'Auditoría', icon: 'file-text' },
      { name: 'pricehistory', title: 'Historial Precios', icon: 'history' },
      { name: 'users', title: 'Usuarios', icon: 'user' },
    ],
    trabajador: [
      { name: 'index', title: 'Productos', icon: 'archive' },
      { name: 'sales', title: 'Ventas', icon: 'shopping-cart' },
      { name: 'stock', title: 'Stock', icon: 'database' },
      { name: 'statistics', title: 'Estadísticas', icon: 'bar-chart' },
    ],
    cliente: [
      { name: 'stock', title: 'Stock', icon: 'database' },
    ],
  };
  const allowedTabs = tabsByRole[role] || tabsByRole['cliente'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      {allowedTabs.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <TabBarIcon name={tab.icon} color={color} />, 
          }}
        />
      ))}
    </Tabs>
  );
}
