import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  placeholderTextColor,
  ...rest
}: ThemedInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
      style={[
        {
          color: theme.text,
          borderColor: theme.backgroundSelected,
        },
        styles.input,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
});
