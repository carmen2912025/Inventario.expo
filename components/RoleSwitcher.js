import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRole } from '../components/RoleContext';

export default function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 12 }}>
      {['administrador', 'trabajador', 'cliente'].map(r => (
        <Button
          key={r}
          title={r.charAt(0).toUpperCase() + r.slice(1)}
          onPress={() => setRole(r)}
          color={role === r ? '#2f95dc' : '#aaa'}
        />
      ))}
    </View>
  );
}
