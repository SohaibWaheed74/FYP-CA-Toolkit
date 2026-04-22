import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

/* =======================
   REUSABLE REGISTER BOX
======================= */
const RegisterBox = ({ label, value }) => {
  return (
    <View style={styles.boxContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Text style={styles.value}>{value ?? 0}</Text>
      </View>
    </View>
  );
};

/* =======================
   MAIN SCREEN
======================= */
const RegisterVisualization = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // ✅ SAFE FALLBACK (THIS FIXES {})
  const executionResult = route.params?.executionResult || {
    registers: [],
    flags: [],
    errors: [],
  };

  const architecture = route.params?.architecture;

  const registersArray = executionResult.registers || [];
  const flagsArray = executionResult.flags || [];
  const errors = executionResult.errors || [];

  const registerNames = ["R1", "R2", "R3", "R4", "R5", "PC", "SP", "IR"];
  const flagNames = ["Carry", "Overflow", "Sign", "Zero"];

  const mappedRegisters = {};
  registerNames.forEach((name, index) => {
    mappedRegisters[name] = registersArray[index] ?? 0;
  });

  const mappedFlags = {};
  flagNames.forEach((name, index) => {
    mappedFlags[name] = flagsArray[index] ?? 0;
  });

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Register Visualization</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ARCHITECTURE */}
      {architecture && (
        <Text style={{ marginBottom: 8, fontWeight: "600", color: "#1F3C88" }}>
          Using Architecture: {architecture?.Name}
        </Text>
      )}

      {/* REGISTERS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registers</Text>

        <View style={styles.row}>
          <RegisterBox label="R1" value={mappedRegisters.R1} />
          <RegisterBox label="R2" value={mappedRegisters.R2} />
          <RegisterBox label="R3" value={mappedRegisters.R3} />
          <RegisterBox label="R4" value={mappedRegisters.R4} />
        </View>

        <View style={styles.row}>
          <RegisterBox label="R5" value={mappedRegisters.R5} />
          <RegisterBox label="PC" value={mappedRegisters.PC} />
          <RegisterBox label="SP" value={mappedRegisters.SP} />
          <RegisterBox label="IR" value={mappedRegisters.IR} />
        </View>
      </View>

      {/* FLAGS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Flags</Text>

        <View style={styles.row}>
          <RegisterBox label="Carry" value={mappedFlags.Carry} />
          <RegisterBox label="Overflow" value={mappedFlags.Overflow} />
          <RegisterBox label="Sign" value={mappedFlags.Sign} />
          <RegisterBox label="Zero" value={mappedFlags.Zero} />
        </View>
      </View>

      {/* OUTPUT / ERRORS */}
      <Text style={styles.cardTitle}>Output</Text>

      <View style={styles.outputBox}>
        <Text style={styles.outputText}>
          {errors.length > 0
            ? errors.join("\n")
            : `Result: ${registersArray[0] ?? 0}`}
        </Text>
      </View>

    </ScrollView>
  );
};

export default RegisterVisualization;

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxContainer: {
    alignItems: "center",
    width: "22%",
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    color: "#555",
  },
  box: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  outputBox: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    minHeight: 55,
  },
  outputText: {
    fontSize: 12,
    color: "#64748B",
  },
});