import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchProducts,
} from '../services/products.service';

import {
  useCartStore,
} from '../store/cart.store';

import type {
  Product,
} from '../types/product';

import {
  useNavigation,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import type {
  RootStackParamList,
} from '../navigation/app-navigation';

import {
  signOutRetailer,
} from '../services/auth.service';

export default function ProductsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data);
      setFilteredProducts(data);
      setLoadedFromCache(false);
      // Cache products locally
      await AsyncStorage.setItem('cached_products', JSON.stringify(data));
    } catch (error) {
      console.error('Failed loading products, attempting to load from cache:', error);
      try {
        const cached = await AsyncStorage.getItem('cached_products');
        if (cached) {
          const cachedData = JSON.parse(cached);
          setProducts(cachedData);
          setFilteredProducts(cachedData);
          setLoadedFromCache(true);
        } else {
          setLoadedFromCache(false);
        }
      } catch (cacheError) {
        console.error('Failed reading products cache:', cacheError);
        setLoadedFromCache(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshProducts() {
    setRefreshing(true);
    await loadProducts();
  }

  async function handleLogout() {
    try {
      await signOutRetailer();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredProducts(products);
      return;
    }

    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query) ||
          product.barcode?.toLowerCase().includes(query),
      ),
    );
  }, [search, products]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Welcome back</Text>
          <Text style={styles.headerTitle}>Supplier Store</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.7}
          >
            <Feather name="clipboard" size={20} color="#f8fafc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
          >
            <Feather name="shopping-bag" size={20} color="#f8fafc" />
            {totalCartQuantity > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {totalCartQuantity > 99 ? '99+' : totalCartQuantity}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, styles.logoutButton]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Mode Banner */}
      {loadedFromCache && (
        <View style={styles.offlineBanner}>
          <Feather name="wifi-off" size={14} color="#9a3412" style={{ marginRight: 6 }} />
          <Text style={styles.offlineBannerText}>
            Offline Mode: Showing cached products.
          </Text>
        </View>
      )}

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search products by name, SKU..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshProducts}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.cardHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              </View>
              <Text style={styles.productPrice}>
                Rs. {Number(item.sale_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => addItem(item)}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="package" size={48} color="#475569" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.2)',
  },
  offlineBannerText: {
    fontSize: 12,
    color: '#fdba74',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f8fafc',
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: 22,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b82f6',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
});