import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedText } from "@/components/themed-text";
import { ScrollView, StyleSheet } from "react-native";

const EditRestaurant = () => {
    return (
        <ThemedScreenContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedText>Edit Restaurant Page!</ThemedText>
            </ScrollView>
        </ThemedScreenContainer>
    );
};

export default EditRestaurant;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
    },
});
