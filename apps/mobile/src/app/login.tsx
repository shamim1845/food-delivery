import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@/context/auth-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedInput } from "@/components/themed-input";
import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedButton } from "@/components/themed-button";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="subtitle" style={styles.title}>
          Welcome back
        </ThemedText>
        <ThemedInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ThemedInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <ThemedButton
          title="Login"
          onPress={handleLogin}
          isLoading={isLoading}
        />

        <Pressable onPress={() => router.push("/register")}>
          <ThemedText themeColor="primary" style={styles.link}>
            Don't have an account? Register here
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default Login;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: { marginBottom: 32 },
  link: {
    textAlign: "center",
  },
});
