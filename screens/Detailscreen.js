import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { getArchitectureDetails } from "../api/detailApi";

const { width: screenWidth } = Dimensions.get("window");

const Detailscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { architectureId } = route.params;

  const [architecture, setArchitecture] = useState({});
  const [flagRegisters, setFlagRegisters] = useState([]);
  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [actions, setActions] = useState([]);
  const [addressingModes, setAddressingModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArchitectureDetails();
  }, [architectureId]);

  const fetchArchitectureDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getArchitectureDetails(architectureId);

      setArchitecture(data.architecture || {});
      setGeneralRegisters(data.generalRegisters || []);
      setFlagRegisters(data.flagRegisters || []);
      setInstructions(data.instructions || []);
      setActions(data.actions || []);

      // ✅ FIXED HERE
      setAddressingModes(data.addressingModes || []);

    } catch (err) {
      console.log("Details Fetch Error:", err);
      setError(err.message || "Failed to load architecture details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchArchitectureDetails}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Architecture Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* SYSTEM SPECIFICATIONS */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Ionicons name="settings-outline" size={16} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>System Specifications</Text>
          </View>

          <View style={styles.specRow}>
            <View style={styles.specBox}>
              <Text style={styles.label}>Architecture Name</Text>
              <Text style={styles.value}>{architecture?.name ?? "-"}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.label}>Memory Size</Text>
              <Text style={styles.value}>{architecture?.memorySize ?? "-"}</Text>
            </View>
          </View>

          <View style={styles.specRow}>
            <View style={styles.specBox}>
              <Text style={styles.label}>Bus Size</Text>
              <Text style={styles.value}>{architecture?.busSize ?? "-"}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.label}>Stack Size</Text>
              <Text style={styles.value}>{architecture?.stackSize ?? "-"}</Text>
            </View>
          </View>
        </View>

        {/* REGISTER FILE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Register File</Text>

          {/* GENERAL PURPOSE REGISTERS */}
          <Text style={styles.subSection}>● GENERAL PURPOSE REGISTERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Name</Text>
                <Text style={styles.headerCell}>Size</Text>
                <Text style={styles.headerCell}>Role</Text>
              </View>
              {generalRegisters.map((item, index) => (
                <View key={item.id ?? index} style={styles.tableRow}>
                  <Text style={styles.cellBlue}>{item.name}</Text>
                  <Text style={styles.cell}>{item.size}</Text>
                  <Text style={styles.cell}>{item.role}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* FLAG REGISTERS */}
          <Text style={[styles.subSection, { marginTop: 15 }]}>● FLAG REGISTERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Name</Text>
                <Text style={styles.headerCell}>Size</Text>
              </View>
              {flagRegisters.map((item, index) => (
                <View key={item.id ?? index} style={styles.tableRow}>
                  <Text style={styles.cellBlue}>{item.name}</Text>
                  <Text style={styles.cell}>{item.size}</Text>
                </View>
              ))}
            </View>
          </ScrollView>



        </View>

        {/* INSTRUCTION SET */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instruction Set</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Mnemonic</Text>
                <Text style={styles.headerCell}>Opcode</Text>
                <Text style={styles.headerCell}>Instruction</Text>
              </View>
              {instructions.map((item, index) => (
                <View key={item.id ?? index} style={styles.tableRow}>
                  <Text style={styles.cellBlue}>{item.mnemonic}</Text>
                  <Text style={styles.cell}>{item.opcode}</Text>
                  <Text style={styles.cell}>{item.set}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.totalText}>Total Instructions: {instructions.length}</Text>
        </View>

        {/* ACTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Action</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Mnemonic</Text>
                <Text style={styles.headerCell}>Action</Text>
              </View>
              {actions.map((item, index) => (
                <View key={item.id ?? index} style={styles.tableRow}>
                  <Text style={styles.cellBlue}>{item.mnemonic}</Text>
                  <Text style={styles.cell}>{item.action}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ADDRESSING MODES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Addressing Modes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Name</Text>
                <Text style={styles.headerCell}>Code</Text>
                <Text style={styles.headerCell}>Symbol</Text>
              </View>
              {addressingModes.map((item, index) => (
                <View key={item.id ?? index} style={styles.tableRow}>
                  <Text style={styles.cellBlue}>{item.name}</Text>
                  <Text style={styles.cell}>{item.code}</Text>
                  <Text style={styles.cell}>{item.symbol}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
};

export default Detailscreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "900",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  specBox: {
    width: "48%",
  },
  label: {
    fontSize: 12,
    color: "#64748B",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  subSection: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: screenWidth - 32,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerCell: {
    width: 120,
    padding: 10,
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  cell: {
    width: 120,
    padding: 10,
    fontSize: 13,
    textAlign: "center",
  },
  cellBlue: {
    width: 120,
    padding: 10,
    fontSize: 13,
    textAlign: "center",
    color: "#1E3A8A",
    fontWeight: "600",
  },
  totalText: {
    textAlign: "right",
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#1E3A8A",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
