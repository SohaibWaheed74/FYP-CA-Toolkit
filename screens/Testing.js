// Testing.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function Testing() {
  const route = useRoute();
  const { architecture } = route.params || {};

  if (!architecture) {
    return (
      <View style={styles.container}>
        <Text>No Data Received</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Testing Architecture Data</Text>

      <Text style={styles.sectionTitle}>CPU Data:</Text>
      <Text>{JSON.stringify(architecture.cpuData, null, 2)}</Text>

      <Text style={styles.sectionTitle}>Flag Registers:</Text>
      <Text>{JSON.stringify(architecture.flagRegisters, null, 2)}</Text>

      <Text style={styles.sectionTitle}>General Purpose Registers:</Text>
      <Text>{JSON.stringify(architecture.gpRegisters, null, 2)}</Text>

      <Text style={styles.sectionTitle}>Addressing List:</Text>
      <Text>{JSON.stringify(architecture.addressingList, null, 2)}</Text>

      <Text style={styles.sectionTitle}>Instructions:</Text>
      <Text>{JSON.stringify(architecture.instructions, null, 2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
});
