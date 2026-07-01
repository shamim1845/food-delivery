import { Stack } from "expo-router";

export default function CustomerHomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="restaurant/[id]"
        options={{
          headerShown: true,
          title: "Menu",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
