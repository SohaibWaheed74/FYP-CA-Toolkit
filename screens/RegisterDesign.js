import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";


const addressingModes = [
  { label: "Direct Addressing Mode", value: "Direct" },
  { label: "Indirect Addressing Mode", value: "Indirect" },
  { label: "Indexed Addressing Mode", value: "Indexed" },
];

const addressingCodes = [
  { label: "00", value: "00" },
  { label: "01", value: "01" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
];

const RegisterDesign = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { cpuData } = route.params || {};

  /* ================= Registers ================= */
  const [flagRegisterName, setFlagRegisterName] = useState("");
  const [flagRegisterAction, setFlagRegisterAction] = useState("");
  const [gpRegisterName, setGpRegisterName] = useState("");

  const [flagRegisters, setFlagRegisters] = useState([]);
  const [gpRegisters, setGpRegisters] = useState([]);

  /* ================= Addressing ================= */
  const [addrMode, setAddrMode] = useState(null);
  const [addrCode, setAddrCode] = useState(null);
  const [symbol, setSymbol] = useState("");

  const [addressingList, setAddressingList] = useState([]);

  /* ================= Functions ================= */
  const addFlagRegister = () => {
    if (!flagRegisterName || !flagRegisterAction) return;

    const newFlag = { name: flagRegisterName, action: flagRegisterAction };
    setFlagRegisters([...flagRegisters, newFlag]);

    setFlagRegisterName("");
    setFlagRegisterAction("");
  };

  const addGpRegister = () => {
    if (!gpRegisterName) return;

    setGpRegisters([...gpRegisters, gpRegisterName]);
    setGpRegisterName("");
  };

  const addAddressingMode = () => {
    if (!addrMode || !addrCode || !symbol) return;

    const newAddr = { mode: addrMode, code: addrCode, symbol };
    setAddressingList([...addressingList, newAddr]);

    setAddrMode(null);
    setAddrCode(null);
    setSymbol("");
  };

  const handleNext = () => {
    navigation.navigate("InstructionDesign", {
      cpuData,
      flagRegisters,
      gpRegisters,
      addressingList,
    });
  };

  /* ================= UI ================= */
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Design</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* -------- Flag Register -------- */}
        <Text style={styles.label}>Flag Register Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Flag register name"
          placeholderTextColor="black"
          value={flagRegisterName}
          onChangeText={setFlagRegisterName}
        />

        <Text style={styles.label}>Flag Register Action</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="// Write Java Code Here for Logic of Flag Register"
          placeholderTextColor="black"
          value={flagRegisterAction}
          onChangeText={setFlagRegisterAction}
          multiline
        />

        <TouchableOpacity style={styles.addBtn} onPress={addFlagRegister}>
          <Text style={styles.btnText}>ADD</Text>
        </TouchableOpacity>

        {/* Display Flag Registers */}
        {flagRegisters.map((flag, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Name: {flag.name}</Text>
            <Text>Action: {flag.action}</Text>
          </View>
        ))}

        {/* -------- GP Register -------- */}
        <Text style={styles.label}>GP Register Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter register name"
          placeholderTextColor="black"
          value={gpRegisterName}
          onChangeText={setGpRegisterName}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addGpRegister}>
          <Text style={styles.btnText}>ADD</Text>
        </TouchableOpacity>

        {/* Display GP Registers */}
        {gpRegisters.map((gp, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{gp}</Text>
          </View>
        ))}

        {/* -------- Addressing Modes -------- */}
        <Text style={styles.sectionTitle}>Add Addressing Modes</Text>

        <Text style={styles.label}>Addressing Mode</Text>
        <Dropdown
          style={styles.dropdown}
          data={addressingModes}
          labelField="label"
          valueField="value"
          placeholder="Select addressing mode"
          value={addrMode}
          onChange={(item) => setAddrMode(item.value)}
        />

        <Text style={styles.label}>Addressing Mode Code</Text>
        <Dropdown
          style={styles.dropdown}
          data={addressingCodes}
          labelField="label"
          valueField="value"
          placeholder="Select Addressing Mode Code"
          value={addrCode}
          onChange={(item) => setAddrCode(item.value)}
        />

        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Symbol"
          placeholderTextColor="black"
          value={symbol}
          onChangeText={setSymbol}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addAddressingMode}>
          <Text style={styles.btnText}>ADD</Text>
        </TouchableOpacity>

        {/* Display Addressing Modes */}
        {addressingList.map((addr, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Mode: {addr.mode}</Text>
            <Text>Code: {addr.code}</Text>
            <Text>Symbol: {addr.symbol}</Text>
          </View>
        ))}

        {/* -------- Next -------- */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RegisterDesign;

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    color: "#1E3A8A",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "#f5f6fa",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  label: {
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#1f3c88",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  nextBtn: {
    backgroundColor: "#1f3c88",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 30,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
