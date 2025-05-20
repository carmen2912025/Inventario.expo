import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRole } from './RoleContext';

export default function RoleSelectorScreen() {
  const { setRole } = useRole();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
      <Text style={{ fontSize: 22, marginBottom: 20, fontWeight: 'bold', color: '#2563eb' }}>Selecciona tu rol</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button title="Administrador" onPress={() => setRole('administrador')} color="#2f95dc" />
        <Button title="Trabajador" onPress={() => setRole('trabajador')} color="#00b894" />
        <Button title="Cliente" onPress={() => setRole('cliente')} color="#e17055" />
      </View>
    </View>
  );
}
