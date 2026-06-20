import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { api } from "@/lib/axios";
import { Restaurant } from "@food-delivery/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

const OwnerHome = () => {
  const router = useRouter();
  const queryClient = useQueryClient()

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["my-restaurant"],
    queryFn: async () => {
      const { data } = await api.get<Restaurant | null>("/restaurants/mine");
      return data;
    },
  });
  console.log("my restaurant", restaurant);

  const { mutateAsync: toggleOpenStatus, isPending: isTooglePending } = useMutation({
    mutationFn: async () => {
      await api.patch(`/restaurants/${restaurant?.id}`, { isOpen: !restaurant?.isOpen })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-restaurant"]
      })
    }
  })


  useEffect(() => {
    if (isLoading) return;
    if (!restaurant) {
      router.replace("/(owner)/(index)/create-restaurant");
    }
  }, [restaurant, isLoading, router]);

  if (isLoading) {
    return <ThemedScreenContainer style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <ActivityIndicator size={"large"} />
    </ThemedScreenContainer>
  }

  return (
    <ThemedScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText>{restaurant?.name}</ThemedText>
        <ThemedText>Cuisine: {restaurant?.cuisineType}</ThemedText>

        <ThemedButton variant={restaurant?.isOpen ? "success" : "primary"} isLoading={isTooglePending} title={restaurant?.isOpen ? "Open - Tap to Close" : "Closed - Tap to Open"} onPress={() => { toggleOpenStatus() }} />

        <ThemedButton variant="outline" title="Edit Restaurant" onPress={() => { router.push("/(owner)/(index)/edit-restaurant") }} />


      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default OwnerHome;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    gap: 20
  },
});
