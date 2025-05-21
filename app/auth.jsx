import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useRole } from '../components/RoleContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const { role, setRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role === 'administrador') router.replace('/admin');
    else if (role === 'trabajador') router.replace('/trabajador');
    else if (role === 'cliente') router.replace('/cliente');
  }, [role]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#2563eb' }}>Selecciona tu rol</Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Button title="Administrador" onPress={() => setRole('administrador')} color="#2f95dc" />
        <Button title="Trabajador" onPress={() => setRole('trabajador')} color="#00b894" />
        <Button title="Cliente" onPress={() => setRole('cliente')} color="#e17055" />
      </View>
    </View>
  );
}
