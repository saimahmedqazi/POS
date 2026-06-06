import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCartStore } from '../store/cart.store';
import { placeOrder } from '../services/orders.service';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const total = items.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      if (placingOrder) return;
      setPlacingOrder(true);
      await placeOrder();
      Alert.alert('Success', 'Order placed successfully');
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
                <Feather name="trash-2" size={16} color="#ef4444" />
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
                  <Feather name="minus" size={16} color="#334155" />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity
                  onPress={() => increaseQuantity(item.id)}
                  style={styles.qtyButton}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={16} color="#334155" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-cart" size={64} color="#cbd5e1" />
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
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  cartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
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
    color: '#1e293b',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
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
    color: '#0f172a',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    minWidth: 20,
    textAlign: 'center',
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
    color: '#94a3b8',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },
  checkoutButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
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