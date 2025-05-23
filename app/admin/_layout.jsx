import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen name="productos" options={{ title: 'Productos', tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} /> }} />
      <Tabs.Screen name="providers" options={{ title: 'Proveedores', tabBarIcon: ({ color }) => <TabBarIcon name="truck" color={color} /> }} />
      <Tabs.Screen name="salesAdmin" options={{ title: 'Ventas', tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} /> }} />
      <Tabs.Screen name="statisticsAdmin" options={{ title: 'Estadísticas', tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} /> }} />
      <Tabs.Screen name="auditlog" options={{ title: 'Auditoría', tabBarIcon: ({ color }) => <TabBarIcon name="file-text" color={color} /> }} />
      <Tabs.Screen name="pricehistory" options={{ title: 'Historial Precios', tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} /> }} />
      <Tabs.Screen name="usersAdmin" options={{ title: 'Usuarios', tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }} />
      <Tabs.Screen name="ventasDiaAdmin" options={{ title: 'Ventas del Día', tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} /> }} />
    </Tabs>
  );
}
