import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function AuditLogScreen() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/audit-log`)
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Auditoría</Text>
      <FlatList
        data={logs}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.entity} #{item.entity_id}</Text>
            <Text style={styles.info}>Acción: {item.action}</Text>
            <Text style={styles.info}>Por usuario: {item.changed_by}</Text>
            <Text style={styles.info}>Cambios: {item.changes}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#be185d' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#be185d' },
  info: { fontSize: 14, color: '#334155' },
});
