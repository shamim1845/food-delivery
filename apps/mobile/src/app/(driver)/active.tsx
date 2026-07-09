import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Location from "expo-location";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/auth-context";
import { Order } from "@food-delivery/types";

export default function DriverActiveScreen() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_OFFSET = 88;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  // driver's assigned orders — only PICKED_UP needs GPS + Mark Delivered
  const { data: activeOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["driver-active-orders"],
    queryFn: () =>
      api
        .get<Order[]>("/orders/mine")
        .then((r) => r.data.filter((o) => o.status === "PICKED_UP")),
  });

  const activeOrder = activeOrders[0] ?? null;

  const { mutate: markDelivered, isPending } = useMutation({
    mutationFn: (orderId: string) =>
      api.patch(`/orders/${orderId}/status`, { status: "DELIVERED" }),
    onSuccess: () => {
      stopTracking();
      queryClient.invalidateQueries({ queryKey: ["driver-active-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
    },
    onError: (e: any) =>
      Alert.alert(
        "Error",
        e?.response?.data?.message ?? "Something went wrong",
      ),
  });

  // request permission, connect socket, start GPS watch
  async function startTracking(orderId: string) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      Alert.alert(
        "Permission denied",
        "Location permission is required for delivery tracking.",
      );
      return;
    }

    socketRef.current = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/orders`, {
      transports: ["websocket"],
    });

    locationWatchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 10,
      },
      (location) => {
        socketRef.current?.emit("driver:location", {
          driverId: user?.id,
          orderId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      },
    );
  }

  function stopTracking() {
    locationWatchRef.current?.remove();
    socketRef.current?.disconnect();
    locationWatchRef.current = null;
    socketRef.current = null;
  }

  useEffect(() => {
    if (activeOrder) {
      void startTracking(activeOrder.id);
    }
    return () => stopTracking();
  }, [activeOrder?.id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No active delivery</Text>
          <Text style={styles.emptySubText}>
            Accept an order on Home, or tap a PICKED_UP order in History
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View
        style={
          (styles.content, { paddingBottom: insets.bottom + TAB_BAR_OFFSET })
        }
      >
        <Text style={styles.title}>Active Delivery</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>
            #{activeOrder.id.slice(0, 8).toUpperCase()}
          </Text>

          <Text style={styles.label}>Deliver to</Text>
          <Text style={styles.value}>{activeOrder.deliveryAddress}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.status]}>
            {activeOrder.status}
          </Text>
        </View>

        <View style={styles.trackingBadge}>
          <Text style={styles.trackingText}>📡 Broadcasting location...</Text>
        </View>

        <Pressable
          style={styles.deliveredButton}
          onPress={() => {
            Alert.alert("Confirm delivery?", "Mark this order as delivered?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delivered",
                onPress: () => markDelivered(activeOrder.id),
              },
            ]);
          }}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deliveredButtonText}>Mark as Delivered</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  status: {
    color: "#FF6B35",
  },
  trackingBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  trackingText: {
    fontSize: 14,
    color: "#16A34A",
    fontWeight: "500",
  },
  deliveredButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  deliveredButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
