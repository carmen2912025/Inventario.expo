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
          <View style={styles.item}>
            <Text style={styles.text}>{item.descripcion}</Text>
            <Text style={styles.date}>{item.fecha}</Text>
          </View>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin registros</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  text: { fontSize: 16, color: '#334155' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
});
