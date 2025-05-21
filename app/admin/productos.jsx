import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      // ignore for now
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.categoria_id === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setFeedback('Nombre y precio son obligatorios');
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newProduct.name,
          precio: parseFloat(newProduct.price),
          categoria_id: newProduct.category,
          descripcion: newProduct.description
        })
      });
      if (!res.ok) throw new Error('No se pudo agregar el producto');
      setModalVisible(false);
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setFeedback('Producto agregado correctamente');
      fetchProducts();
    } catch (error) {
      setFeedback('No se pudo agregar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
              if (!res.ok) throw new Error('No se pudo eliminar el producto');
              setFeedback('Producto eliminado correctamente');
              fetchProducts();
            } catch (error) {
              setFeedback('No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.nombre}</Text>
      <Text style={styles.productPrice}>${item.precio}</Text>
      <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Picker
        selectedValue={selectedCategory}
        onValueChange={handleCategoryChange}
        style={styles.picker}
      >
        <Picker.Item label="Todas las categorías" value="all" />
        {/* Agrega más categorías si es necesario */}
      </Picker>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
      />
      {!!feedback && (
        <Text style={{ color: feedback.includes('correctamente') ? 'green' : 'red', marginBottom: 8 }}>{feedback}</Text>
      )}
      <PaperButton mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton}>
        Agregar Producto
      </PaperButton>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={newProduct.name}
              onChangeText={text => setNewProduct({ ...newProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={newProduct.price}
              onChangeText={text => setNewProduct({ ...newProduct, price: text })}
              keyboardType="numeric"
            />
            <Picker
              selectedValue={newProduct.category}
              onValueChange={value => setNewProduct({ ...newProduct, category: value })}
              style={styles.input}
            >
              <Picker.Item label="Selecciona categoría" value="" />
              {categories.map(cat => (
                <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={newProduct.description}
              onChangeText={text => setNewProduct({ ...newProduct, description: text })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <PaperButton mode="contained" onPress={handleAddProduct} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </PaperButton>
              <PaperButton mode="outlined" onPress={() => setModalVisible(false)} disabled={submitting}>
                Cancelar
              </PaperButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  productList: {
    paddingBottom: 16,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: 'green',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: 320,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2563eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
});
