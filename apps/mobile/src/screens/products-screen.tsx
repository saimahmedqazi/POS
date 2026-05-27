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

export default function ProductsScreen() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    products,
    setProducts,
  ] = useState<
    Product[]
  >([]);

  const [
    filteredProducts,
    setFilteredProducts,
  ] = useState<
    Product[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );
    const navigation =
  useNavigation<any>();

const cartItems =
  useCartStore(
    (state) =>
      state.items,
  );

  async function loadProducts() {
    try {
      setLoading(true);

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
        error,
      );
    } finally {
      setLoading(false);
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
        <ActivityIndicator />

        <Text
          style={{
            marginTop: 12,
          }}
        >
          Loading products...
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

        paddingHorizontal: 16,
      }}
    >
      <View
  style={{
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems:
      'center',

    marginBottom: 20,
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

      paddingHorizontal: 16,

      paddingVertical: 10,

      borderRadius: 12,

      fontWeight:
        '700',
    }}
  >
    Cart (
    {cartItems.length})
  </Text>
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

          borderRadius: 12,

          padding: 14,

          marginBottom: 16,
        }}
      />

      <FlatList
        data={
          filteredProducts
        }
        keyExtractor={(
          item,
        ) => item.id}
        renderItem={({
          item,
        }) => (
          <View
            style={{
              borderWidth: 1,

              borderColor:
                '#eee',

              borderRadius: 16,

              padding: 16,

              marginBottom: 12,
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

            {item.sku ? (
              <Text
                style={{
                  color:
                    '#666',

                  marginTop: 4,
                }}
              >
                SKU:{' '}
                {item.sku}
              </Text>
            ) : null}

            <Text
              style={{
                marginTop: 10,

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

            <View
              style={{
                marginTop: 14,
              }}
            >
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

                  paddingVertical: 12,

                  textAlign:
                    'center',

                  borderRadius: 12,

                  fontWeight:
                    '600',
                }}
              >
                Add To Cart
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View
            style={{
              paddingTop: 80,

              alignItems:
                'center',
            }}
          >
            <Text>
              No products found
            </Text>
          </View>
        }
      />
    </View>
  );
}