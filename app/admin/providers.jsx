import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';
import { useProviders } from '../../hooks/useProviders';
import ModalForm from '../../components/ModalForm';
import { PaperButton } from 'react-native-paper';
import Snackbar from '../../components/Snackbar';

export default function ProvidersScreen() {
  const {
    providers,
    loading,
    error,
    reload,
    addProvider,
    editProvider,
    removeProvider,
  } = useProviders();
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [editingId, setEditingId] = useState(null); // Nuevo estado para edición
  const [modalVisible, setModalVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info', undo: null });
  const [lastDeleted, setLastDeleted] = useState(null);

  // --- Búsqueda y filtrado ---
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCorreo, setFilterCorreo] = useState('');
  const [filterDireccion, setFilterDireccion] = useState('');
  const filteredProviders = providers.filter(p => {
    const matchNombre = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCorreo = filterCorreo ? p.correo.toLowerCase().includes(filterCorreo.toLowerCase()) : true;
    const matchDireccion = filterDireccion ? p.direccion.toLowerCase().includes(filterDireccion.toLowerCase()) : true;
    return matchNombre && matchCorreo && matchDireccion;
  });

  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [displayedProviders, setDisplayedProviders] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setDisplayedProviders(filteredProviders.slice(0, PAGE_SIZE));
  }, [filteredProviders]);

  useEffect(() => {
    if (page === 1) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedProviders(filteredProviders.slice(0, PAGE_SIZE * page));
      setLoadingMore(false);
    }, 400);
  }, [page, filteredProviders]);

  const handleLoadMore = () => {
    if (displayedProviders.length < filteredProviders.length && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  function handleAddProvider() {
    setModalVisible(true);
    setEditMode(false);
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
      await addProvider(body);
      setFeedback('Proveedor agregado correctamente');
      setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
      setModalVisible(false);
      reload();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el proveedor');
      setFeedback('No se pudo agregar el proveedor');
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteProvider = async (id) => {
    const provider = providers.find(p => p.id === id);
    Alert.alert(
      'Eliminar proveedor',
      '¿Estás seguro de que deseas eliminar este proveedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              await removeProvider(id);
              setLastDeleted(provider);
              setSnackbar({ visible: true, message: 'Proveedor eliminado', type: 'success', undo: () => undoDelete() });
              reload();
            } catch (error) {
              setSnackbar({ visible: true, message: 'No se pudo eliminar el proveedor', type: 'error' });
            }
          }
        }
      ]
    );
  };

  const undoDelete = async () => {
    if (!lastDeleted) return;
    try {
      await addProvider({
        nombre: lastDeleted.nombre,
        direccion: lastDeleted.direccion,
        telefono: lastDeleted.telefono,
        correo: lastDeleted.correo
      });
      setSnackbar({ visible: true, message: 'Proveedor restaurado', type: 'success' });
      setLastDeleted(null);
      reload();
    } catch {
      setSnackbar({ visible: true, message: 'No se pudo restaurar el proveedor', type: 'error' });
    }
  };

  const handleEditProvider = (provider) => {
    setNombre(provider.nombre);
    setDireccion(provider.direccion);
    setTelefono(provider.telefono);
    setCorreo(provider.correo);
    setEditingId(provider.id);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
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
      await editProvider(editingId, body);
      setFeedback('Proveedor editado correctamente');
      setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
      setModalVisible(false);
      reload();
    } catch (error) {
      Alert.alert('Error', 'No se pudo editar el proveedor');
      setFeedback('No se pudo editar el proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Proveedores</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]} 
          placeholder="Buscar por nombre..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity onPress={() => setShowFilters(f => !f)} style={{ marginLeft: 8, padding: 8, backgroundColor: '#e0e7ef', borderRadius: 8 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>{showFilters ? 'Ocultar filtros' : 'Filtros'}</Text>
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#0e7490' }}>Filtros avanzados</Text>
          <TextInput
            style={styles.input}
            placeholder="Filtrar por correo..."
            value={filterCorreo}
            onChangeText={setFilterCorreo}
          />
          <TextInput
            style={styles.input}
            placeholder="Filtrar por dirección..."
            value={filterDireccion}
            onChangeText={setFilterDireccion}
          />
        </View>
      )}
      {loading && <Text style={{ color: '#888', marginVertical: 8 }}>Cargando proveedores...</Text>}
      {error && <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text>}
      <FlatList
        data={displayedProviders}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>{item.nombre}</Text>
            <Text style={styles.text}>{item.direccion}</Text>
            <Text style={styles.text}>{item.telefono} - {item.correo}</Text>
            <TouchableOpacity onPress={() => handleDeleteProvider(item.id)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditProvider(item)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
              <Text style={{ color: 'blue', fontWeight: 'bold' }}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin proveedores</Text>}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      {loadingMore && (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} />
      )}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={() => setSnackbar({ ...snackbar, visible: false })}
      />
      {snackbar.visible && snackbar.undo && (
        <TouchableOpacity onPress={snackbar.undo} style={{ position: 'absolute', bottom: 80, right: 32, backgroundColor: '#2563eb', borderRadius: 20, padding: 10 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Deshacer</Text>
        </TouchableOpacity>
      )}
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
      <ModalForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        actions={[
          <PaperButton mode="contained" onPress={editMode ? handleSaveEdit : submitProvider} disabled={submitting} key="save">
            {submitting ? 'Guardando...' : editMode ? 'Guardar Cambios' : 'Guardar'}
          </PaperButton>
        ]}
      >
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
      </ModalForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490', fontFamily: 'SpaceMono' },
  input: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff', fontFamily: 'SpaceMono' },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 2, borderColor: '#e5e7eb', borderWidth: 1 },
  text: { fontSize: 16, color: '#334155', fontFamily: 'SpaceMono' },
  addButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, marginTop: 16, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, fontFamily: 'SpaceMono' },
  feedback: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'center' },
});
