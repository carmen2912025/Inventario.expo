import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { query } from '../../components/mysqlClient';

export default function ProvidersScreen() {
  const [proveedores, setProveedores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    fetchProveedores();
  }, []);

  async function fetchProveedores() {
    try {
      const rows = await query('SELECT * FROM proveedores WHERE is_active = 1');
      setProveedores(rows);
    } catch (e) { setDbAvailable(false); }
  }

  async function addProveedor() {
    if (!nombre.trim() || !direccion.trim() || !telefono.trim() || !correo.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    try {
      await query('INSERT INTO proveedores (nombre, direccion, telefono, correo, is_active) VALUES (?, ?, ?, ?, 1)', [nombre, direccion, telefono, correo]);
      setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
      fetchProveedores();
    } catch (e) { Alert.alert('Error', 'No se pudo agregar el proveedor'); }
  }

  async function deleteProveedor(id) {
    try {
      await query('UPDATE proveedores SET is_active = 0 WHERE id = ?', [id]);
      fetchProveedores();
    } catch (e) { Alert.alert('Error', 'No se pudo eliminar el proveedor'); }
  }

  function handleDeleteProveedor(id) {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este proveedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteProveedor(id) },
      ]
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombre}</Text>
        <Text style={styles.itemDetail}>{item.direccion}</Text>
        <Text style={styles.itemDetail}>{item.telefono} {item.correo}</Text>
      </View>
      <PaperButton mode="text" onPress={() => handleDeleteProveedor(item.id)} labelStyle={styles.deleteBtn} compact>
        Eliminar
      </PaperButton>
    </View>
  );

  if (!dbAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Proveedores</Text>
        <Text style={{ color: 'red', marginTop: 20 }}>No se pudo conectar a la base de datos MySQL.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proveedores</Text>
      <Text style={styles.subtitle}>Gestiona tus proveedores y contactos.</Text>
      <View style={styles.form}>
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
        />
        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={correo}
          onChangeText={setCorreo}
        />
        <PaperButton mode="contained" onPress={addProveedor} style={{ marginTop: 8 }}>
          Agregar proveedor
        </PaperButton>
      </View>
      <FlatList
        data={proveedores}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin proveedores</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f0f7fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b894',
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
    color: '#00b894',
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
