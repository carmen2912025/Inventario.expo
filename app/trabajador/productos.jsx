import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Nueva bandera para loading
  // Almacenar el stock local para manipulación en UI
  const [localStock, setLocalStock] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      if (!Array.isArray(data)) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      setProducts(data);
    } catch (error) {
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setCategories([]);
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
      // 1. Crear la venta y obtener el ID
      const saleRes = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: 1, // ID fijo o puedes pedirlo al usuario
          total: cartTotal
        })
      });
      if (!saleRes.ok) {
        let msg = 'No se pudo registrar la venta';
        try { msg = (await saleRes.json()).message || msg; } catch {}
        throw new Error(msg);
      }
      const saleData = await saleRes.json();
      const ventaId = saleData.id || saleData.insertId || saleData.venta_id;
      if (!ventaId) throw new Error('No se obtuvo el ID de la venta. Respuesta: ' + JSON.stringify(saleData));

      // 2. Registrar los detalles de la venta (uno por producto)
      for (const p of cart) {
        const detallesBody = {
          producto_id: p.id,
          cantidad: p.quantity,
          precio_unitario: Number(p.precio)
        };
        console.log('Enviando detalle de venta:', detallesBody);
        const detailsRes = await fetch(`${API_BASE_URL}/sales/${ventaId}/details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detallesBody)
        });
        if (!detailsRes.ok) {
          let msg = 'No se pudo registrar el detalle de la venta';
          try {
            const errJson = await detailsRes.json();
            msg = errJson.message || JSON.stringify(errJson) || msg;
          } catch {}
          throw new Error(msg);
        }
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
      <TextInput
        style={styles.searchBar}
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
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
        ))}
      </Picker>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    marginBottom: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: 'green',
  },
  // Agregar estilo para mostrar stock
  stock: {
    fontSize: 14,
    color: '#e17055',
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
  },
  cartContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2563eb',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    elevation: 1,
  },
  cartItemName: {
    flex: 2,
    fontSize: 15,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    flex: 1,
    fontSize: 14,
    color: '#888',
  },
  cartQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cartQty: {
    marginHorizontal: 8,
    fontSize: 15,
  },
  cartTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    color: '#2563eb',
    textAlign: 'right',
  },
});
