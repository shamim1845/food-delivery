import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/axios";
import { useCartStore } from "@/store/cart-store";
import {
  MenuCategory,
  MenuItem,
  Restaurant as RestaurantType,
} from "@food-delivery/types";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, restaurantId, clearCart, items } = useCartStore();

  const { data: restaurant, isLoading: loadingRestaurant } =
    useQuery<RestaurantType>({
      queryKey: ["restaurant", id],
      queryFn: () =>
        api.get<RestaurantType>(`/restaurants/${id}`).then((r) => r.data),
      enabled: !!id,
    });

  const { data: categories = [] } = useQuery<MenuCategory[]>({
    queryKey: ["categories", id],
    queryFn: () =>
      api.get<MenuCategory[]>(`/menu/categories/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu-items", id],
    queryFn: () => api.get<MenuItem[]>(`/menu/items/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  function handleAddItem(item: MenuItem) {
    if (!restaurant) return;

    // different restaurant in cart — confirm before clearing
    if (restaurantId && restaurantId !== item.restaurantId) {
      Alert.alert(
        "Start new cart?",
        `Your cart has items from ${useCartStore.getState().restaurantName}. Clear cart and add from ${restaurant.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear & Add",
            style: "destructive",
            onPress: () => {
              clearCart();
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                restaurantId: item.restaurantId,
                restaurantName: restaurant.name,
              });
            },
          },
        ],
      );
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      restaurantId: item.restaurantId,
      restaurantName: restaurant.name,
    });
  }

  function getItemQuantity(itemId: string) {
    return items.find((i) => i.id === itemId)?.quantity ?? 0;
  }

  if (loadingRestaurant) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {restaurant.imageUrl ? (
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.heroImage}
          />
        ) : (
          <View style={styles.heroPlaceholder} />
        )}

        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisineType}</Text>
          {restaurant.description ? (
            <Text style={styles.description}>{restaurant.description}</Text>
          ) : null}
          <View style={styles.meta}>
            <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
            <Text style={styles.address}>{restaurant.address}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuHeading}>Menu</Text>

          {categories.map((category) => {
            const categoryItems = menuItems.filter(
              (i) => i.categoryId === category.id && i.isAvailable,
            );

            if (categoryItems.length === 0) return null;

            return (
              <View key={category.id} style={styles.categoryBlock}>
                <Text style={styles.categoryName}>{category.name}</Text>

                {categoryItems.map((item) => {
                  const qty = getItemQuantity(item.id);
                  return (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.description ? (
                          <Text
                            style={styles.itemDescription}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        ) : null}
                        <Text style={styles.itemPrice}>${item.price}</Text>
                      </View>

                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.itemImage}
                        />
                      ) : null}

                      {qty > 0 ? (
                        <View style={styles.qtyControls}>
                          <Pressable
                            style={styles.qtyButton}
                            onPress={() =>
                              useCartStore.getState().decrementItem(item.id)
                            }
                          >
                            <Text style={styles.qtyButtonText}>−</Text>
                          </Pressable>
                          <Text style={styles.qtyCount}>{qty}</Text>
                          <Pressable
                            style={styles.qtyButton}
                            onPress={() => handleAddItem(item)}
                          >
                            <Text style={styles.qtyButtonText}>+</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          style={styles.addButton}
                          onPress={() => handleAddItem(item)}
                        >
                          <Text style={styles.addButtonText}>Add</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  heroPlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#f0f0f0",
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rating: {
    fontSize: 14,
    color: "#333",
  },
  address: {
    fontSize: 13,
    color: "#888",
    flex: 1,
  },
  menuSection: {
    padding: 16,
  },
  menuHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  categoryBlock: {
    marginBottom: 24,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    color: "#FF6B35",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6B35",
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
});
