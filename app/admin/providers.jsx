import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function ProvidersScreen() {
  const [providers, setProviders] = useState([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [editingId, setEditingId] = useState(null); // Nuevo estado para edición
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/providers`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener proveedores');
        return res.json();
      })
      .then(setProviders)
      .catch(err => {
        setError('Error al obtener proveedores. Verifica tu conexión o la URL de la API.');
      })
      .finally(() => setLoading(false));
  }

  function handleAddProvider() {
    setModalVisible(true);
  }

  function isValidEmail(email) {
    if (!email) return true;
    return /\S+@\S+\.\S+/.test(email);
  }

  async function submitProvider() {
    const errors = [];
    if (!nombre) {
      errors.push('El nombre es obligatorio');
    }
    if (correo && !isValidEmail(correo)) {
      errors.push('Correo inválido');
    }
    if (telefono && isNaN(telefono)) {
      errors.push('El teléfono debe ser numérico');
    }
    if (errors.length > 0) {
      setFeedback(errors.join('\n'));
      Alert.alert('Error', errors.join('\n'));
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      const body = { nombre, direccion, telefono };
      if (correo) body.correo = correo;
      const res = await fetch(`${API_BASE_URL}/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json();
        Alert.alert('Error', err.error || 'No se pudo agregar el proveedor');
        setFeedback(err.error || 'No se pudo agregar el proveedor');
        setSubmitting(false);
        return;
      }
      setFeedback('Proveedor agregado correctamente');
      setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
      setModalVisible(false);
      fetchProviders();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el proveedor');
      setFeedback('No se pudo agregar el proveedor');
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteProvider = async (id) => {
    Alert.alert(
      'Eliminar proveedor',
      '¿Estás seguro de que deseas eliminar este proveedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/providers/${id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('No se pudo eliminar el proveedor');
              setFeedback('Proveedor eliminado correctamente');
              fetchProviders();
            } catch (error) {
              setFeedback('No se pudo eliminar el proveedor');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Proveedores</Text>
      <TextInput style={styles.input} placeholder="Buscar proveedor..." value={search} onChangeText={setSearch} />
      {loading && <Text style={{ color: '#888', marginVertical: 8 }}>Cargando proveedores...</Text>}
      {error && <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text>}
      <FlatList
        data={filteredProviders}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.nombre}</Text>
            <Text style={styles.text}>{item.direccion}</Text>
            <Text style={styles.text}>{item.telefono} - {item.correo}</Text>
            <TouchableOpacity onPress={() => handleDeleteProvider(item.id)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin proveedores</Text>}
      />
      {!!feedback && (
        Array.isArray(feedback.split('\n')) && feedback.includes('\n') ? (
          <View style={{ marginBottom: 8 }}>
            {feedback.split('\n').map((err, idx) => (
              <Text key={idx} style={{ color: 'red' }}>{err}</Text>
            ))}
          </View>
        ) : (
          <Text style={{ color: feedback.includes('correctamente') ? 'green' : 'red', marginBottom: 8 }}>{feedback}</Text>
        )
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddProvider}>
        <Text style={styles.addButtonText}>Agregar proveedor</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, width: 320, elevation: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' }}>Nuevo Proveedor</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Dirección"
              value={direccion}
              onChangeText={setDireccion}
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={[styles.addButton, { flex: 1, marginRight: 8 }]} onPress={submitProvider} disabled={submitting}>
                <Text style={styles.addButtonText}>{submitting ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: '#64748b', flex: 1 }]} onPress={() => setModalVisible(false)} disabled={submitting}>
                <Text style={styles.addButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
