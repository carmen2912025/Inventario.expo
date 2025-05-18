import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Proveedores',
          tabBarIcon: ({ color }) => <TabBarIcon name="truck" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />, 
        }}
      />
    </Tabs>
  );
}
