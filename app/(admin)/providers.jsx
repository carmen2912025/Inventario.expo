import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function ProvidersScreen() {
  const [providers, setProviders] = useState([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [editingId, setEditingId] = useState(null); // Nuevo estado para edición

  // --- Búsqueda y filtrado ---
  const [search, setSearch] = useState('');
  const filteredProviders = providers.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.direccion.toLowerCase().includes(search.toLowerCase()) ||
    p.telefono.toLowerCase().includes(search.toLowerCase()) ||
    p.correo.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchProviders();
  }, []);

  function fetchProviders() {
    fetch(`${API_BASE_URL}/providers`)
      .then(res => res.json())
      .then(setProviders);
  }

  function handleAddProvider() {
    // Implementar lógica de agregar proveedor
    Alert.alert('Agregar proveedor', 'Funcionalidad pendiente');
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Proveedores</Text>
      <TextInput style={styles.input} placeholder="Buscar proveedor..." value={search} onChangeText={setSearch} />
      <FlatList
        data={filteredProviders}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.nombre}</Text>
            <Text style={styles.text}>{item.direccion}</Text>
            <Text style={styles.text}>{item.telefono} - {item.correo}</Text>
          </View>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin proveedores</Text>}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddProvider}>
        <Text style={styles.addButtonText}>Agregar proveedor</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' },
  input: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 8, marginBottom: 8 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  text: { fontSize: 16, color: '#334155' },
  addButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, marginTop: 16, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
