import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text, Platform, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ListContainer from '../../components/ListContainer';
import ModalForm from '../../components/ModalForm';

const PAGE_SIZE = 20;

export default function ProductsScreen() {
  const router = useRouter();
  // Usa hooks para productos y categorías
  const {
    products,
    loading,
    error,
    reload,
  } = useProducts();
  const {
    categories,
    loading: loadingCategories,
    error: errorCategories,
    reload: reloadCategories,
  } = useCategories();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Nueva bandera para loading
  // Almacenar el stock local para manipulación en UI
  const [localStock, setLocalStock] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });
  const [quantity, setQuantity] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '' });
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  useEffect(() => {
    if (products.length > 0) {
      // Inicializar stock local con la cantidad de cada producto
      const stockObj = {};
      products.forEach(p => { stockObj[p.id] = p.cantidad; });
      setLocalStock(stockObj);
    }
  }, [products]);

  useEffect(() => {
    setPage(1);
    setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE));
  }, [filteredProducts]);

  useEffect(() => {
    if (page === 1) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE * page));
      setLoadingMore(false);
    }, 400);
  }, [page, filteredProducts]);

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
        const stock = localStock[product.id] !== undefined ? localStock[product.id] : product.cantidad;
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

  const handleAddToCart = (item) => {
    if (localStock[item.id] <= 0) {
      Alert.alert('Sin stock', 'No hay suficiente stock de este producto.');
      return;
    }
    setCart((prevCart) => {
      const found = prevCart.find((p) => p.id === item.id);
      if (found) {
        if (localStock[item.id] <= found.quantity) {
          Alert.alert('Sin stock', 'No hay suficiente stock de este producto.');
          return prevCart;
        }
        return prevCart.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    setLocalStock((prev) => ({ ...prev, [item.id]: prev[item.id] - 1 }));
    Alert.alert(`${item.nombre} agregado al carrito!`);
  };

  const handleRemoveFromCart = (id) => {
    const item = cart.find((p) => p.id === id);
    if (item) {
      setLocalStock((prev) => ({ ...prev, [id]: prev[id] + item.quantity }));
    }
    setCart((prevCart) => prevCart.filter((p) => p.id !== id));
  };

  const handleChangeQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(1, p.quantity + delta);
          if (delta > 0 && localStock[id] <= 0) {
            Alert.alert('Sin stock', 'No hay suficiente stock de este producto.');
            return p;
          }
          setLocalStock((prev) => ({ ...prev, [id]: prev[id] - delta }));
          return { ...p, quantity: newQty };
        }
        return p;
      });
    });
  };

  const handleClearCart = () => {
    // Restaurar stock local de todos los productos del carrito
    setLocalStock((prev) => {
      const updated = { ...prev };
      cart.forEach(item => {
        updated[item.id] = (updated[item.id] || 0) + item.quantity;
      });
      return updated;
    });
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, p) => sum + (Number(p.precio) * p.quantity), 0);

  const renderProductItem = ({ item }) => (
    <View style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen.startsWith('data:') ? item.imagen : `data:image/jpeg;base64,${item.imagen}` }} style={{ width: 60, height: 45, borderRadius: 6, marginBottom: 8 }} />
      ) : null}
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.price}>${item.precio}</Text>
      <Text style={styles.stock}>Stock: {localStock[item.id] ?? item.cantidad}</Text>
      <PaperButton 
        mode="contained" 
        onPress={() => handleAddToCart(item)}
        style={styles.button}
        disabled={localStock[item.id] <= 0}
      >
        Agregar al carrito
      </PaperButton>
    </View>
  );

  console.log('Render ProductsScreen');

  const finalizarCompra = async () => {
    console.log('Callback de Alert: Finalizar');
    setIsProcessing(true);
    try {
      // Usar endpoint atómico /sales/full
      const detalles = cart.map((p) => ({
        producto_id: p.id,
        cantidad: p.quantity,
        precio_unitario: Number(p.precio)
      }));
      const saleRes = await fetch(`${API_BASE_URL}/sales/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: 1, // ID fijo o puedes pedirlo al usuario
          total: cartTotal,
          detalles
        })
      });
      if (!saleRes.ok) {
        let msg = 'No se pudo registrar la venta';
        try { msg = (await saleRes.json()).error || msg; } catch {}
        throw new Error(msg);
      }
      // 3. Guardar lista de compra en AsyncStorage
      const stored = await AsyncStorage.getItem('shoppingLists');
      const lists = stored ? JSON.parse(stored) : [];
      const newList = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        productos: cart,
        total: cartTotal,
        paid: false,
        cancelled: false
      };
      await AsyncStorage.setItem('shoppingLists', JSON.stringify([...lists, newList]));
      setCart([]);
      setShowCart(false);
      if (globalThis.refreshShoppingLists) globalThis.refreshShoppingLists();
      console.log('Antes de redirección');
      router.replace('/trabajador/salesTrabajador');
      console.log('Después de redirección');
      Alert.alert('¡Compra realizada!', 'La lista de compra fue registrada y el stock actualizado.');
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenModal = (product) => {
    if (product) {
      setNewProduct({
        id: product.id,
        name: product.nombre,
        price: product.precio.toString(),
        category: product.categoria_id,
        description: product.descripcion,
      });
      setEditMode(true);
    } else {
      setNewProduct({
        name: '',
        price: '',
        category: '',
        description: '',
      });
      setEditMode(false);
    }
    setModalVisible(true);
  };

  const handleAddProduct = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newProduct.name,
          precio: parseFloat(newProduct.price),
          categoria_id: newProduct.category,
          descripcion: newProduct.description,
          cantidad: parseInt(quantity),
        }),
      });
      if (!res.ok) {
        let msg = 'Error al agregar producto';
        try { msg = (await res.json()).error || msg; } catch {}
        throw new Error(msg);
      }
      Alert.alert('Éxito', 'Producto agregado correctamente');
      setModalVisible(false);
      reload();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo agregar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${newProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newProduct.name,
          precio: parseFloat(newProduct.price),
          categoria_id: newProduct.category,
          descripcion: newProduct.description,
          cantidad: parseInt(quantity),
        }),
      });
      if (!res.ok) {
        let msg = 'Error al editar producto';
        try { msg = (await res.json()).error || msg; } catch {}
        throw new Error(msg);
      }
      Alert.alert('Éxito', 'Producto editado correctamente');
      setModalVisible(false);
      reload();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo editar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const addCategory = async (categoryData) => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) {
      let msg = 'Error al crear categoría';
      try { msg = (await res.json()).error || msg; } catch {}
      throw new Error(msg);
    }
  };

  const handleLoadMore = () => {
    if (displayedProducts.length < filteredProducts.length && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RoleSwitcher />
      <PaperButton
        mode={showCart ? 'outlined' : 'contained'}
        onPress={() => setShowCart((v) => !v)}
        style={{ marginBottom: 10 }}
      >
        {showCart ? 'Ocultar carrito' : `Ver carrito (${cart.length})`}
      </PaperButton>
      {showCart && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartTitle}>Carrito de compra</Text>
          {cart.length === 0 ? (
            <Text style={{ color: '#888', marginBottom: 8 }}>El carrito está vacío.</Text>
          ) : (
            <>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <Text style={styles.cartItemName}>{item.nombre}</Text>
                    <Text style={styles.cartItemPrice}>${Number(item.precio).toFixed(2)}</Text>
                    <View style={styles.cartQtyRow}>
                      <PaperButton onPress={() => handleChangeQuantity(item.id, -1)} compact>-</PaperButton>
                      <Text style={styles.cartQty}>{item.quantity}</Text>
                      <PaperButton onPress={() => handleChangeQuantity(item.id, 1)} compact>+</PaperButton>
                    </View>
                    <PaperButton onPress={() => handleRemoveFromCart(item.id)} compact color="#e17055">Eliminar</PaperButton>
                  </View>
                )}
              />
              <Text style={styles.cartTotal}>Total: ${cartTotal.toFixed(2)}</Text>
              {console.log('Render Botón Finalizar compra')}
              <PaperButton mode="contained" style={{ marginTop: 8 }} onPress={async () => {
                console.log('Botón Finalizar compra presionado');
                if (cart.length === 0 || isProcessing) return;
                if (Platform.OS === 'web') {
                  await finalizarCompra();
                } else {
                  Alert.alert(
                    'Confirmar compra',
                    `¿Deseas finalizar la compra por $${cartTotal.toFixed(2)}?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Finalizar', style: 'default', onPress: finalizarCompra
                      }
                    ]
                  );
                }
              }} disabled={cart.length === 0 || isProcessing}>
                {isProcessing ? 'Procesando...' : 'Finalizar compra'}
              </PaperButton>
              <PaperButton mode="outlined" onPress={handleClearCart} style={{ marginTop: 8 }}>Vaciar carrito</PaperButton>
            </>
          )}
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={[styles.searchBar, { flex: 1 }]}
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
      <Picker
        selectedValue={selectedCategory}
        onValueChange={handleCategoryChange}
        style={styles.picker}
      >
        <Picker.Item label="Todas las categorías" value="all" />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
        ))}
      </Picker>
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
      <PaperButton
        mode="contained"
        onPress={() => handleOpenModal(null)}
        style={{ marginTop: 10 }}
      >
        Nuevo Producto
      </PaperButton>
      <ModalForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editMode ? 'Editar Producto' : 'Nuevo Producto'}
        actions={[
          <PaperButton mode="contained" onPress={editMode ? handleSaveEdit : handleAddProduct} disabled={submitting} key="save">
            {submitting ? 'Guardando...' : editMode ? 'Guardar Cambios' : 'Guardar'}
          </PaperButton>
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
          selectedValue={newProduct.category}
          onValueChange={value => {
            if (value === '__new__') {
              setShowCategoryModal(true);
            } else {
              setNewProduct({ ...newProduct, category: value });
            }
          }}
          style={styles.input}
          testID="picker-categoria"
          enabled={true}
        >
          <Picker.Item label="Selecciona categoría" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
          ))}
          <Picker.Item label="Nueva categoría..." value="__new__" />
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
      </ModalForm>
      <ModalForm
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Nueva Categoría"
        actions={[
          <PaperButton
            mode="contained"
            onPress={async () => {
              if (!newCategory.nombre.trim()) {
                Alert.alert('Error', 'El nombre es obligatorio');
                return;
              }
              setCategorySubmitting(true);
              try {
                await addCategory({ nombre: newCategory.nombre, descripcion: newCategory.descripcion });
                await reloadCategories();
                // Buscar la nueva categoría por nombre (único)
                const cat = categories.find(c => c.nombre === newCategory.nombre);
                if (cat) setNewProduct(p => ({ ...p, category: cat.id }));
                setShowCategoryModal(false);
                setNewCategory({ nombre: '', descripcion: '' });
              } catch (e) {
                Alert.alert('Error', 'No se pudo crear la categoría');
              } finally {
                setCategorySubmitting(false);
              }
            }}
            disabled={categorySubmitting}
            key="saveCat"
          >
            {categorySubmitting ? 'Guardando...' : 'Guardar'}
          </PaperButton>
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Nombre de la categoría"
          value={newCategory.nombre}
          onChangeText={text => setNewCategory({ ...newCategory, nombre: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={newCategory.descripcion}
          onChangeText={text => setNewCategory({ ...newCategory, descripcion: text })}
        />
      </ModalForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  searchBar: {
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    fontFamily: 'SpaceMono',
  },
  price: {
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
