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

  // --- Validación avanzada ---
  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  function isValidPhone(phone) {
    return /^\d{7,15}$/.test(phone);
  }

  function addProvider() {
    if (!nombre.trim() || !direccion.trim() || !telefono.trim() || !correo.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (!isValidEmail(correo)) {
      Alert.alert('Error', 'Correo inválido');
      return;
    }
    if (!isValidPhone(telefono)) {
      Alert.alert('Error', 'Teléfono inválido');
      return;
    }
    fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, direccion, telefono, correo })
    })
      .then(res => res.json())
      .then(() => {
        setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
        fetchProviders();
      })
      .catch(() => Alert.alert('Error', 'No se pudo agregar el proveedor'));
  }

  function updateProvider() {
    if (!nombre.trim() || !direccion.trim() || !telefono.trim() || !correo.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (!isValidEmail(correo)) {
      Alert.alert('Error', 'Correo inválido');
      return;
    }
    if (!isValidPhone(telefono)) {
      Alert.alert('Error', 'Teléfono inválido');
      return;
    }
    fetch(`${API_BASE_URL}/providers/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, direccion, telefono, correo })
    })
      .then(res => res.json())
      .then(() => {
        setNombre(''); setDireccion(''); setTelefono(''); setCorreo(''); setEditingId(null);
        fetchProviders();
      })
      .catch(() => Alert.alert('Error', 'No se pudo actualizar el proveedor'));
  }

  function startEditProvider(provider) {
    setEditingId(provider.id);
    setNombre(provider.nombre);
    setDireccion(provider.direccion);
    setTelefono(provider.telefono);
    setCorreo(provider.correo);
  }

  function cancelEdit() {
    setEditingId(null);
    setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
  }

  // --- Exportar a CSV ---
  function exportToCSV() {
    const header = 'Nombre,Dirección,Teléfono,Correo\n';
    const rows = providers.map(p =>
      [p.nombre, p.direccion, p.telefono, p.correo].map(x => `"${x}"`).join(',')
    ).join('\n');
    const csv = header + rows;
    Alert.alert('CSV generado', csv.length > 200 ? csv.slice(0,200)+'...':csv);
  }

  // --- Exportar a PDF (solo alerta demo) ---
  function exportToPDF() {
    Alert.alert('PDF', 'Funcionalidad de exportar a PDF pendiente de integración.');
  }

  // --- Historial de cambios (auditoría, solo demo) ---
  function showAuditLog() {
    Alert.alert('Auditoría', 'Funcionalidad de historial de cambios pendiente de integración.');
  }

  // --- Deshacer eliminación reciente ---
  const [lastDeleted, setLastDeleted] = useState(null);
  function deleteProvider(id) {
    const provider = providers.find(p => p.id === id);
    setLastDeleted(provider);
    fetch(`${API_BASE_URL}/providers/${id}`, { method: 'DELETE' })
      .then(() => fetchProviders())
      .catch(() => Alert.alert('Error', 'No se pudo eliminar el proveedor'));
  }
  function undoDelete() {
    if (!lastDeleted) return;
    fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: lastDeleted.nombre,
        direccion: lastDeleted.direccion,
        telefono: lastDeleted.telefono,
        correo: lastDeleted.correo
      })
    })
      .then(res => res.json())
      .then(() => { setLastDeleted(null); fetchProviders(); })
      .catch(() => Alert.alert('Error', 'No se pudo restaurar el proveedor'));
  }

  // --- Snackbar/Toast visual ---
  const [snackbar, setSnackbar] = useState('');
  function showSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 2500);
  }

  // Permite edición de proveedores
  function editProvider(id, data) {
    fetch(`${API_BASE_URL}/providers/${id}` , {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(() => fetchProviders());
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Proveedores</Text>
      {/* Búsqueda */}
      <TextInput style={styles.input} placeholder="Buscar..." value={search} onChangeText={setSearch} />
      {/* Acciones */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#2563eb', flex: 1 }]} onPress={exportToCSV}>
          <Text style={styles.addBtnText}>Exportar CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#0e7490', flex: 1 }]} onPress={exportToPDF}>
          <Text style={styles.addBtnText}>Exportar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#64748b', flex: 1 }]} onPress={showAuditLog}>
          <Text style={styles.addBtnText}>Auditoría</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 20 }}>
        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Dirección" value={direccion} onChangeText={setDireccion} />
        <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} />
        <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} />
        {editingId ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#2563eb' }]} onPress={() => { updateProvider(); showSnackbar('Proveedor actualizado'); }}>
              <Text style={styles.addBtnText}>Guardar Cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#64748b' }]} onPress={cancelEdit}>
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => { addProvider(); showSnackbar('Proveedor agregado'); }}>
            <Text style={styles.addBtnText}>Agregar Proveedor</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredProviders}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.info}>{item.direccion}</Text>
              <Text style={styles.info}>{item.telefono}</Text>
              <Text style={styles.info}>{item.correo}</Text>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => startEditProvider(item)}>
                <Text style={[styles.deleteBtn, { color: '#2563eb' }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { handleDeleteProvider(item.id); showSnackbar('Proveedor eliminado'); }}>
                <Text style={styles.deleteBtn}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* Deshacer eliminación */}
      {lastDeleted && (
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#f59e42' }]} onPress={undoDelete}>
          <Text style={styles.addBtnText}>Deshacer eliminación</Text>
        </TouchableOpacity>
      )}
      {/* Snackbar visual */}
      {snackbar ? (
        <View style={styles.snackbar}><Text style={{ color: '#fff' }}>{snackbar}</Text></View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1e293b' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  info: { fontSize: 14, color: '#64748b' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e0e7ef' },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  deleteBtn: { color: '#ef4444', fontWeight: 'bold', marginLeft: 16 },
  snackbar: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', zIndex: 10 },
});
