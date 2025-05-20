import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TrabajadorTabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen name="indexTrabajador" options={{ title: 'Productos', tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} /> }} />
      <Tabs.Screen name="salesTrabajador" options={{ title: 'Ventas', tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} /> }} />
      <Tabs.Screen name="stockTrabajador" options={{ title: 'Stock', tabBarIcon: ({ color }) => <TabBarIcon name="database" color={color} /> }} />
      <Tabs.Screen name="statisticsTrabajador" options={{ title: 'Estadísticas', tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} /> }} />
    </Tabs>
  );
}
