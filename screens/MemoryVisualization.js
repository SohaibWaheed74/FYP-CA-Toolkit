import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { ArchitectureContext } from "../context/ArchitectureContext";

const MemoryVisualization = () => {
  const { memoryBits, memorySize, stackValues } =
    useContext(ArchitectureContext);

  const [selectedRows, setSelectedRows] = useState(4);

  const visibleMemoryBits =
    selectedRows === "full" ? memoryBits : memoryBits?.slice(0, selectedRows);

  // Stack values from context
  const displayStackValues =
    stackValues && stackValues.length > 0
      ? stackValues
      : Array.from({ length: 16 }, () => "");

  // SP should point to TOP pushed value, not next empty box
  const usedStackIndexes = displayStackValues
    .map((value, index) => ({
      value,
      index,
    }))
    .filter(
      (item) =>
        item.value !== "" && item.value !== null && item.value !== undefined
    );

  const stackPointerIndex =
    usedStackIndexes.length > 0
      ? Math.max(...usedStackIndexes.map((item) => item.index))
      : -1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HEADER ================= */}
      <Text style={styles.header}>Memory Visualization</Text>

      {/* ================= MEMORY VALUES ================= */}
      <View style={styles.memoryHeaderRow}>
        <Text style={styles.sectionTitle}>Memory Values</Text>

        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedRows(4)}
          >
            <View style={styles.radioOuter}>
              {selectedRows === 4 && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>4</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedRows(8)}
          >
            <View style={styles.radioOuter}>
              {selectedRows === 8 && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>8</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setSelectedRows("full")}
          >
            <View style={styles.radioOuter}>
              {selectedRows === "full" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioText}>Full</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.card}>
        {memoryBits && memoryBits.length > 0 ? (
          visibleMemoryBits.map((rowBits, rowIndex) => {
            const address = `0x${rowIndex
              .toString(16)
              .toUpperCase()
              .padStart(2, "0")}`;

            return (
              <View key={rowIndex} style={styles.memoryRow}>
                <Text style={styles.addressText}>{address}</Text>

                {/* 
                  Horizontal ScrollView:
                  If rowBits has more than 8 bits, it will show all bits
                  in the same address row and user can scroll horizontally.
                */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  style={styles.bitScrollView}
                  contentContainerStyle={styles.memoryGrid}
                  nestedScrollEnabled={true}
                >
                  {rowBits.map((bit, colIndex) => (
                    <View
                      key={colIndex}
                      style={[
                        styles.memoryCell,
                        Number(bit) === 1
                          ? styles.bitOneCell
                          : styles.bitZeroCell,
                      ]}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            Please press Use on an architecture first.
          </Text>
        )}

        {memorySize > 0 && (
          <Text style={styles.memorySizeText}>
            Total Memory: {memorySize} Bytes
          </Text>
        )}

        {/* Memory Color Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.blueBox]} />
            <Text style={styles.legendText}>Bit = 1</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.whiteBox]} />
            <Text style={styles.legendText}>Bit = 0</Text>
          </View>
        </View>
      </View>

      {/* ================= STACK MEMORY ================= */}
      <Text style={styles.sectionTitle}>Stack Memory</Text>

      <View style={styles.stackWrapper}>
        <View style={styles.stackCard}>
          {displayStackValues
            .map((value, index) => ({
              index,
              value,
            }))
            .reverse()
            .map((item) => {
              const isStackPointer = stackPointerIndex === item.index;

              return (
                <View key={item.index} style={styles.stackRow}>
                  <Text style={styles.stackIndex}>{item.index}</Text>

                  <TextInput
                    style={styles.stackInput}
                    editable={false}
                    value={String(item.value || "")}
                    textAlign="center"
                  />

                  <View style={styles.spColumn}>
                    <Text style={isStackPointer ? styles.spText : styles.spHidden}>
                      {isStackPointer ? "SP" : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      </View>
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
    color: "#333",
  },

  memoryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#1e3a8a",
  },

  radioText: {
    marginLeft: 5,
    fontSize: 13,
    color: "#1e3a8a",
    fontWeight: "700",
  },

  /* ================= MEMORY CARD ================= */

  card: {
    backgroundColor: "#e9edf3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 25,
  },

  memoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  addressText: {
    width: 45,
    fontSize: 11,
    color: "#333",
    fontWeight: "600",
  },

  bitScrollView: {
    flex: 1,
  },

  memoryGrid: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  memoryCell: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    margin: 2,
  },

  bitOneCell: {
    backgroundColor: "#1e3a8a",
  },

  bitZeroCell: {
    backgroundColor: "#FFFFFF",
  },

  emptyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },

  memorySizeText: {
    marginTop: 10,
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "600",
    textAlign: "center",
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
    width: "75%",
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
    width: 100,
    height: 36,
    borderWidth: 1,
    borderColor: "#b0c4de",
    borderRadius: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 6,
    paddingVertical: 0,
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },

  spColumn: {
    width: 35,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  spText: {
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "700",
    textAlign: "center",
  },

  spHidden: {
    fontSize: 12,
    color: "transparent",
    fontWeight: "700",
    textAlign: "center",
    opacity: 0,
  },

  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    gap: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#1E3A8A",
  },

  blueBox: {
    backgroundColor: "#1E3A8A",
  },

  whiteBox: {
    backgroundColor: "#FFFFFF",
  },

  legendText: {
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "500",
  },
});