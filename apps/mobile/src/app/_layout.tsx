import "@/lib/polyfills";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { UserRole } from "@food-delivery/types";
import { useTheme } from "@/hooks/use-theme";
import { StripeProvider } from "@stripe/stripe-react-native";

const queryClient = new QueryClient();

function RootNavigator() {
  const { isLoading, user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = useTheme();

  if (isLoading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarStyle: colorScheme === "dark" ? "light" : "dark",
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="health" />

      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      <Stack.Protected guard={!!user && user.role === UserRole.CUSTOMER}>
        <Stack.Screen name="(customer)" />
      </Stack.Protected>

      <Stack.Protected
        guard={!!user && user.role === UserRole.RESTAURANT_OWNER}
      >
        <Stack.Screen name="(owner)" />
      </Stack.Protected>

      <Stack.Protected guard={!!user && user.role === UserRole.DRIVER}>
        <Stack.Screen name="(driver)" />
      </Stack.Protected>

      <Stack.Protected guard={!!user && user.role === UserRole.ADMIN}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        >
          <AuthProvider>
            <AnimatedSplashOverlay />
            <RootNavigator />
          </AuthProvider>
        </StripeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
