import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';

export default function ProductsScreen() {
  const [productos, setProductos] = useState([]);
  const [sku, setSku] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    fetchCategorias();
    fetchMarcas();
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
  async function fetchMarcas() {
    try {
      const res = await fetch(`${API_BASE_URL}/brands`);
      if (!res.ok) throw new Error('Error al obtener marcas');
      const rows = await res.json();
      setMarcas(rows);
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
    if (!sku.trim() || !nombre.trim() || !precio.trim() || !categoriaId || !marcaId) {
      Alert.alert('Error', 'SKU, nombre, precio, categoría y marca son requeridos');
      return;
    }
    if (isNaN(parseFloat(precio)) || (cantidad && isNaN(parseInt(cantidad)))) {
      Alert.alert('Error', 'Precio y cantidad deben ser números válidos');
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
          categoria_id: categoriaId,
          marca_id: marcaId,
        })
      });
      if (!res.ok) throw new Error('No se pudo agregar el producto');
      setSku(''); setNombre(''); setDescripcion(''); setPrecio(''); setCantidad(''); setCategoriaId(''); setMarcaId('');
      fetchProductos();
    } catch (e) { Alert.alert('Error', 'No se pudo agregar el producto'); }
  }

  async function deleteProducto(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el producto');
      fetchProductos();
    } catch (e) { Alert.alert('Error', 'No se pudo eliminar el producto'); }
  }

  function handleDeleteProducto(id) {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteProducto(id) },
      ]
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombre} (SKU: {item.sku})</Text>
        <Text style={styles.itemDetail}>{item.descripcion}</Text>
        <Text style={styles.itemDetail}>Categoría: {item.categoria_nombre || '-'} | Marca: {item.marca_nombre || '-'}</Text>
        <Text style={styles.itemDetail}>Precio: ${item.precio} | Stock: {item.cantidad}</Text>
      </View>
      <PaperButton mode="text" onPress={() => handleDeleteProducto(item.id)} labelStyle={styles.deleteBtn} compact>
        Eliminar
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
      <Text style={styles.title}>Productos</Text>
      <Text style={styles.subtitle}>Administra tu inventario de productos aquí.</Text>
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
        <Picker
          selectedValue={marcaId}
          style={styles.input}
          onValueChange={setMarcaId}
        >
          <Picker.Item label="Selecciona marca" value="" />
          {marcas.map(m => <Picker.Item key={m.id} label={m.nombre} value={m.id} />)}
        </Picker>
        <PaperButton mode="contained" onPress={addProducto} style={{ marginTop: 8 }}>
          Agregar producto
        </PaperButton>
      </View>
      <FlatList
        data={productos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin productos</Text>}
      />
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
});
