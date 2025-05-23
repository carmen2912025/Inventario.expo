import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';

export default function ProductsScreen() {
  console.log('Render ProductsScreen (admin)');
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
  const [productStocks, setProductStocks] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [quantity, setQuantity] = useState('');
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
    console.log('fetchProducts (admin) llamado', { reset, page });
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=${reset ? 1 : page}&limit=${PAGE_SIZE}`);
      const data = await response.json();
      console.log('fetchProducts (admin) respuesta:', data);
      if (!Array.isArray(data)) {
        setProducts([]);
        setFeedback('Error al cargar productos');
        return;
      }
      if (reset) {
        setProducts(data);
        await fetchStockForProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
        await fetchStockForProducts([...products, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('fetchProducts (admin) error:', error);
      setFeedback('Error al cargar productos');
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    console.log('fetchCategories (admin) llamado');
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      console.log('fetchCategories (admin) respuesta:', data);
      setCategories(data);
    } catch (error) {
      console.error('fetchCategories (admin) error:', error);
      // ignore for now
    }
  };

  const fetchStockForProducts = async (productsList) => {
    const stocks = {};
    await Promise.all(productsList.map(async (prod) => {
      try {
        const res = await fetch(`${API_BASE_URL}/stock/${prod.id}`);
        const data = await res.json();
        // Sumar el stock de todas las ubicaciones (si hay varias)
        let totalStock = 0;
        if (Array.isArray(data)) {
          totalStock = data.reduce((sum, s) => sum + (s.cantidad || 0), 0);
        }
        stocks[prod.id] = totalStock;
      } catch {
        stocks[prod.id] = prod.cantidad || 0; // fallback
      }
    }));
    setProductStocks(stocks);
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
    const errors = [];
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      errors.push('La cantidad es obligatoria y debe ser mayor a 0');
    }
    if (!newProduct.name || newProduct.name.trim() === '') errors.push('El nombre es obligatorio');
    if (!newProduct.price) errors.push('El precio es obligatorio');
    else if (isNaN(newProduct.price) || Number(newProduct.price) <= 0) errors.push('El precio debe ser un número mayor a 0');
    if (!newProduct.category || newProduct.category === '' || newProduct.category === 'all') errors.push('Selecciona una categoría');
    if (errors.length > 0) {
      setFeedback(errors.join('\n'));
      Alert.alert('Error', errors.join('\n'));
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      // Crear producto nuevo con barcode y sku automáticos
      const timestamp = Date.now();
      const random = Math.floor(Math.random()*10000);
      const barcode = `BC-${timestamp}-${random}`;
      const sku = `SKU-${timestamp}-${random}`;
      const body = {
        nombre: newProduct.name || '',
        precio: parseFloat(newProduct.price),
        categoria_id: newProduct.category,
        descripcion: newProduct.description,
        cantidad: Number(quantity),
        barcode,
        sku
      };
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        let msg = 'No se pudo agregar el producto';
        try { msg = (await res.json()).message || msg; } catch {}
        throw new Error(msg);
      }
      setModalVisible(false);
      setFeedback('Producto agregado correctamente');
      fetchProducts();
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setQuantity('');
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo agregar el producto');
      setFeedback('No se pudo agregar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    setSubmitting(true);
    setFeedback('');
    try {
      // Buscar el producto original para obtener sku y barcode
      const original = products.find(p => p.id === editingProductId);
      if (!original) throw new Error('No se encontró el producto original');
      const body = {
        sku: original.sku || `SKU-${editingProductId}`,
        barcode: original.barcode || `BC-${editingProductId}`,
        nombre: newProduct.name,
        precio: parseFloat(newProduct.price),
        categoria_id: newProduct.category,
        descripcion: newProduct.description,
        cantidad: Number(quantity),
        marca_id: original.marca_id || null,
        fecha_ultima_actualizacion_precio: original.fecha_ultima_actualizacion_precio || null,
        fecha_ultima_repo: original.fecha_ultima_repo || null,
        imagen: original.imagen || '',
        is_active: original.is_active !== undefined ? original.is_active : 1
      };
      const res = await fetch(`${API_BASE_URL}/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        let msg = 'No se pudo actualizar el producto';
        try { msg = (await res.json()).message || msg; } catch {}
        throw new Error(msg);
      }
      setModalVisible(false);
      setFeedback('Producto actualizado correctamente');
      setPage(1);
      await fetchProducts(true);
      // Recargar stocks reales tras editar
      await fetchStockForProducts(products);
      setTimeout(() => setFeedback(''), 4500);
    } catch (error) {
      setFeedback('No se pudo actualizar el producto');
      Alert.alert('Error', error.message || 'No se pudo actualizar el producto');
    } finally {
      setSubmitting(false);
      setEditMode(false);
      setEditingProductId(null);
    }
  };

  const handleDeleteProduct = async (id) => {
    console.log('handleDeleteProduct (admin) llamado', { id });
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
              if (!res.ok) {
                let msg = 'No se pudo eliminar el producto';
                try { msg = (await res.json()).message || msg; } catch {}
                throw new Error(msg);
              }
              setFeedback('Producto eliminado correctamente');
              fetchProducts();
            } catch (error) {
              console.error('handleDeleteProduct (admin) error:', error);
              setFeedback('No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (product) => {
    setEditMode(true);
    setEditingProductId(product.id);
    setNewProduct({
      name: product.nombre,
      price: product.precio.toString(),
      category: product.categoria_id,
      description: product.descripcion || ''
    });
    setQuantity((productStocks[product.id] !== undefined ? productStocks[product.id] : product.cantidad)?.toString() || '');
    setModalVisible(true);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.nombre}</Text>
      <Text style={styles.productPrice}>${item.precio}</Text>
      <Text style={{ color: '#e17055', fontWeight: 'bold', marginTop: 4 }}>
        Stock: {productStocks[item.id] !== undefined ? productStocks[item.id] : item.cantidad}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginTop: 8 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} style={{ marginTop: 8 }}>
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Eliminar</Text>
        </TouchableOpacity>
      </View>
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
        onRequestClose={() => { setModalVisible(false); setEditMode(false); setEditingProductId(null); }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? 'Editar Producto' : 'Nuevo Producto'}</Text>
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
              editable={true}
            />
            <Picker
              selectedValue={newProduct.category}
              onValueChange={value => setNewProduct({ ...newProduct, category: value })}
              style={styles.input}
              testID="picker-categoria"
              enabled={true}
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
              editable={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              {editMode ? (
                <PaperButton mode="contained" onPress={handleSaveEdit} disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </PaperButton>
              ) : (
                <PaperButton mode="contained" onPress={handleAddProduct} disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </PaperButton>
              )}
              <PaperButton mode="outlined" onPress={() => { setModalVisible(false); setEditMode(false); setEditingProductId(null); }} disabled={submitting}>
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
