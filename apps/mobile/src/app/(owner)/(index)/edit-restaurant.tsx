import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { RestaurantForm } from "../components/restaurant-form";
import { Restaurant } from "@food-delivery/types";
import { api } from "@/lib/axios";

const EditRestaurant = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["my-restaurant"],
    queryFn: async () => {
      const { data } = await api.get<Restaurant | null>("/restaurants/mine");
      return data;
    },
  });

  const { mutateAsync: updateRestaurant, isPending } = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      address: string;
      cuisineType: string;
      imageUrl: string | null;
    }) => {
      if (!restaurant) return;
      const { data: response } = await api.patch(
        `/restaurants/${restaurant.id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-restaurant"],
      });
      Alert.alert("Success", "Restaurant updated successfully!");
      router.replace("/(owner)/(index)");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Failed to update restaurant.";
      Alert.alert("Error", message);
    },
  });

  if (isLoading) {
    return (
      <ThemedScreenContainer style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedScreenContainer>
    );
  }

  if (!restaurant) {
    return (
      <ThemedScreenContainer style={styles.centerContainer}>
        <ThemedText>No restaurant found.</ThemedText>
      </ThemedScreenContainer>
    );
  }

  // Convert potential nulls to undefined or match the form initialData structure
  const initialData = {
    name: restaurant.name,
    description: restaurant.description,
    address: restaurant.address,
    cuisineType: restaurant.cuisineType,
    imageUrl: restaurant.imageUrl,
  };

  return (
    <RestaurantForm
      initialData={initialData}
      title="Edit Restaurant"
      subtitle="Update your restaurant details"
      submitButtonTitle="Save Changes"
      isSubmitting={isPending}
      onSubmit={(data) => updateRestaurant(data)}
      onCancel={() => router.back()}
    />
  );
};

export default EditRestaurant;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
