import { RestaurantForm } from "../_components/restaurant-form";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

const CreateRestaurant = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: createRestaurant, isPending } = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      address: string;
      cuisineType: string;
      imageUrl: string | null;
    }) => {
      const { data: response } = await api.post("/restaurants", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-restaurant"] });
      Alert.alert("Success", "Restaurant created successfully!");
      router.replace("/(owner)/(index)");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Failed to create restaurant.";
      Alert.alert("Error", message);
    },
  });

  return (
    <RestaurantForm
      title="Create Restaurant"
      subtitle="Fill in the details to set up your restaurant"
      submitButtonTitle="Create Restaurant"
      isSubmitting={isPending}
      onSubmit={(data) => createRestaurant(data)}
      onCancel={() => router.back()}
    />
  );
};

export default CreateRestaurant;
