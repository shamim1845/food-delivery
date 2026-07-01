import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { useState } from "react";
import { openSettings } from "expo-linking";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useImageUploader } from "@/lib/uploadthing";
import { MenuCategory, MenuItem, Restaurant } from "@food-delivery/types";

const Menu = () => {
  const queryClient = useQueryClient();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const {
    data: restaurant,
    isPending: restaurantPending,
    isFetching: restaurantFetching,
  } = useQuery<Restaurant | null>({
    queryKey: ["my-restaurant"],
    queryFn: () =>
      api.get<Restaurant | null>("/restaurants/mine").then((r) => r.data),
  });

  const {
    data: categories = [],
    isPending: categoriesPending,
    isFetching: categoriesFetching,
  } = useQuery<MenuCategory[]>({
    queryKey: ["categories", restaurant?.id],
    queryFn: () =>
      api
        .get<MenuCategory[]>(`/menu/categories/${restaurant?.id}`)
        .then((r) => r.data),
    enabled: !!restaurant?.id,
  });

  const restaurantLoading = restaurantPending || restaurantFetching;
  const categoriesLoading =
    !!restaurant?.id && (categoriesPending || categoriesFetching);

  const { data: items = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu-items", restaurant?.id],
    queryFn: () =>
      api.get<MenuItem[]>(`/menu/items/${restaurant?.id}`).then((r) => r.data),
    enabled: !!restaurant?.id,
  });

  const { mutate: addCategory, isPending: addingCategory } = useMutation({
    mutationFn: (name: string) => api.post("/menu/categories", { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["categories", restaurant?.id],
      });
      setNewCategoryName("");
      setShowAddCategory(false);
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        "Error",
        e.response?.data?.message ?? "Could not create category",
      );
    },
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (id: string) => api.delete(`/menu/categories/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["categories", restaurant?.id],
      });
      void queryClient.invalidateQueries({
        queryKey: ["menu-items", restaurant?.id],
      });
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        "Error",
        e.response?.data?.message ?? "Could not delete category",
      );
    },
  });

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      Alert.alert("Name required", "Please enter a category name.");
      return;
    }
    addCategory(name);
  }

  const [newItemImageUrl, setNewItemImageUrl] = useState<string | null>(null);

  const {
    openImagePicker: openItemImagePicker,
    isUploading: uploadingItemImage,
  } = useImageUploader("menuItemImage", {
    onClientUploadComplete: (res) => {
      setNewItemImageUrl(res[0].ufsUrl);
    },
    onUploadError: (error) => {
      Alert.alert("Upload failed", error.message);
    },
  });

  const { mutate: addItem, isPending: addingItem } = useMutation({
    mutationFn: () =>
      api.post("/menu/items", {
        categoryId: selectedCategoryId,
        name: newItemName,
        price: newItemPrice,
        imageUrl: newItemImageUrl,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["menu-items", restaurant?.id],
      });
      setNewItemName("");
      setNewItemPrice("");
      setNewItemImageUrl(null);
      setShowAddItem(false);
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        "Error",
        e.response?.data?.message ?? "Could not create menu item",
      );
    },
  });

  const { mutate: toggleAvailability } = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      api.patch(`/menu/items/${id}`, { isAvailable }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["menu-items", restaurant?.id],
      }),
    onError: (e: { response?: { data?: { message?: string } } }) => {
      Alert.alert(
        "Error",
        e.response?.data?.message ?? "Could not update availability",
      );
    },
  });

  function handleAddItem() {
    const name = newItemName.trim();
    const price = newItemPrice.trim();
    if (!name || !price) {
      Alert.alert("Required fields", "Item name and price are required.");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("Error", "No category selected.");
      return;
    }
    addItem();
  }

  function closeAddItemModal() {
    setShowAddItem(false);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemImageUrl(null);
  }

  const { mutate: deleteItem } = useMutation({
    mutationFn: (id: string) => api.delete(`/menu/items/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["menu-items", restaurant?.id],
      }),
  });

  if (restaurantLoading || categoriesLoading) {
    return (
      <ThemedScreenContainer>
        <View style={{}}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </ThemedScreenContainer>
    );
  }

  if (!restaurant) {
    return (
      <ThemedScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            Create your restaurant on the Orders tab first.
          </Text>
        </View>
      </ThemedScreenContainer>
    );
  }

  return (
    <ThemedScreenContainer>
      <Pressable
        style={styles.addButton}
        onPress={() => setShowAddCategory(true)}
      >
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </Pressable>

      <FlatList
        style={styles.list}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item: category }) => {
          const categoryItems = items.filter(
            (i) => i.categoryId === category.id,
          );
          return (
            <View style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Delete category?",
                      "All items in this category will also be deleted.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            deleteCategory(category.id);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>

              {categoryItems.map((item) => {
                const isAvailable = item.isAvailable !== false;
                return (
                  <View key={item.id} style={styles.itemRow}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemThumb}
                      />
                    ) : null}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <View style={styles.availabilityRow}>
                        <Text style={styles.availabilityLabel}>
                          {isAvailable ? "Available" : "Unavailable"}
                        </Text>
                        <Switch
                          value={isAvailable}
                          onValueChange={(value) =>
                            toggleAvailability({
                              id: item.id,
                              isAvailable: value,
                            })
                          }
                          trackColor={{ false: "#FECACA", true: "#86EFAC" }}
                          thumbColor={isAvailable ? "#22C55E" : "#EF4444"}
                        />
                      </View>
                      <Pressable
                        onPress={() => {
                          Alert.alert("Delete item?", item.name, [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => deleteItem(item.id),
                            },
                          ]);
                        }}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}

              <Pressable
                style={styles.addItemButton}
                onPress={() => {
                  setSelectedCategoryId(category.id);
                  setShowAddItem(true);
                }}
              >
                <Text style={styles.addItemText}>+ Add Item</Text>
              </Pressable>
            </View>
          );
        }}
      />

      <Modal visible={showAddCategory} transparent animationType="slide">
        <ThemedScreenContainer>
          <ScrollView contentContainerStyle={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <Pressable
                style={styles.button}
                onPress={handleAddCategory}
                disabled={addingCategory || !newCategoryName.trim()}
              >
                {addingCategory ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
              </Pressable>
              <Pressable onPress={() => setShowAddCategory(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </ThemedScreenContainer>
      </Modal>

      <Modal visible={showAddItem} transparent animationType="slide">
        <ThemedScreenContainer>
          <ScrollView contentContainerStyle={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>New Item</Text>

              <Pressable
                style={styles.imagePicker}
                onPress={() =>
                  void openItemImagePicker({
                    source: "library",
                    onInsufficientPermissions: () => {
                      Alert.alert(
                        "No Permissions",
                        "You need to grant permission to your Photos",
                        [
                          { text: "Dismiss" },
                          {
                            text: "Open Settings",
                            onPress: () => {
                              void openSettings();
                            },
                          },
                        ],
                      );
                    },
                  })
                }
                disabled={uploadingItemImage}
              >
                {newItemImageUrl ? (
                  <Image
                    source={{ uri: newItemImageUrl }}
                    style={styles.itemImage}
                  />
                ) : (
                  <Text style={styles.imagePickerText}>
                    {uploadingItemImage
                      ? "Uploading..."
                      : "Tap to add item image"}
                  </Text>
                )}
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder="Item name"
                value={newItemName}
                onChangeText={setNewItemName}
              />
              <TextInput
                style={styles.input}
                placeholder="Price e.g. 8.99"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="decimal-pad"
              />
              <Pressable
                style={styles.button}
                onPress={handleAddItem}
                disabled={
                  addingItem ||
                  uploadingItemImage ||
                  !newItemName.trim() ||
                  !newItemPrice.trim()
                }
              >
                {addingItem ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
              </Pressable>
              <Pressable onPress={closeAddItemModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </ThemedScreenContainer>
      </Modal>
    </ThemedScreenContainer>
  );
};

export default Menu;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  categoryBlock: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
  },
  deleteText: {
    color: "#EF4444",
    fontSize: 14,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    gap: 10,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  itemActions: {
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  availabilityLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    width: 72,
    textAlign: "right",
  },
  addItemButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
    alignItems: "center",
  },
  addItemText: {
    color: "#FF6B35",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    textAlign: "center",
    color: "#666",
    fontSize: 15,
  },
  imagePicker: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: "#999",
    fontSize: 13,
  },
});
