import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCartStore } from '../store/cart.store';
import { placeOrder } from '../services/orders.service';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/app-navigation';

export default function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const total = items.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      if (placingOrder) return;
      const itemCount = items.reduce((s, i) => s + i.quantity, 0);
      const total = items.reduce((s, i) => s + i.sale_price * i.quantity, 0);
      setPlacingOrder(true);
      const order = await placeOrder();
      navigation.replace('OrderConfirmation', {
        orderId: order.id,
        total,
        itemCount,
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed placing order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cartCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={16} color="#fca5a5" />
              </TouchableOpacity>
            </View>

            <View style={styles.itemFooter}>
              <Text style={styles.itemPrice}>
                Rs. {Number(item.sale_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  onPress={() => decreaseQuantity(item.id)}
                  style={styles.qtyButton}
                  activeOpacity={0.7}
                >
                  <Feather name="minus" size={16} color="#94a3b8" />
                </TouchableOpacity>

                <TextInput
                  style={styles.qtyInput}
                  value={String(item.quantity)}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  onChangeText={(text) => {
                    const n = parseInt(text, 10);
                    if (!isNaN(n)) setQuantity(item.id, n);
                    else if (text === '') setQuantity(item.id, 0);
                  }}
                />

                <TouchableOpacity
                  onPress={() => increaseQuantity(item.id)}
                  style={styles.qtyButton}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-cart" size={64} color="#475569" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>
              Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={placingOrder}
            style={[styles.checkoutButton, placingOrder && styles.checkoutButtonDisabled]}
            activeOpacity={0.8}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.checkoutText}>Place Order</Text>
                <Feather name="check-circle" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  cartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3b82f6',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    minWidth: 36,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3b82f6',
  },
  checkoutButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  checkoutButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});