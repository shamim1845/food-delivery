import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { ScrollView, StyleSheet } from "react-native";

const index = () => {
  return (
    <ThemedScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText>Customer</ThemedText>
      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default index;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
});
