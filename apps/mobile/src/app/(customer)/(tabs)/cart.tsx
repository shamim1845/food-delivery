import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/axios";
import { useCartStore } from "@/store/cart-store";

export default function CartScreen() {
  const {
    items,
    restaurantId,
    restaurantName,
    incrementItem,
    decrementItem,
    clearCart,
  } = useCartStore();
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0,
  );

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () =>
      api.post("/orders", {
        restaurantId,
        deliveryAddress,
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: String(i.quantity),
        })),
      }),
    onSuccess: (res) => {
      clearCart();
      router.push(`/(customer)/order/${res.data.id}`);
    },
    onError: (e: any) => {
      Alert.alert(
        "Error",
        e?.response?.data?.message ?? "Could not place order",
      );
    },
  });

  function handlePlaceOrder() {
    if (items.length === 0) return Alert.alert("Your cart is empty");
    if (!deliveryAddress.trim())
      return Alert.alert("Please enter your delivery address");
    placeOrder();
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push("/(customer)/(tabs)/(home)")}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Your Cart</Text>
      <Text style={styles.restaurantName}>{restaurantName}</Text>

      <FlatList
        data={items}
        extraData={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : null}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => decrementItem(item.id)}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </Pressable>
              <Text style={styles.qtyCount}>{item.quantity}</Text>
              <Pressable
                style={styles.qtyButton}
                onPress={() => incrementItem(item.id)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Delivery address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your delivery address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({itemCount} items)</Text>
              <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
            </View>

            <Pressable
              style={styles.orderButton}
              onPress={() => {
                handlePlaceOrder();
              }}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderButtonText}>Place Order</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                Alert.alert("Clear cart?", "Remove all items?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: clearCart },
                ]);
              }}
            >
              <Text style={styles.clearText}>Clear cart</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  restaurantName: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    gap: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "700",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  qtyCount: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  footer: {
    paddingTop: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6B35",
  },
  orderButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  clearText: {
    textAlign: "center",
    color: "#EF4444",
    fontSize: 14,
    paddingBottom: 8,
  },
});
