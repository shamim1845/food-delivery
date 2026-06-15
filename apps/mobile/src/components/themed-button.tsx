import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";

export type ThemedButtonProps = PressableProps & {
  title: string;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: "primary" | "secondary" | "outline";
};

export function ThemedButton({
  title,
  isLoading,
  disabled,
  style,
  textStyle,
  variant = "primary",
  ...rest
}: ThemedButtonProps) {
  const theme = useTheme();
  const isButtonDisabled = disabled || isLoading;

  return (
    <Pressable
      disabled={isButtonDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: theme.primary },
        variant === "secondary" && {
          backgroundColor: theme.backgroundSelected,
        },
        variant === "outline" && {
          borderColor: theme.primary,
          backgroundColor: "transparent",
        },
        pressed && styles.pressed,
        isButtonDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? theme.primary : "#fff"}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && { color: theme.text },
            variant === "outline" && { color: theme.primary },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
});
