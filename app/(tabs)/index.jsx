import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function ProductsScreen() {
  const [productos, setProductos] = useState([]);
  const [sku, setSku] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [dbAvailable, setDbAvailable] = useState(true);
  // --- Búsqueda y filtrado ---
  const [search, setSearch] = useState('');
  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes(search.toLowerCase())
  );
  // --- Validación avanzada ---
  function isValidPrice(val) {
    return /^\d+(\.\d{1,2})?$/.test(val);
  }
  function isValidCantidad(val) {
    return /^\d+$/.test(val) || val === '';
  }
  // --- Deshacer eliminación reciente ---
  const [lastDeleted, setLastDeleted] = useState(null);
  async function deleteProducto(id) {
    const prod = productos.find(p => p.id === id);
    setLastDeleted(prod);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el producto');
      fetchProductos();
    } catch (e) { Alert.alert('Error', 'No se pudo eliminar el producto'); }
  }
  async function undoDelete() {
    if (!lastDeleted) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: lastDeleted.sku,
          nombre: lastDeleted.nombre,
          descripcion: lastDeleted.descripcion,
          precio: lastDeleted.precio,
          cantidad: lastDeleted.cantidad,
          categoria_id: lastDeleted.categoria_id
        })
      });
      if (!res.ok) throw new Error('No se pudo restaurar el producto');
      setLastDeleted(null); fetchProductos();
    } catch (e) { Alert.alert('Error', 'No se pudo restaurar el producto'); }
  }
  // --- Snackbar/Toast visual ---
  const [snackbar, setSnackbar] = useState('');
  function showSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 2500);
  }

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchCategorias() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Error al obtener categorías');
      const rows = await res.json();
      setCategorias(rows);
    } catch (e) { setDbAvailable(false); }
  }
  async function fetchProductos() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Error al obtener productos');
      const rows = await res.json();
      setProductos(rows);
    } catch (e) { setDbAvailable(false); }
  }

  async function addProducto() {
    if (!sku.trim() || !nombre.trim() || !precio.trim() || !categoriaId) {
      Alert.alert('Error', 'SKU, nombre, precio y categoría son requeridos');
      return;
    }
    if (!isValidPrice(precio)) {
      Alert.alert('Error', 'Precio inválido');
      return;
    }
    if (!isValidCantidad(cantidad)) {
      Alert.alert('Error', 'Cantidad inválida');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          nombre,
          descripcion,
          precio: parseFloat(precio),
          cantidad: parseInt(cantidad) || 0,
          categoria_id: categoriaId
        })
      });
      if (!res.ok) throw new Error('No se pudo agregar el producto');
      setSku(''); setNombre(''); setDescripcion(''); setPrecio(''); setCantidad(''); setCategoriaId('');
      fetchProductos();
      showSnackbar('Producto agregado');
    } catch (e) { Alert.alert('Error', 'No se pudo agregar el producto'); }
  }
  // --- Exportar a CSV ---
  function exportToCSV() {
    const header = 'SKU,Nombre,Descripción,Precio,Cantidad,Categoría\n';
    const rows = productos.map(p =>
      [p.sku, p.nombre, p.descripcion, p.precio, p.cantidad, p.categoria_nombre].map(x => `"${x}"`).join(',')
    ).join('\n');
    const csv = header + rows;
    Alert.alert('CSV generado', csv.length > 200 ? csv.slice(0,200)+'...':csv);
  }
  // --- Exportar a PDF (solo alerta demo) ---
  function exportToPDF() {
    Alert.alert('PDF', 'Funcionalidad de exportar a PDF pendiente de integración.');
  }

  // Permite edición de productos
  async function editProducto(id, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('No se pudo editar el producto');
      fetchProductos();
      showSnackbar('Producto editado');
    } catch (e) { Alert.alert('Error', 'No se pudo editar el producto'); }
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombre} (SKU: {item.sku})</Text>
        <Text style={styles.itemDetail}>{item.descripcion}</Text>
        <Text style={styles.itemDetail}>Categoría: {item.categoria_nombre || '-'}</Text>
        <Text style={styles.itemDetail}>Precio: ${item.precio} | Stock: {item.cantidad}</Text>
      </View>
      <PaperButton mode="text" onPress={() => handleDeleteProducto(item.id)} labelStyle={styles.deleteBtn} compact>
        Eliminar
      </PaperButton>
      <PaperButton mode="text" onPress={() => editProducto(item.id, item)} labelStyle={styles.editBtn} compact>
        Editar
      </PaperButton>
    </View>
  );

  if (!dbAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Productos</Text>
        <Text style={{ color: 'red', marginTop: 20 }}>No se pudo conectar a la base de datos MySQL.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Productos</Text>
      <Text style={styles.subtitle}>Administra tu inventario de productos aquí.</Text>
      {/* Búsqueda */}
      <TextInput style={styles.input} placeholder="Buscar..." value={search} onChangeText={setSearch} />
      {/* Acciones */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <PaperButton mode="contained" style={{ flex: 1, backgroundColor: '#2f95dc' }} onPress={exportToCSV}>Exportar CSV</PaperButton>
        <PaperButton mode="contained" style={{ flex: 1, backgroundColor: '#2563eb' }} onPress={exportToPDF}>Exportar PDF</PaperButton>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="SKU"
          value={sku}
          onChangeText={setSku}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <TextInput
          style={styles.input}
          placeholder="Precio"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />
        <Picker
          selectedValue={categoriaId}
          style={styles.input}
          onValueChange={setCategoriaId}
        >
          <Picker.Item label="Selecciona categoría" value="" />
          {categorias.map(c => <Picker.Item key={c.id} label={c.nombre} value={c.id} />)}
        </Picker>
        <PaperButton mode="contained" onPress={() => { addProducto(); showSnackbar('Producto agregado'); }} style={{ marginTop: 8 }}>
          Agregar producto
        </PaperButton>
      </View>
      <FlatList
        data={filteredProductos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin productos</Text>}
      />
      {/* Deshacer eliminación */}
      {lastDeleted && (
        <PaperButton mode="contained" style={{ backgroundColor: '#f59e42', marginTop: 8 }} onPress={undoDelete}>
          Deshacer eliminación
        </PaperButton>
      )}
      {/* Snackbar visual */}
      {snackbar ? (
        <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#2f95dc', padding: 16, borderRadius: 8, alignItems: 'center', zIndex: 10 }}>
          <Text style={{ color: '#fff' }}>{snackbar}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f95dc',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2f95dc',
  },
  itemDetail: {
    color: '#555',
    fontSize: 13,
  },
  deleteBtn: {
    color: '#e17055',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  editBtn: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
