import React from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppHeader = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <StatusBar
        backgroundColor="#1f3c88"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <Ionicons name="hardware-chip-outline" size={28} color="#fff" />

        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>
          Computer Architecture Toolkit
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: "#1f3c88",
  },
  header: {
    minHeight: 60,
    backgroundColor: "#1f3c88",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 8,
    flexShrink: 1,
    textAlign: "center",
  },
});

export default AppHeader;