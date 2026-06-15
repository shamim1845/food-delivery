import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@food-delivery/types";
import { ThemedInput } from "@/components/themed-input";
import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useTheme } from "@/hooks/use-theme";

// User Roles
const ROLES = [
  {
    label: "Customer",
    value: UserRole.CUSTOMER,
  },
  {
    label: "Restaurant Owner",
    value: UserRole.RESTAURANT_OWNER,
  },
  {
    label: "Driver",
    value: UserRole.DRIVER,
  },
];

const Register = () => {
  const theme = useTheme();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !role) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    setIsLoading(true);

    try {
      await register({ firstName, lastName, email, password, role });
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Registration failed",
        error?.message || "Something went wrong",
      );
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
          Create account
        </ThemedText>
        <ThemedInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <ThemedInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
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

        {/* Role Selector */}
        <ThemedText type="default" style={styles.label}>
          I am a...
        </ThemedText>
        <View style={styles.roleContainer}>
          {ROLES.map((r) => (
            <Pressable
              key={r.value}
              style={[
                styles.roleButton,
                { borderColor: theme.backgroundSelected },
                role === r.value && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setRole(r.value)}
            >
              <ThemedText
                type="smallBold"
                style={[
                  { color: theme.textSecondary, textAlign: "center" },
                  role === r.value && { color: theme.text },
                ]}
              >
                {r.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedButton
          title="Register"
          onPress={handleRegister}
          isLoading={isLoading}
        />

        <Pressable onPress={() => router.back()}>
          <ThemedText themeColor="primary" style={styles.link}>
            Already have an account? Login here
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default Register;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: { marginBottom: 32 },
  label: {
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    textAlign: "center",
  },
});
