import React from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type SafeAreaViewProps,
} from "react-native-safe-area-context";
import { ThemedView } from "./themed-view";

export type ThemedScreenContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  safeAreaProps?: SafeAreaViewProps;
  keyboardAvoidingBehavior?: "padding" | "height" | "position";
  keyboardAvoidingStyle?: StyleProp<ViewStyle>;
};

export function ThemedScreenContainer({
  children,
  style,
  safeAreaProps,
  keyboardAvoidingBehavior = "padding",
  keyboardAvoidingStyle,
}: ThemedScreenContainerProps) {
  return (
    <ThemedView style={styles.themedView}>
      <KeyboardAvoidingView
        style={[styles.keyboardAvoid, keyboardAvoidingStyle]}
        behavior={keyboardAvoidingBehavior}
      >
        <SafeAreaView
          style={[styles.container, style]}
          edges={["top"]}
          {...safeAreaProps}
        >
          {children}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  themedView: {
    flex: 1,
  },

  keyboardAvoid: {
    flex: 1,
  },

  container: {
    flex: 1,
  },
});
