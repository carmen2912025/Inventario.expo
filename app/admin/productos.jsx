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
  // Paginación para FlatList
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async (reset = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=${reset ? 1 : page}&limit=${PAGE_SIZE}`);
      const data = await response.json();
      if (!Array.isArray(data)) {
        setProducts([]);
        setFeedback('Error al cargar productos');
        return;
      }
      if (reset) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error(error);
      setFeedback('Error al cargar productos');
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

  const [selectedExistingProduct, setSelectedExistingProduct] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (selectedExistingProduct) {
      const prod = products.find(p => p.id === selectedExistingProduct);
      if (prod) {
        setNewProduct({
          name: prod.nombre,
          price: prod.precio.toString(),
          category: prod.categoria_id,
          description: prod.descripcion || ''
        });
        setQuantity('');
      }
    } else {
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setQuantity('');
    }
  }, [selectedExistingProduct]);

  const handleAddProduct = async () => {
    const errors = [];
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      errors.push('La cantidad es obligatoria y debe ser mayor a 0');
    }
    if (!selectedExistingProduct) {
      if (!newProduct.name) errors.push('El nombre es obligatorio');
      if (!newProduct.price) errors.push('El precio es obligatorio');
      else if (isNaN(newProduct.price) || Number(newProduct.price) <= 0) errors.push('El precio debe ser un número mayor a 0');
      if (!newProduct.category) errors.push('Selecciona una categoría');
    } else {
      if (!newProduct.price) errors.push('El precio es obligatorio');
      else if (isNaN(newProduct.price) || Number(newProduct.price) <= 0) errors.push('El precio debe ser un número mayor a 0');
    }
    if (errors.length > 0) {
      setFeedback(errors.join('\n'));
      Alert.alert('Error', errors.join('\n'));
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      if (selectedExistingProduct) {
        // Actualizar stock y precio (enviar todos los campos requeridos)
        const prod = products.find(p => p.id === selectedExistingProduct || p.id === Number(selectedExistingProduct));
        if (!prod) {
          setFeedback('Producto no encontrado');
          setTimeout(() => setFeedback(''), 4500);
          setSubmitting(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/products/${selectedExistingProduct}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: prod.sku,
            nombre: prod.nombre,
            descripcion: prod.descripcion || '',
            precio: parseFloat(newProduct.price),
            cantidad: Number(quantity),
            categoria_id: prod.categoria_id,
            marca_id: prod.marca_id || null,
            barcode: prod.barcode || '',
            fecha_ultima_actualizacion_precio: prod.fecha_ultima_actualizacion_precio || null,
            fecha_ultima_repo: prod.fecha_ultima_repo || null,
            imagen: prod.imagen || '',
            is_active: prod.is_active !== undefined ? prod.is_active : 1
          })
        });
        if (!res.ok) throw new Error('No se pudo actualizar el producto');
        setModalVisible(false);
        setFeedback('Producto actualizado correctamente');
        setTimeout(() => setFeedback(''), 4500);
        fetchProducts();
      } else {
        // Crear producto nuevo
        const res = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: newProduct.name,
            precio: parseFloat(newProduct.price),
            categoria_id: newProduct.category,
            descripcion: newProduct.description,
            cantidad: Number(quantity)
          })
        });
        if (!res.ok) throw new Error('No se pudo agregar el producto');
        setModalVisible(false);
        setFeedback('Producto agregado correctamente');
        fetchProducts();
      }
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setQuantity('');
      setSelectedExistingProduct('');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo agregar/actualizar el producto');
      setFeedback('No se pudo agregar/actualizar el producto');
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

  const handleLoadMore = () => {
    if (hasMore && !submitting) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) fetchProducts();
  }, [page]);

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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      {!!feedback && (
        <View style={{ marginBottom: 8, alignItems: 'center' }}>
          <Text
            style={{
              color: feedback.includes('correctamente') ? '#16a34a' : '#dc2626',
              backgroundColor: feedback.includes('correctamente') ? '#bbf7d0' : '#fee2e2',
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 16,
              fontWeight: 'bold',
              fontSize: 16,
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            {feedback}
          </Text>
        </View>
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
            {/* Nuevo: Selector de producto existente */}
            <Picker
              selectedValue={selectedExistingProduct}
              onValueChange={value => setSelectedExistingProduct(value)}
              style={styles.input}
              testID="picker-producto-existente"
            >
              <Picker.Item label="Nuevo producto" value="" />
              {products.map(prod => (
                <Picker.Item key={prod.id} label={prod.nombre} value={prod.id} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={newProduct.name}
              onChangeText={text => setNewProduct({ ...newProduct, name: text })}
              editable={!selectedExistingProduct}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={newProduct.price}
              onChangeText={text => setNewProduct({ ...newProduct, price: text })}
              keyboardType="numeric"
              // editable siempre (permitir modificar precio)
            />
            <Picker
              selectedValue={newProduct.category}
              onValueChange={value => setNewProduct({ ...newProduct, category: value })}
              style={styles.input}
              testID="picker-categoria"
              enabled={!selectedExistingProduct}
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
              editable={!selectedExistingProduct}
            />
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            {/* SUGERENCIA: Aquí podrías agregar un campo para modificar solo el stock si es producto existente */}
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
