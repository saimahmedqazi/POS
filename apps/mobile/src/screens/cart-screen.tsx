import {
  View,
  Text,
  FlatList,
} from 'react-native';

import {
  useState,
} from 'react';

import {
  useCartStore,
} from '../store/cart.store';

import {
  placeOrder,
} from '../services/orders.service';

export default function CartScreen() {
  const items =
    useCartStore(
      (state) =>
        state.items,
    );

  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity,
    );

  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity,
    );

  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem,
    );

  const total =
    items.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.sale_price *
          item.quantity,
      0,
    );

  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(false);

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
      <Text
        style={{
          fontSize: 28,

          fontWeight:
            '700',

          marginBottom: 20,
        }}
      >
        Cart
      </Text>

      <FlatList
        data={items}
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


            <View
              style={{
                flexDirection:
                  'row',

                alignItems:
                  'center',

                marginTop: 14,

                gap: 12,
              }}
            >
              <Text
                onPress={() =>
                  decreaseQuantity(
                    item.id,
                  )
                }
                style={{
                  backgroundColor:
                    '#eee',

                  width: 36,

                  height: 36,

                  textAlign:
                    'center',

                  textAlignVertical:
                    'center',

                  borderRadius: 10,

                  fontSize: 20,

                  fontWeight:
                    '700',
                }}
              >
                -
              </Text>

              <Text
                style={{
                  fontSize: 16,

                  fontWeight:
                    '600',
                }}
              >
                {item.quantity}
              </Text>

              <Text
                onPress={() =>
                  increaseQuantity(
                    item.id,
                  )
                }
                style={{
                  backgroundColor:
                    '#eee',

                  width: 36,

                  height: 36,

                  textAlign:
                    'center',

                  textAlignVertical:
                    'center',

                  borderRadius: 10,

                  fontSize: 20,

                  fontWeight:
                    '700',
                }}
              >
                +
              </Text>

              <Text
                onPress={() =>
                  removeItem(
                    item.id,
                  )
                }
                style={{
                  marginLeft:
                    'auto',

                  color: 'red',

                  fontWeight:
                    '600',
                }}
              >
                Remove
              </Text>
            </View>

            
          </View>
        )}
        ListEmptyComponent={
          <View
            style={{
              paddingTop: 100,

              alignItems:
                'center',
            }}
          >
            <Text>
              Cart is empty
            </Text>
          </View>
        }
      />

      {items.length >
  0 && (
  <View
    style={{
      borderTopWidth: 1,

      borderColor:
        '#eee',

      paddingTop: 16,

      paddingBottom: 30,
    }}
  >
    <Text
      style={{
        fontSize: 20,

        fontWeight:
          '700',

        marginBottom: 16,
      }}
    >
      Estimated Total:
      {' '}
      Rs.{' '}
      {total.toFixed(
        2,
      )}
    </Text>

    <Text
      onPress={async () => {
        try {
          if (
            placingOrder
          ) {
            return;
          }

          setPlacingOrder(
            true,
          );

          await placeOrder();

          alert(
            'Order placed successfully',
          );
        } catch (
          error: any
        ) {
          console.error(
            error,
          );

          alert(
            error.message ||
              'Failed placing order',
          );
        } finally {
          setPlacingOrder(
            false,
          );
        }
      }}
      style={{
        backgroundColor:
          '#111',

        color: '#fff',

        textAlign:
          'center',

        paddingVertical: 16,

        borderRadius: 14,

        fontWeight:
          '700',

        fontSize: 16,

        opacity:
          placingOrder
            ? 0.7
            : 1,
      }}
    >
      {placingOrder
        ? 'Placing Order...'
        : 'Place Order'}
    </Text>
  </View>
)}
    </View>
  );
}