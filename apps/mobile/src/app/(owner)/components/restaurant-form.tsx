import { ThemedScreenContainer } from "@/components/ThemedScreenContainer";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useImageUploader } from "@/lib/uploadthing";
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
import { openSettings } from "expo-linking";

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

interface RestaurantFormProps {
    initialData?: {
        name: string;
        description?: string | null;
        address: string;
        cuisineType: string;
        imageUrl?: string | null;
    };
    title: string;
    subtitle: string;
    submitButtonTitle: string;
    isSubmitting: boolean;
    onSubmit: (data: {
        name: string;
        description: string;
        address: string;
        cuisineType: string;
        imageUrl: string | null;
    }) => void;
    onCancel: () => void;
}

export const RestaurantForm = ({
    initialData,
    title,
    subtitle,
    submitButtonTitle,
    isSubmitting,
    onSubmit,
    onCancel,
}: RestaurantFormProps) => {
    const theme = useTheme();

    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [address, setAddress] = useState(initialData?.address ?? "");
    const [cuisineType, setCuisineType] = useState(initialData?.cuisineType ?? "");
    const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);

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
        onSubmit({
            name: name.trim(),
            description: description.trim(),
            address: address.trim(),
            cuisineType,
            imageUrl,
        });
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
                    <ThemedText type="subtitle">{title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {subtitle}
                    </ThemedText>
                </View>

                {/* Image Upload */}
                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold" style={styles.label}>
                        Restaurant Photo
                    </ThemedText>
                    {isUploading ? (
                        <View style={[styles.imageContainer, { backgroundColor: theme.backgroundElement }]}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <ThemedText type="small" themeColor="textSecondary" style={styles.uploadText}>
                                Uploading...
                            </ThemedText>
                        </View>
                    ) : imageUrl ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageUrl }} style={styles.restaurantImage} resizeMode="cover" />
                            <Pressable 
                                onPress={handleOpenPicker} 
                                style={styles.editImageOverlay}
                            >
                                <ThemedText style={styles.editImageText}>
                                    ✏️ Change Photo
                                </ThemedText>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={handleOpenPicker}
                            style={({ pressed }) => [
                                styles.imageUploadBox,
                                {
                                    borderColor: theme.backgroundSelected,
                                    backgroundColor: theme.backgroundElement,
                                },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
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
                        </Pressable>
                    )}
                </View>

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
                    title={submitButtonTitle}
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={isUploading}
                />

                <ThemedButton
                    title="Cancel"
                    variant="outline"
                    onPress={onCancel}
                    disabled={isSubmitting || isUploading}
                />
            </ScrollView>
        </ThemedScreenContainer>
    );
};

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
        marginBottom: 16,
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
    imageContainer: {
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        marginBottom: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    restaurantImage: {
        width: "100%",
        height: "100%",
    },
    editImageOverlay: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    editImageText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "600",
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
