import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/auth-context";
import { ScrollView, StyleSheet, View } from "react-native";

const Profile = () => {
  const { user, logout } = useAuth();
  return (
    <ThemedScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileInfo}>
          <ThemedText>
            {user?.firstName} {user?.lastName}
          </ThemedText>
          <ThemedText>{user?.email}</ThemedText>
          <ThemedText>{user?.role}</ThemedText>
        </View>

        <ThemedButton onPress={logout} title="Logout" />
      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default Profile;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    padding: 24,
    justifyContent: "center",
    gap: 40,
  },
  profileInfo: {
    width: "100%",
    alignItems: "center",
    gap: 4,
  },
});
