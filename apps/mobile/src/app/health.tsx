import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { api } from "@/lib/axios";
import { HealthCheckResponse } from "@food-delivery/types";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const {
    data: health,
    isLoading,
    error,
  } = useQuery<HealthCheckResponse>({
    queryKey: ["health"],
    queryFn: () => api.get("/health").then((res) => res.data),
  });

  console.log(health);

  return (
    <SafeAreaView>
      <Text style={{ color: "red" }}>Food Delivery</Text>

      {isLoading ? (
        <ActivityIndicator color={"#ff6b35"} size={"large"} />
      ) : error ? (
        <Text style={{ color: "red" }}>Error: {error?.message}</Text>
      ) : (
        <Text style={{ color: "red" }}>Status: {health?.status}</Text>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
