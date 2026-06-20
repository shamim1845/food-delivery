import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/axios";
import { useImageUploader } from "@/lib/uploadthing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { openSettings } from "expo-linking";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

const CUISINE_TYPES = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
    "American",
    "Mediterranean",
    "French",
    "Other",
];

const CreateRestaurant = () => {
    const theme = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [cuisineType, setCuisineType] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const { openImagePicker, isUploading } = useImageUploader("restaurantImage", {
        onClientUploadComplete: (res) => {
            const url = res?.[0]?.ufsUrl;
            if (url) {
                setImageUrl(url);
                Alert.alert("Upload Success", "Image uploaded successfully");
            }
        },
        onUploadError: (error) => {
            Alert.alert("Upload Failed", error.message);
        },

    });

    const { mutateAsync: createRestaurant, isPending } = useMutation({
        mutationFn: async () => {
            const { data } = await api.post("/restaurants", {
                name,
                description,
                address,
                cuisineType,
                imageUrl,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-restaurant"] });
            router.replace("/(owner)/(index)");
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message ?? "Failed to create restaurant.";
            Alert.alert("Error", message);
        },
    });

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert("Validation", "Restaurant name is required.");
            return;
        }
        if (!address.trim()) {
            Alert.alert("Validation", "Address is required.");
            return;
        }
        if (!cuisineType) {
            Alert.alert("Validation", "Please select a cuisine type.");
            return;
        }
        createRestaurant();
    };

    const handleOpenPicker = () => {
        openImagePicker({
            source: "library",
            onInsufficientPermissions: () => {
                Alert.alert(
                    "Permission Required",
                    "Please allow access to your Photos to upload a restaurant image.",
                    [
                        { text: "Dismiss" },
                        {
                            text: "Open Settings",
                            onPress: () => openSettings(),
                        },
                    ]
                );
            },
        });
    };


    return (
        <ThemedScreenContainer>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="subtitle">Create Restaurant</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        Fill in the details to set up your restaurant
                    </ThemedText>
                </View>

                {/* Image Upload */}
                <Pressable
                    onPress={handleOpenPicker}
                    style={({ pressed }) => [
                        styles.imageUploadBox,
                        {
                            borderColor: imageUrl ? theme.primary : theme.backgroundSelected,
                            backgroundColor: theme.backgroundElement,
                        },
                        pressed && { opacity: 0.8 },
                    ]}
                >
                    {isUploading ? (
                        <View style={styles.uploadingContainer}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <ThemedText type="small" themeColor="textSecondary" style={styles.uploadText}>
                                Uploading...
                            </ThemedText>
                        </View>
                    ) : imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <ThemedText style={[styles.uploadIcon, { color: theme.primary }]}>
                                📷
                            </ThemedText>
                            <ThemedText type="smallBold" themeColor="textSecondary">
                                Tap to upload restaurant photo
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                                Max 4MB · JPG, PNG, WEBP
                            </ThemedText>
                        </View>
                    )}
                </Pressable>

                {imageUrl && (
                    <Pressable
                        onPress={handleOpenPicker}
                        style={styles.changePhotoBtn}
                    >
                        <ThemedText type="small" style={{ color: theme.primary }}>
                            ✏️ Change photo
                        </ThemedText>
                    </Pressable>
                )}

                {/* Form Fields */}
                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                        Restaurant Name *
                    </ThemedText>
                    <ThemedInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Food Mama"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                        Description
                    </ThemedText>
                    <ThemedInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell customers what makes your restaurant special"
                        multiline
                        numberOfLines={3}
                        style={styles.textArea}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                        Address *
                    </ThemedText>
                    <ThemedInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. Uttara, Dhaka"
                        autoCapitalize="words"
                    />
                </View>

                {/* Cuisine Type Selector */}
                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                        Cuisine Type *
                    </ThemedText>
                    <View style={styles.cuisineGrid}>
                        {CUISINE_TYPES.map((type) => {
                            const selected = cuisineType === type;
                            return (
                                <Pressable
                                    key={type}
                                    onPress={() => setCuisineType(type)}
                                    style={({ pressed }) => [
                                        styles.cuisineChip,
                                        {
                                            backgroundColor: selected
                                                ? theme.primary
                                                : theme.backgroundElement,
                                            borderColor: selected
                                                ? theme.primary
                                                : theme.backgroundSelected,
                                        },
                                        pressed && { opacity: 0.75 },
                                    ]}
                                >
                                    <ThemedText
                                        type="small"
                                        style={{
                                            color: selected ? "#fff" : theme.text,
                                            fontWeight: selected ? "700" : "500",
                                        }}
                                    >
                                        {type}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />

                {/* Submit */}
                <ThemedButton
                    title="Create Restaurant"
                    onPress={handleSubmit}
                    isLoading={isPending}
                    disabled={isUploading}
                />

                <ThemedButton
                    title="Cancel"
                    variant="outline"
                    onPress={() => router.back()}
                    disabled={isPending || isUploading}
                />
            </ScrollView>
        </ThemedScreenContainer>
    );
};

export default CreateRestaurant;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
        gap: 6,
    },
    imageUploadBox: {
        height: 200,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: "dashed",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    uploadingContainer: {
        alignItems: "center",
        gap: 10,
    },
    uploadText: {
        marginTop: 4,
    },
    uploadPlaceholder: {
        alignItems: "center",
        gap: 6,
    },
    uploadIcon: {
        fontSize: 36,
    },
    changePhotoBtn: {
        alignSelf: "flex-end",
        marginBottom: 16,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    fieldGroup: {
        marginBottom: 4,
    },
    label: {
        marginBottom: 6,
    },
    textArea: {
        minHeight: 90,
        textAlignVertical: "top",
        paddingTop: 12,
    },
    cuisineGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    cuisineChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    divider: {
        height: 1,
        marginBottom: 20,
        marginTop: 4,
    },
});
