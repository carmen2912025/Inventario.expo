import { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [nombre, setNombre] = useState('');
  const [ci, setCi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [rolId, setRolId] = useState('');
  const [editingId, setEditingId] = useState(null); // Nuevo estado para edición

  // --- Búsqueda y filtrado ---
  const [search, setSearch] = useState('');
  const filteredUsers = users.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.ci.toLowerCase().includes(search.toLowerCase()) ||
    u.telefono.toLowerCase().includes(search.toLowerCase()) ||
    u.correo.toLowerCase().includes(search.toLowerCase()) ||
    (u.rol_id + '').includes(search)
  );

  useEffect(() => {
    fetchUsers();     
  }, []);

  function fetchUsers() {
    fetch(`${API_BASE_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setUsers([]);
          Alert.alert('Error', 'No se pudo cargar la lista de usuarios');
          return;
        }
        setUsers(data);
      })
      .catch(() => {
        setUsers([]);
        Alert.alert('Error', 'No se pudo cargar la lista de usuarios');
      });
  }

  // --- Validación avanzada ---
  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  function isValidPhone(phone) {
    return /^\d{7,15}$/.test(phone);
  }

  function addUser() {
    if (!nombre.trim() || !ci.trim() || !telefono.trim() || !correo.trim() || !rolId.trim()) {
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
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, ci, telefono, correo, rol_id: rolId })
    })
      .then(res => res.json())
      .then(() => {
        setNombre(''); setCi(''); setTelefono(''); setCorreo(''); setRolId('');
        fetchUsers();
      })
      .catch(() => Alert.alert('Error', 'No se pudo agregar el usuario'));
  }

  function updateUser() {
    if (!nombre.trim() || !ci.trim() || !telefono.trim() || !correo.trim() || !rolId.trim()) {
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
    fetch(`${API_BASE_URL}/users/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, ci, telefono, correo, rol_id: rolId })
    })
      .then(res => res.json())
      .then(() => {
        setNombre(''); setCi(''); setTelefono(''); setCorreo(''); setRolId(''); setEditingId(null);
        fetchUsers();
      })
      .catch(() => Alert.alert('Error', 'No se pudo actualizar el usuario'));
  }

  function startEditUser(user) {
    setEditingId(user.id);
    setNombre(user.nombre);
    setCi(user.ci);
    setTelefono(user.telefono);
    setCorreo(user.correo);
    setRolId(user.rol_id?.toString() || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setNombre(''); setCi(''); setTelefono(''); setCorreo(''); setRolId('');
  }

  // --- Exportar a CSV ---
  function exportToCSV() {
    const header = 'Nombre,CI,Teléfono,Correo,Rol ID\n';
    const rows = users.map(u =>
      [u.nombre, u.ci, u.telefono, u.correo, u.rol_id].map(x => `"${x}"`).join(',')
    ).join('\n');
    const csv = header + rows;
    // Expo FileSystem o compartir, aquí solo alerta:
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
  function deleteUser(id) {
    const user = users.find(u => u.id === id);
    setLastDeleted(user);
    fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' })
      .then(() => fetchUsers())
      .catch(() => Alert.alert('Error', 'No se pudo eliminar el usuario'));
  }
  function undoDelete() {
    if (!lastDeleted) return;
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: lastDeleted.nombre,
        ci: lastDeleted.ci,
        telefono: lastDeleted.telefono,
        correo: lastDeleted.correo,
        rol_id: lastDeleted.rol_id
      })
    })
      .then(res => res.json())
      .then(() => { setLastDeleted(null); fetchUsers(); })
      .catch(() => Alert.alert('Error', 'No se pudo restaurar el usuario'));
  }

  // --- Snackbar/Toast visual ---
  const [snackbar, setSnackbar] = useState('');
  function showSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 2500);
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Usuarios</Text>
      {/* Búsqueda */}
      <TextInput style={styles.input} placeholder="Buscar..." value={search} onChangeText={setSearch} />
      {/* Acciones */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#0e7490', flex: 1 }]} onPress={exportToCSV}>
          <Text style={styles.addBtnText}>Exportar CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#2563eb', flex: 1 }]} onPress={exportToPDF}>
          <Text style={styles.addBtnText}>Exportar PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#64748b', flex: 1 }]} onPress={showAuditLog}>
          <Text style={styles.addBtnText}>Auditoría</Text>
        </TouchableOpacity>
      </View>
      {/* Formulario */}
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="CI" value={ci} onChangeText={setCi} />
        <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} />
        <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} />
        <TextInput style={styles.input} placeholder="Rol ID" value={rolId} onChangeText={setRolId} keyboardType="numeric" />
        {editingId ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#0e7490' }]} onPress={() => { updateUser(); showSnackbar('Usuario actualizado'); }}>
              <Text style={styles.addBtnText}>Guardar Cambios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#64748b' }]} onPress={cancelEdit}>
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => { addUser(); showSnackbar('Usuario agregado'); }}>
            <Text style={styles.addBtnText}>Agregar Usuario</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Lista */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.info}>CI: {item.ci}</Text>
              <Text style={styles.info}>Tel: {item.telefono}</Text>
              <Text style={styles.info}>Correo: {item.correo}</Text>
              <Text style={styles.info}>Rol ID: {item.rol_id}</Text>
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => startEditUser(item)}>
                <Text style={[styles.deleteBtn, { color: '#0e7490' }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { deleteUser(item.id); showSnackbar('Usuario eliminado'); }}>
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
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490', fontFamily: 'SpaceMono' },
  form: { marginBottom: 20 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e0e7ef', fontFamily: 'SpaceMono' },
  addBtn: { backgroundColor: '#0e7490', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, fontFamily: 'SpaceMono' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, borderColor: '#e5e7eb', borderWidth: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#0e7490', fontFamily: 'SpaceMono' },
  info: { fontSize: 14, color: '#334155', fontFamily: 'SpaceMono' },
  deleteBtn: { color: '#ef4444', fontWeight: 'bold', marginLeft: 16, fontFamily: 'SpaceMono' },
  snackbar: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#0e7490', padding: 16, borderRadius: 8, alignItems: 'center', zIndex: 10 },
});
