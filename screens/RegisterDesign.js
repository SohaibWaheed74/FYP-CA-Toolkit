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
import { useNavigation } from "@react-navigation/native";

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

    setFlagRegisters([
      ...flagRegisters,
      {
        name: flagRegisterName,
        action: flagRegisterAction,
      },
    ]);

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

    setAddressingList([
      ...addressingList,
      {
        mode: addrMode,
        code: addrCode,
        symbol: symbol,
      },
    ]);

    setAddrMode(null);
    setAddrCode(null);
    setSymbol("");
  };

  const handleNext = () => {
    navigation.navigate("InstructionDesign", {
      flagRegisters,
      gpRegisters,
      addressingList,
    });
  };

  /* ================= UI ================= */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register Design</Text>

      {/* -------- Flag Register -------- */}
      <Text style={styles.label}>Flag Register Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Flag register name"
        value={flagRegisterName}
        onChangeText={setFlagRegisterName}
      />

      <Text style={styles.label}>Flag Register Action</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="// Write Java Code Here for Logic of Flag Register"
        value={flagRegisterAction}
        onChangeText={setFlagRegisterAction}
        multiline
      />

      <TouchableOpacity style={styles.addBtn} onPress={addFlagRegister}>
        <Text style={styles.btnText}>ADD</Text>
      </TouchableOpacity>

      {/* -------- GP Register -------- */}
      <Text style={styles.label}>GP Register Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter register name"
        value={gpRegisterName}
        onChangeText={setGpRegisterName}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addGpRegister}>
        <Text style={styles.btnText}>ADD</Text>
      </TouchableOpacity>

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
        placeholder="Select Addressing Modes Code"
        value={addrCode}
        onChange={(item) => setAddrCode(item.value)}
      />

      <Text style={styles.label}>Symbol</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Symbol"
        value={symbol}
        onChangeText={setSymbol}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addAddressingMode}>
        <Text style={styles.btnText}>ADD</Text>
      </TouchableOpacity>

      {/* -------- Next -------- */}
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.btnText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterDesign;

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f6fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1f3c88",
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
});
