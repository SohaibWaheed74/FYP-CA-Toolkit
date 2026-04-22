import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";

const MemoryVisualization = () => {
  // Generate 0x00 – 0x0F addresses
  const memoryRows = Array.from({ length: 16 }, (_, i) =>
    `0x${i.toString(16).toUpperCase().padStart(2, "0")}`
  );

  // Stack values from 14 to -1
  const stackValues = Array.from({ length: 16 }, (_, i) => 14 - i);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}
      <Text style={styles.header}>Memory Visualization</Text>

      {/* ================= MEMORY VALUES ================= */}
      <Text style={styles.sectionTitle}>Memory Values</Text>

      <View style={styles.card}>
        {memoryRows.map((address, rowIndex) => (
          <View key={rowIndex} style={styles.memoryRow}>
            <Text style={styles.addressText}>{address}</Text>

            <View style={styles.memoryGrid}>
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <View key={colIndex} style={styles.memoryCell} />
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* ================= STACK MEMORY ================= */}
      <Text style={styles.sectionTitle}>Stack Memory</Text>

      <View style={styles.stackWrapper}>
        <View style={styles.stackCard}>
          {stackValues.map((value, index) => (
            <View key={index} style={styles.stackRow}>
              <Text style={styles.stackIndex}>{value}</Text>
              <TextInput style={styles.stackInput} />
            </View>
          ))}

          {/* Stack Pointer Label */}
          <View style={styles.spRow}>
            <Text style={styles.spText}>SP</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default MemoryVisualization;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e3a8a",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },

  /* ================= MEMORY CARD ================= */

  card: {
    backgroundColor: "#e9edf3",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },

  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  addressText: {
    width: 50,
    fontSize: 12,
    color: "#333",
  },

  memoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },

  memoryCell: {
    width: 22,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#b0c4de",
    backgroundColor: "#ffffff",
    marginRight: 5,
    marginBottom: 5,
  },

  /* ================= STACK MEMORY ================= */

  stackWrapper: {
    alignItems: "center",
  },

  stackCard: {
    backgroundColor: "#e9edf3",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "65%",   // 👈 smaller width like mockup
    marginBottom: 25,
  },

  stackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  stackIndex: {
    width: 30,
    fontSize: 13,
    color: "#333",
    textAlign: "right",
    marginRight: 8,
  },

  stackInput: {
    width: 90,     // 👈 compact input box
    height: 30,
    borderWidth: 1,
    borderColor: "#b0c4de",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
  },

  spRow: {
    alignItems: "flex-end",
    marginTop: 5,
    paddingRight: 10,
  },

  spText: {
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "600",
  },
});