import {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  getMyOrders,
} from '../services/orders.service';

export default function OrdersScreen() {
  const [
    orders,
    setOrders,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  async function loadOrders() {
    try {
      const data =
        await getMyOrders();

      console.log(
        'ORDERS:',
        data,
      );

      setOrders(
        data || [],
      );
    } catch (
      error
    ) {
      console.error(
        'Failed loading orders:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

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
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(
        item,
      ) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={() => {
            setRefreshing(
              true,
            );

            loadOrders();
          }}
        />
      }
      contentContainerStyle={{
        padding: 16,

        flexGrow: 1,
      }}
      ListHeaderComponent={
        <Text
          style={{
            fontSize: 24,

            fontWeight:
              '700',

            marginBottom: 16,
          }}
        >
          My Orders (
          {orders.length}
          )
        </Text>
      }
      renderItem={({
        item,
      }) => (
        <View
          style={{
            backgroundColor:
              '#fff',

            padding: 16,

            borderRadius: 12,

            marginBottom: 12,

            borderWidth: 1,

            borderColor:
              '#eee',
          }}
        >
          <Text
            style={{
              fontWeight:
                '700',

              fontSize: 16,
            }}
          >
            Order #
            {item.id.slice(
              0,
              8,
            )}
          </Text>

          <Text
            style={{
              marginTop: 6,
            }}
          >
            Status:{' '}
            {item.status}
          </Text>

          <Text>
            Total: Rs.{' '}
            {Number(
              item.total_amount,
            ).toFixed(
              2,
            )}
          </Text>

          <Text
            style={{
              color:
                '#666',

              marginTop: 4,
            }}
          >
            {new Date(
              item.created_at,
            ).toLocaleString()}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,

            justifyContent:
              'center',

            alignItems:
              'center',

            paddingTop: 80,
          }}
        >
          <Text
            style={{
              fontSize: 16,

              color:
                '#666',
            }}
          >
            No orders found
          </Text>
        </View>
      }
    />
  );
}