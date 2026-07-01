import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { api } from "@/lib/axios";
import { Restaurant as RestaurantType } from "@food-delivery/types";
import { useDebounce } from "@/hooks/use-debounce";

export default function CustomerHomeScreen() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400); // wait 400ms after user stops typing

  const {
    data: restaurants = [],
    isLoading,
    refetch,
  } = useQuery<RestaurantType[]>({
    queryKey: ["restaurants", debouncedSearch],
    queryFn: () =>
      api
        .get<RestaurantType[]>("/restaurants", {
          params: debouncedSearch ? { search: debouncedSearch } : undefined,
        })
        .then((r) => r.data),
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>What are you craving?</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants or cuisine..."
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push(`/(customer)/(tabs)/(home)/restaurant/${item.id}`)
              }
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.cardImagePlaceholder} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardCuisine}>{item.cuisineType}</Text>
                <View style={styles.cardMeta}>
                  {Number(item.rating) > 0 ? (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingStar}>★</Text>
                      <Text style={styles.ratingValue}>
                        {Number(item.rating).toFixed(1)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noRating}>New</Text>
                  )}
                  <View style={styles.openBadge}>
                    <Text style={styles.openBadgeText}>Open</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 12,
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  cardBody: {
    padding: 12,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardCuisine: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardRating: {
    fontSize: 13,
    color: "#333",
  },
  openBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  openBadgeText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingStar: {
    fontSize: 13,
    color: "#FF6B35",
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  noRating: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
});
