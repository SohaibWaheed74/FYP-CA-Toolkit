import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const Detailscreen = () => {
  const navigation = useNavigation();

  const [architecture, setArchitecture] = useState(null);
  const [flagRegisters, setFlagRegisters] = useState([]);
  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [actions, setActions] = useState([]);
  const [addressingModes, setAddressingModes] = useState([]);

  useEffect(() => {
    const dummyApiResponse = {
      architecture: {
        name: "Architecture1",
        memorySize: "128 Bytes",
        busSize: "8-bit",
        stackSize: "16 Bytes",
      },
      flagRegisters: [
        { id: 1, name: "Zero", size: "1-bit" },
        { id: 2, name: "Carry", size: "1-bit" },
      ],
      generalRegisters: [
        { id: 1, name: "R1", size: "16-bit", role: "General Purpose" },
        { id: 2, name: "R2", size: "16-bit", role: "General Purpose" },
        { id: 3, name: "R3", size: "16-bit", role: "General Purpose" },
        { id: 4, name: "R4", size: "16-bit", role: "General Purpose" },
      ],
      instructions: [
        { id: 1, mnemonic: "LOAD", opcode: "10100001", set: "LOAD -> M[addr]" },
        { id: 2, mnemonic: "STORE", opcode: "10100010", set: "STORE -> M[addr]" },
        { id: 3, mnemonic: "ADD", opcode: "11000011", set: "ADD -> R1, R2" },
        { id: 4, mnemonic: "SUB", opcode: "11001000", set: "SUB -> R3, R4" },
      ],
      actions: [
        { id: 1, mnemonic: "LOAD", action: "R[dr] <- M[addr]" },
        { id: 2, mnemonic: "STORE", action: "M[addr] <- R[sr]" },
        { id: 3, mnemonic: "ADD", action: "R[dr] <- R[sr1] + R[sr2]" },
        { id: 4, mnemonic: "SUB", action: "R[dr] <- R[sr1] - R[sr2]" },
      ],
      addressingModes: [
        { id: 1, name: "Direct", instruction: "LOAD $10" },
        { id: 2, name: "Indirect", instruction: "LOAD &10" },
        { id: 3, name: "Indexed", instruction: "LOAD *10" },
      ],
    };

    setArchitecture(dummyApiResponse.architecture);
    setFlagRegisters(dummyApiResponse.flagRegisters);
    setGeneralRegisters(dummyApiResponse.generalRegisters);
    setInstructions(dummyApiResponse.instructions);
    setActions(dummyApiResponse.actions);
    setAddressingModes(dummyApiResponse.addressingModes);
  }, []);

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
              <Text style={styles.value}>
                {architecture?.name ?? "-"}
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.label}>Memory Size</Text>
              <Text style={styles.value}>
                {architecture?.memorySize ?? "-"}
              </Text>
            </View>
          </View>

          <View style={styles.specRow}>
            <View style={styles.specBox}>
              <Text style={styles.label}>Bus Size</Text>
              <Text style={styles.value}>
                {architecture?.busSize ?? "-"}
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.label}>Stack Size</Text>
              <Text style={styles.value}>
                {architecture?.stackSize ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* REGISTER FILE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Register File</Text>

          <Text style={styles.subSection}>● FLAG REGISTERS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Size</Text>
            </View>

            {flagRegisters.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.size}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.subSection, { marginTop: 15 }]}>
            ● GENERAL PURPOSE REGISTERS
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Size</Text>
              <Text style={styles.headerCell}>Role</Text>
            </View>

            {generalRegisters.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cellBlue}>{item.name}</Text>
                <Text style={styles.cell}>{item.size}</Text>
                <Text style={styles.cell}>{item.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* INSTRUCTION SET */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instruction Set</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Mnemonic</Text>
              <Text style={styles.headerCell}>Opcode</Text>
              <Text style={styles.headerCell}>Instruction</Text>
            </View>

            {instructions.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cellBlue}>{item.mnemonic}</Text>
                <Text style={styles.cell}>{item.opcode}</Text>
                <Text style={styles.cell}>{item.set}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.totalText}>
            Total Instructions: {instructions.length}
          </Text>
        </View>

        {/* ACTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Action</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Mnemonic</Text>
              <Text style={styles.headerCell}>Action</Text>
            </View>

            {actions.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cellBlue}>{item.mnemonic}</Text>
                <Text style={styles.cell}>{item.action}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ADDRESSING MODES */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Addressing Modes</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Instruction</Text>
            </View>

            {addressingModes.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cellBlue}>{item.name}</Text>
                <Text style={styles.cell}>{item.instruction}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default Detailscreen;

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
    gap: 6,
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
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerCell: {
    flex: 2,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
  },
  cell: {
    flex: 1.5,
    textAlign: "center",
    fontSize: 13,
  },
  cellBlue: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  totalText: {
    textAlign: "right",
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
});
