import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getArchitectureDetails } from "../api/detailApi";

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

  // ✅ SAFE FALLBACK
  const executionResult = route.params?.executionResult || {
    registers: [],
    flags: [],
    errors: [],
  };

  const architecture = route.params?.architecture;

  const architectureId =
    route.params?.architectureId ||
    architecture?.ArchitectureID ||
    architecture?.architectureID ||
    architecture?.id ||
    architecture?.architectureId;

  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [flagRegisters, setFlagRegisters] = useState([]);

  const registersArray =
    executionResult.registers ||
    executionResult.Registers ||
    [];

  const flagsArray =
    executionResult.flags ||
    executionResult.Flags ||
    [];

  const errors =
    executionResult.errors ||
    executionResult.Errors ||
    [];

  useEffect(() => {
    fetchArchitectureDetailsForNames();
  }, [architectureId]);

  const fetchArchitectureDetailsForNames = async () => {
    try {
      if (!architectureId) return;

      const data = await getArchitectureDetails(architectureId);

      setGeneralRegisters(data.generalRegisters || []);
      setFlagRegisters(data.flagRegisters || []);

      console.log("REGISTER VISUALIZATION DETAILS:", {
        generalRegisters: data.generalRegisters || [],
        flagRegisters: data.flagRegisters || [],
      });
    } catch (err) {
      console.log("Register Visualization Details Fetch Error:", err);
    }
  };

  // =======================
  // DYNAMIC REGISTER / FLAG NAMES FROM DATABASE
  // =======================
  const routeRegisters = route.params?.registers || [];
  const routeFlags = route.params?.flags || [];

  const dbRegisters =
    Array.isArray(generalRegisters) && generalRegisters.length > 0
      ? generalRegisters
      : Array.isArray(routeRegisters) && routeRegisters.length > 0
        ? routeRegisters
        : architecture?.Registers ||
          architecture?.registers ||
          architecture?.ArchitectureRegisters ||
          architecture?.architectureRegisters ||
          [];

  const dbFlags =
    Array.isArray(flagRegisters) && flagRegisters.length > 0
      ? flagRegisters
      : Array.isArray(routeFlags) && routeFlags.length > 0
        ? routeFlags
        : architecture?.flagRegisters ||
          architecture?.FlagRegisters ||
          architecture?.Flags ||
          architecture?.flags ||
          architecture?.ArchitectureFlags ||
          architecture?.architectureFlags ||
          architecture?.ArchitectureFlagRegisters ||
          architecture?.architectureFlagRegisters ||
          [];

  const dynamicRegisters = Array.isArray(dbRegisters) && dbRegisters.length > 0
    ? dbRegisters.map((reg, index) => ({
        label:
          reg?.name ||
          reg?.Name ||
          reg?.RegisterName ||
          reg?.registerName ||
          `R${index + 1}`,
        value: registersArray[index] ?? 0,
      }))
    : registersArray.map((value, index) => ({
        label: `R${index + 1}`,
        value: value ?? 0,
      }));

  const dynamicFlags = Array.isArray(dbFlags) && dbFlags.length > 0
    ? dbFlags.map((flag, index) => ({
        label:
          flag?.name ||
          flag?.Name ||
          flag?.FlagName ||
          flag?.flagName ||
          flag?.FlagRegisterName ||
          flag?.flagRegisterName ||
          flag?.RegisterName ||
          flag?.registerName ||
          `Flag ${index + 1}`,
        value:
          flagsArray[index] === true
            ? 1
            : flagsArray[index] === false
              ? 0
              : flagsArray[index] ?? 0,
      }))
    : [];

  const chunkArray = (array, size) => {
    const chunks = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  };

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
          Using Architecture: {architecture?.Name || architecture?.name}
        </Text>
      )}

      {/* REGISTERS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registers</Text>

        {dynamicRegisters.length > 0 ? (
          chunkArray(dynamicRegisters, 4).map((rowItems, rowIndex) => (
            <View style={styles.row} key={`register-row-${rowIndex}`}>
              {rowItems.map((reg, index) => (
                <RegisterBox
                  key={`register-${rowIndex}-${index}`}
                  label={reg.label}
                  value={reg.value}
                />
              ))}

              {rowItems.length < 4 &&
                Array.from({ length: 4 - rowItems.length }).map((_, emptyIndex) => (
                  <View
                    key={`empty-register-${rowIndex}-${emptyIndex}`}
                    style={styles.boxContainer}
                  />
                ))}
            </View>
          ))
        ) : (
          <Text style={styles.outputText}>No registers found</Text>
        )}
      </View>

      {/* FLAGS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Flags</Text>

        {dynamicFlags.length > 0 ? (
          chunkArray(dynamicFlags, 4).map((rowItems, rowIndex) => (
            <View style={styles.row} key={`flag-row-${rowIndex}`}>
              {rowItems.map((flag, index) => (
                <RegisterBox
                  key={`flag-${rowIndex}-${index}`}
                  label={flag.label}
                  value={flag.value}
                />
              ))}

              {rowItems.length < 4 &&
                Array.from({ length: 4 - rowItems.length }).map((_, emptyIndex) => (
                  <View
                    key={`empty-flag-${rowIndex}-${emptyIndex}`}
                    style={styles.boxContainer}
                  />
                ))}
            </View>
          ))
        ) : (
          <Text style={styles.outputText}>No flags found</Text>
        )}
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