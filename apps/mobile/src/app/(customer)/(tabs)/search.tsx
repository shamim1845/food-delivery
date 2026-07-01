import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { ScrollView, StyleSheet } from "react-native";

const Search = () => {
  return (
    <ThemedScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText>Search Page</ThemedText>
      </ScrollView>
    </ThemedScreenContainer>
  );
};

export default Search;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
});
