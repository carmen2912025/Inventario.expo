import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, Alert, View, Text, Modal, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ListContainer from '../../components/ListContainer';
import ModalForm from '../../components/ModalForm';
import Snackbar from '../../components/Snackbar';
import * as ImagePicker from 'expo-image-picker';

export default function ProductsScreen() {
  console.log('Render ProductsScreen (admin)');
  // Reemplaza los estados y funciones de productos y categorías por los hooks
  const {
    products,
    loading,
    error,
    reload,
    addProduct,
    editProduct,
    removeProduct,
  } = useProducts();
  const {
    categories,
    loading: loadingCategories,
    error: errorCategories,
    reload: reloadCategories,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories();

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
  const [productStocks, setProductStocks] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [showNewCategoryFields, setShowNewCategoryFields] = useState(false);
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '' });
  // Paginación para FlatList
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info', undo: null });
  const [lastDeleted, setLastDeleted] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const LOW_STOCK_THRESHOLD = 5;
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [image, setImage] = useState(null); // URI or base64

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery, priceMin, priceMax, onlyLowStock]);

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
    if (priceMin) {
      filtered = filtered.filter((product) => Number(product.precio) >= Number(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter((product) => Number(product.precio) <= Number(priceMax));
    }
    if (onlyLowStock) {
      filtered = filtered.filter((product) => {
        const stock = productStocks[product.id] !== undefined ? productStocks[product.id] : product.cantidad;
        return stock <= LOW_STOCK_THRESHOLD;
      });
    }
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleCategoryPickerChange = (value) => {
    if (value === '__new__') {
      setShowNewCategoryFields(true);
      setNewProduct({ ...newProduct, category: '' });
    } else {
      setShowNewCategoryFields(false);
      setNewProduct({ ...newProduct, category: value });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleAddProduct = async () => {
    const errors = [];
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      errors.push('La cantidad es obligatoria y debe ser mayor a 0');
    }
    if (!newProduct.name || newProduct.name.trim() === '') errors.push('El nombre es obligatorio');
    if (!newProduct.price) errors.push('El precio es obligatorio');
    else if (isNaN(newProduct.price) || Number(newProduct.price) <= 0) errors.push('El precio debe ser un número mayor a 0');
    if (!showNewCategoryFields && (!newProduct.category || newProduct.category === '' || newProduct.category === 'all')) errors.push('Selecciona una categoría');
    if (showNewCategoryFields && (!newCategory.nombre || newCategory.nombre.trim() === '')) errors.push('El nombre de la nueva categoría es obligatorio');
    if (errors.length > 0) {
      setFeedback(errors.join('\n'));
      Alert.alert('Error', errors.join('\n'));
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      let categoriaId = newProduct.category;
      if (showNewCategoryFields) {
        // Crear la nueva categoría primero
        const cat = await addCategory({ nombre: newCategory.nombre, descripcion: newCategory.descripcion });
        categoriaId = cat.id;
        await reloadCategories();
      }
      // Crear producto nuevo con barcode y sku automáticos
      const timestamp = Date.now();
      const random = Math.floor(Math.random()*10000);
      const barcode = `BC-${timestamp}-${random}`;
      const sku = `SKU-${timestamp}-${random}`;
      const body = {
        nombre: newProduct.name || '',
        precio: parseFloat(newProduct.price),
        categoria_id: categoriaId,
        descripcion: newProduct.description,
        cantidad: Number(quantity),
        barcode,
        sku,
        imagen: image ? image.base64 : '',
      };
      await addProduct(body);
      setModalVisible(false);
      setFeedback('Producto agregado correctamente');
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setQuantity('');
      setShowNewCategoryFields(false);
      setNewCategory({ nombre: '', descripcion: '' });
      setImage(null);
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
        imagen: image ? image.base64 : original.imagen || '',
        is_active: original.is_active !== undefined ? original.is_active : 1
      };
      await editProduct(editingProductId, body);
      setModalVisible(false);
      setFeedback('Producto actualizado correctamente');
      setPage(1);
      // await fetchProducts(true);
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
    const product = products.find(p => p.id === id);
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              await removeProduct(id);
              setLastDeleted(product);
              setSnackbar({ visible: true, message: 'Producto eliminado', type: 'success', undo: () => undoDelete() });
              // reload();
            } catch (error) {
              setSnackbar({ visible: true, message: 'No se pudo eliminar el producto', type: 'error' });
            }
          }
        }
      ]
    );
  };

  const undoDelete = async () => {
    if (!lastDeleted) return;
    try {
      await addProduct({
        nombre: lastDeleted.nombre,
        precio: lastDeleted.precio,
        categoria_id: lastDeleted.categoria_id,
        descripcion: lastDeleted.descripcion,
        cantidad: lastDeleted.cantidad,
        barcode: lastDeleted.barcode,
        sku: lastDeleted.sku
      });
      setSnackbar({ visible: true, message: 'Producto restaurado', type: 'success' });
      setLastDeleted(null);
      reload();
    } catch {
      setSnackbar({ visible: true, message: 'No se pudo restaurar el producto', type: 'error' });
    }
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
    setImage(product.imagen ? { uri: product.imagen.startsWith('data:') ? product.imagen : `data:image/jpeg;base64,${product.imagen}` } : null);
    setModalVisible(true);
  };

  const isLowStock = (product) => {
    const stock = productStocks[product.id] !== undefined ? productStocks[product.id] : product.cantidad;
    const precio = Number(product.precio);
    return (stock < 20 && precio < 3000) || (precio >= 3000 && stock < 5);
  };
  const lowStockCount = filteredProducts.filter(isLowStock).length;

  const renderProductItem = ({ item }) => {
    const stock = productStocks[item.id] !== undefined ? productStocks[item.id] : item.cantidad;
    const lowStock = isLowStock(item);
    return (
      <View style={[styles.productItem, lowStock && { borderColor: '#dc2626', borderWidth: 2 }]}> 
        {item.imagen ? (
          <Image source={{ uri: item.imagen.startsWith('data:') ? item.imagen : `data:image/jpeg;base64,${item.imagen}` }} style={{ width: 60, height: 45, borderRadius: 6, marginBottom: 8 }} />
        ) : null}
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.productPrice}>${item.precio}</Text>
        <Text style={{ color: lowStock ? '#dc2626' : '#e17055', fontWeight: 'bold', marginTop: 4 }}>
          Stock: {stock} {lowStock && <Text style={{ color: '#dc2626' }}>⚠️ Bajo</Text>}
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
  };

  const handleLoadMore = () => {
    if (hasMore && !submitting) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE * page));
      setHasMore(filteredProducts.length > PAGE_SIZE * page);
      setLoadingMore(false);
    }, 400); // Simula carga, reemplazar por fetch real si backend soporta paginación
  }, [page, filteredProducts]);

  useEffect(() => {
    // Reiniciar paginación al cambiar filtros o búsqueda
    setPage(1);
    setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE));
    setHasMore(filteredProducts.length > PAGE_SIZE);
  }, [filteredProducts]);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowFilters(f => !f)} style={{ marginLeft: 8, padding: 8, backgroundColor: '#e0e7ef', borderRadius: 8 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>{showFilters ? 'Ocultar filtros' : 'Filtros'}</Text>
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#0e7490' }}>Filtros avanzados</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={handleCategoryChange}
              style={[styles.input, { flex: 1 }]}
            >
              <Picker.Item label="Todas las categorías" value="all" />
              {categories.map(cat => (
                <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
              ))}
            </Picker>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Precio mínimo"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Precio máximo"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => setOnlyLowStock(v => !v)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#2563eb', backgroundColor: onlyLowStock ? '#2563eb' : '#fff', marginRight: 6 }} />
              <Text style={{ color: '#2563eb' }}>Solo stock bajo (≤ {LOW_STOCK_THRESHOLD})</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {lowStockCount > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 16 }}>
            ⚠️ {lowStockCount} producto(s) con stock bajo (stock &lt; 20 y precio &lt; 3000, o stock &lt; 5 y precio ≥ 3000)
          </Text>
        </View>
      )}
      <ListContainer
        data={displayedProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        loading={loading}
        error={error}
        emptyText="Sin productos"
        style={styles.productList}
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
      <ModalForm
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditMode(false); setEditingProductId(null); }}
        title={editMode ? 'Editar Producto' : 'Nuevo Producto'}
        actions={[
          editMode ? (
            <PaperButton mode="contained" onPress={handleSaveEdit} disabled={submitting} key="save">
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </PaperButton>
          ) : (
            <PaperButton mode="contained" onPress={handleAddProduct} disabled={submitting} key="add">
              {submitting ? 'Guardando...' : 'Guardar'}
            </PaperButton>
          )
        ]}
      >
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
          selectedValue={showNewCategoryFields ? '__new__' : newProduct.category}
          onValueChange={handleCategoryPickerChange}
          style={styles.input}
          testID="picker-categoria"
          enabled={true}
        >
          <Picker.Item label="Selecciona categoría" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
          ))}
          <Picker.Item label="Crear nueva categoría..." value="__new__" />
        </Picker>
        {showNewCategoryFields && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la nueva categoría"
              value={newCategory.nombre}
              onChangeText={text => setNewCategory({ ...newCategory, nombre: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción de la nueva categoría (opcional)"
              value={newCategory.descripcion}
              onChangeText={text => setNewCategory({ ...newCategory, descripcion: text })}
            />
          </>
        )}
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
        <TouchableOpacity onPress={pickImage} style={{ marginBottom: 12, alignItems: 'center' }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>{image ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{ uri: image.uri || `data:image/jpeg;base64,${image.base64}` }}
            style={{ width: 120, height: 90, borderRadius: 8, alignSelf: 'center', marginBottom: 12 }}
            resizeMode="cover"
          />
        )}
      </ModalForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb', // Usar Colors.light.background si se importa
  },
  searchInput: {
    height: 40,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontFamily: 'SpaceMono',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  productList: {
    paddingBottom: 16,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    fontFamily: 'SpaceMono',
  },
  productPrice: {
    fontSize: 14,
    color: '#0e7490',
    fontFamily: 'SpaceMono',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  input: {
    height: 40,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontFamily: 'SpaceMono',
  },
  feedback: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
});
