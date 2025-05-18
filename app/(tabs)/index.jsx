import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button, Alert, TouchableOpacity, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { initDB, getDb } from '../../components/db';

let realDb = null;

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
    (async () => {
      await initDB();
      const db = await getDb();
      if (!db) {
        setDbAvailable(false);
        return;
      }
      realDb = db;
      fetchCategorias();
      fetchMarcas();
      fetchProductos();
    })();
  }, []);

  async function fetchCategorias() {
    if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql('SELECT * FROM categorias', [], (_, result) => setCategorias(result.rows._array));
      });
    }
  }
  async function fetchMarcas() {
    if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql('SELECT * FROM marcas', [], (_, result) => setMarcas(result.rows._array));
      });
    }
  }
  async function fetchProductos() {
    if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql(
          `SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre FROM productos p
           LEFT JOIN categorias c ON p.categoria_id = c.id
           LEFT JOIN marcas m ON p.marca_id = m.id
           WHERE 1=1`,
          [],
          (_, result) => setProductos(result.rows._array),
          (_, error) => { console.log(error); return false; }
        );
      });
    }
  }

  async function addProducto() {
    if (!sku.trim() || !nombre.trim() || !precio.trim() || !categoriaId || !marcaId) {
      Alert.alert('SKU, nombre, precio, categoría y marca son requeridos');
      return;
    }
    if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO productos (sku, nombre, descripcion, precio, cantidad, categoria_id, marca_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [sku, nombre, descripcion, parseFloat(precio), parseInt(cantidad) || 0, categoriaId, marcaId],
          () => {
            setSku(''); setNombre(''); setDescripcion(''); setPrecio(''); setCantidad(''); setCategoriaId(''); setMarcaId('');
            fetchProductos();
          },
          (_, error) => { console.log(error); return false; }
        );
      });
    }
  }

  async function deleteProducto(id) {
    if (realDb && realDb.runAsync) {
      await realDb.runAsync('UPDATE productos SET is_active = 0 WHERE id = ?', [id]);
      fetchProductos();
    } else if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql(
          'UPDATE productos SET is_active = 0 WHERE id = ?',
          [id],
          fetchProductos,
          (_, error) => { console.log(error); return false; }
        );
      });
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombre} (SKU: {item.sku})</Text>
        <Text style={styles.itemDetail}>{item.descripcion}</Text>
        <Text style={styles.itemDetail}>Categoría: {item.categoria_nombre || '-'} | Marca: {item.marca_nombre || '-'}</Text>
        <Text style={styles.itemDetail}>Precio: ${item.precio} | Stock: {item.cantidad}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteProducto(item.id)}>
        <Text style={styles.deleteBtn}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  if (!dbAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Productos</Text>
        <Text style={{ color: 'red', marginTop: 20 }}>La base de datos local no está disponible en esta plataforma.</Text>
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
        <Button title="Agregar producto" onPress={addProducto} />
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
