import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRole } from './RoleContext';

export default function RoleSwitcher({ mode = 'bar', title = 'Selecciona tu rol' }) {
  const { role, setRole } = useRole();
  const roles = [
    { key: 'administrador', label: 'Administrador', color: '#2f95dc' },
    { key: 'trabajador', label: 'Trabajador', color: '#00b894' },
    { key: 'cliente', label: 'Cliente', color: '#e17055' },
  ];
  if (mode === 'screen') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
        <Text style={{ fontSize: 22, marginBottom: 20, fontWeight: 'bold', color: '#2563eb' }}>{title}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {roles.map(r => (
            <Button
              key={r.key}
              title={r.label}
              onPress={() => setRole(r.key)}
              color={r.color}
            />
          ))}
        </View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 12 }}>
      {roles.map(r => (
        <Button
          key={r.key}
          title={r.label}
          onPress={() => setRole(r.key)}
          color={role === r.key ? r.color : '#aaa'}
        />
      ))}
    </View>
  );
}
