import {
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
} from 'react-native';

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
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    [],
  );

  const [
    filteredProducts,
    setFilteredProducts,
  ] = useState<Product[]>(
    [],
  );

  const [
    search,
    setSearch,
  ] = useState('');

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  const cartItems =
    useCartStore(
      (state) =>
        state.items,
    );

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  async function loadProducts() {
    try {
      const data =
        await fetchProducts();

      setProducts(
        data,
      );

      setFilteredProducts(
        data,
      );
    } catch (
      error
    ) {
      console.error(
        'Failed loading products:',
        error,
      );
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
    } catch (
      error
    ) {
      console.error(
        'Logout failed:',
        error,
      );
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    if (!query) {
      setFilteredProducts(
        products,
      );
      return;
    }

    setFilteredProducts(
      products.filter(
        (
          product,
        ) =>
          product.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          product.sku
            ?.toLowerCase()
            .includes(
              query,
            ) ||
          product.barcode
            ?.toLowerCase()
            .includes(
              query,
            ),
      ),
    );
  }, [
    search,
    products,
  ]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            'center',
          alignItems:
            'center',
        }}
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={{
            marginTop: 12,
          }}
        >
          Loading
          products...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          '#fff',
        paddingTop: 60,
        paddingHorizontal:
          16,
      }}
    >
      <View
        style={{
          flexDirection:
            'row',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          marginBottom:
            20,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight:
              '700',
          }}
        >
          Products
        </Text>

        <View
          style={{
            flexDirection:
              'row',
            gap: 8,
          }}
        >
          <Text
            onPress={() =>
              navigation.navigate(
                'Orders',
              )
            }
            style={{
              backgroundColor:
                '#2563eb',
              color: '#fff',
              paddingHorizontal:
                14,
              paddingVertical:
                10,
              borderRadius:
                12,
              fontWeight:
                '700',
            }}
          >
            Orders
          </Text>

          <Text
            onPress={() =>
              navigation.navigate(
                'Cart',
              )
            }
            style={{
              backgroundColor:
                '#111',
              color: '#fff',
              paddingHorizontal:
                14,
              paddingVertical:
                10,
              borderRadius:
                12,
              fontWeight:
                '700',
            }}
          >
            Cart (
            {
              cartItems.length
            }
            )
          </Text>

          <Text
            onPress={
              handleLogout
            }
            style={{
              backgroundColor:
                '#dc2626',
              color: '#fff',
              paddingHorizontal:
                14,
              paddingVertical:
                10,
              borderRadius:
                12,
              fontWeight:
                '700',
            }}
          >
            Logout
          </Text>
        </View>
      </View>

      <TextInput
        placeholder="Search products"
        value={search}
        onChangeText={
          setSearch
        }
        style={{
          borderWidth: 1,
          borderColor:
            '#ddd',
          borderRadius:
            12,
          padding: 14,
          marginBottom:
            16,
        }}
      />

      <FlatList
        data={
          filteredProducts
        }
        keyExtractor={(
          item,
        ) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              refreshProducts
            }
          />
        }
        renderItem={({
          item,
        }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor:
                '#eee',
              borderRadius:
                16,
              padding: 16,
              marginBottom:
                12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight:
                  '600',
              }}
            >
              {item.name}
            </Text>

            {!!item.sku && (
              <Text
                style={{
                  color:
                    '#666',
                  marginTop:
                    4,
                }}
              >
                SKU:{' '}
                {
                  item.sku
                }
              </Text>
            )}

            <Text
              style={{
                marginTop:
                  10,
                fontSize: 18,
                fontWeight:
                  '700',
              }}
            >
              Rs.{' '}
              {Number(
                item.sale_price,
              ).toFixed(
                2,
              )}
            </Text>

            <Text
              onPress={() =>
                addItem(
                  item,
                )
              }
              style={{
                backgroundColor:
                  '#111',
                color: '#fff',
                marginTop:
                  14,
                paddingVertical:
                  12,
                textAlign:
                  'center',
                borderRadius:
                  12,
                fontWeight:
                  '600',
              }}
            >
              Add To Cart
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View
            style={{
              paddingTop:
                80,
              alignItems:
                'center',
            }}
          >
            <Text>
              No products
              found
            </Text>
          </View>
        }
      />
    </View>
  );
}