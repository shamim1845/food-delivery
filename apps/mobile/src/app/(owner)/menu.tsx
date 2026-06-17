import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { ScrollView, StyleSheet } from "react-native";

const Menu = () => {
  return (
    <ThemedScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText>Menu</ThemedText>
      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default Menu;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
});
