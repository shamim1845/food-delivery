import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/lib/axios';
import { Order } from '@food-delivery/types';

type DriverOrder = Order & {
  restaurant: { id: string; name: string };
};

const STATUS_COLORS: Record<string, string> = {
  READY: '#06B6D4',
  PICKED_UP: '#FF6B35',
  DELIVERED: '#22C55E',
  CANCELLED: '#EF4444',
};

function DeliveryCard({
  order,
  onPress,
}: {
  order: DriverOrder;
  onPress?: () => void;
}) {
  const statusColor = STATUS_COLORS[order.status] ?? '#999';
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isActive = order.status === 'PICKED_UP';

  return (
    <Pressable
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
      disabled={!isActive}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.restaurant}>{order.restaurant.name}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status}
          </Text>
        </View>
      </View>
      <Text style={styles.address} numberOfLines={1}>
        📍 {order.deliveryAddress}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.total}>
          ${Number(order.totalAmount).toFixed(2)}
        </Text>
      </View>
      {isActive && (
        <Text style={styles.tapHint}>Tap to open active delivery →</Text>
      )}
    </Pressable>
  );
}

export default function DriverHistoryScreen() {
  const { data: orders = [], isLoading } = useQuery<DriverOrder[]>({
    queryKey: ['driver-orders'],
    queryFn: () => api.get<DriverOrder[]>('/orders/mine').then((r) => r.data),
  });

  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const inProgressCount = orders.filter((o) =>
    ['READY', 'PICKED_UP'].includes(o.status),
  ).length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>My Deliveries</Text>

      {orders.length > 0 && (
        <View style={styles.summaryRow}>
          {inProgressCount > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValueLight}>{inProgressCount}</Text>
              <Text style={styles.summaryLabelLight}>in progress</Text>
            </View>
          )}
          {deliveredCount > 0 && (
            <View style={[styles.summaryCard, styles.summaryCardMuted]}>
              <Text style={styles.summaryValue}>{deliveredCount}</Text>
              <Text style={styles.summaryLabel}>completed</Text>
            </View>
          )}
        </View>
      )}

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No deliveries yet</Text>
          <Text style={styles.emptySubText}>
            Assigned orders will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DeliveryCard
              order={item}
              onPress={
                item.status === 'PICKED_UP'
                  ? () => router.push('/(driver)/active')
                  : undefined
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryCardMuted: {
    backgroundColor: '#f0f0f0',
  },
  summaryValueLight: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  summaryLabelLight: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurant: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  address: {
    fontSize: 13,
    color: '#777',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  tapHint: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
