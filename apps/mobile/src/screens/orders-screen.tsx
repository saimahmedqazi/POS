import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { getMyOrders } from '../services/orders.service';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  async function loadOrders() {
    try {
      const data = await getMyOrders();
      console.log('ORDERS FETCHED:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Failed loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusConfig = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'DELIVERED' || s === 'PAID' || s === 'FULFILLED') {
      return { bg: 'rgba(22, 163, 74, 0.1)', text: '#4ade80', icon: 'check-circle' as const };
    }
    if (s === 'CANCELLED' || s === 'REJECTED' || s === 'FAILED') {
      return { bg: 'rgba(220, 38, 38, 0.1)', text: '#f87171', icon: 'x-circle' as const };
    }
    return { bg: 'rgba(217, 119, 6, 0.1)', text: '#fbbf24', icon: 'clock' as const }; // PENDING, PROCESSING
  };

  const handleWhatsAppShare = (order: any) => {
    const itemsText = order.items && order.items.length > 0
      ? order.items.map((i: any) => `- ${i.product_name} (${i.requested_quantity}x @ Rs. ${Number(i.unit_price).toFixed(2)})`).join('\n')
      : 'No item details';

    const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const message = `Hello! I would like to inquire about the status of my wholesale Order #${order.id.slice(0, 8)}.\n\n` +
      `*Order Details:*\n` +
      `- Date: ${dateStr}\n` +
      `- Status: ${order.status}\n` +
      `- Total: Rs. ${Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n` +
      `*Items Ordered:*\n` +
      `${itemsText}\n\n` +
      `Please let me know the update. Thank you!`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Linking.openURL(webUrl);
      });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadOrders();
          }}
          colors={['#3b82f6']}
          tintColor="#3b82f6"
        />
      }
      ListHeaderComponent={
        <Text style={styles.headerTitle}>Order History ({orders.length})</Text>
      }
      renderItem={({ item }) => {
        const isExpanded = !!expandedOrders[item.id];
        const statusConfig = getStatusConfig(item.status);
        const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <View style={styles.orderCard}>
            {/* Card Header (Tap to toggle) */}
            <TouchableOpacity
              onPress={() => toggleExpand(item.id)}
              style={styles.cardTapArea}
              activeOpacity={0.7}
            >
              <View style={styles.cardMainRow}>
                <View>
                  <Text style={styles.orderIdText}>Order #{item.id.slice(0, 8)}</Text>
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Feather name={statusConfig.icon} size={12} color={statusConfig.text} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: statusConfig.text }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.cardSubRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  Rs. {Number(item.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Expand/Collapse Indicator */}
              <View style={styles.expandRow}>
                <Text style={styles.expandText}>
                  {isExpanded ? 'Hide Items' : `View Items (${item.items?.length || 0})`}
                </Text>
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#64748b" />
              </View>
            </TouchableOpacity>

            {/* Collapsible Details */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.itemsTitle}>Items Summary</Text>
                
                {item.items && item.items.length > 0 ? (
                  item.items.map((orderItem: any, idx: number) => (
                    <View key={orderItem.id || idx} style={styles.itemRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.itemNameText}>{orderItem.product_name}</Text>
                        <Text style={styles.itemQtyText}>
                          {orderItem.requested_quantity} x Rs. {Number(orderItem.unit_price).toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.itemSubtotalText}>
                        Rs. {Number(orderItem.subtotal).toFixed(2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>No items found for this order.</Text>
                )}

                {/* WhatsApp button */}
                <TouchableOpacity
                  onPress={() => handleWhatsAppShare(item)}
                  style={styles.whatsappButton}
                  activeOpacity={0.8}
                >
                  <Feather name="message-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.whatsappButtonText}>Inquire on WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Feather name="folder" size={48} color="#475569" />
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
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
  listContent: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#020617',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  cardTapArea: {
    padding: 16,
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3b82f6',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  expandedContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  itemNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  itemQtyText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  itemSubtotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
  noItemsText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25d366',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
});