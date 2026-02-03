import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const AppHeader = () => {
  return (
    <View style={styles.header}>
      <Icon name="cpu-64-bit" size={26} color="#fff" />
      <Text style={styles.title}>Computer Architecture Toolkit</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#1f3c88",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8, // instead of gap
  },
});

export default AppHeader;
