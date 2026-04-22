import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { executeProgram } from "../api/executionApi";


const EditScreen = () => {
  const navigation = useNavigation();

  /* ================= CPU STATES ================= */
  const [architectureName, setArchitectureName] = useState("");
  const [memorySize, setMemorySize] = useState("");
  const [busSize, setBusSize] = useState("");
  const [stackSize, setStackSize] = useState("");
  const [registerCount, setRegisterCount] = useState("");
  const [instructionCount, setInstructionCount] = useState("");

  /* ================= REGISTER STATES ================= */
  const [flagName, setFlagName] = useState("");
  const [flagAction, setFlagAction] = useState("");
  const [generalRegister, setGeneralRegister] = useState("");

  /* ================= ADDRESSING MODE STATES ================= */
  const [addressingMode, setAddressingMode] = useState(null);
  const [addressingCode, setAddressingCode] = useState(null);
  const [addressingSymbol, setAddressingSymbol] = useState("");

  /* ================= INSTRUCTION STATES ================= */
  const [isInterrupt, setIsInterrupt] = useState(false);
  const [operationCode, setOperationCode] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [microOperation, setMicroOperation] = useState("");

  const [interruptSymbol, setInterruptSymbol] = useState(null);
  const [inputRegister, setInputRegister] = useState(null);
  const [outputRegister, setOutputRegister] = useState(null);

  const [operands, setOperands] = useState([
    { id: 1, type: "Register", isDestination: true },
  ]);

  /* ================= DROPDOWN DATA ================= */

  const addressingModeData = [
    { label: "Immediate", value: "Immediate" },
    { label: "Direct", value: "Direct" },
    { label: "Indirect", value: "Indirect" },
  ];

  const addressingCodeData = [
    { label: "00", value: "00" },
    { label: "01", value: "01" },
    { label: "10", value: "10" },
  ];

  const OPERAND_TYPES = [
    { label: "Register", value: "Register" },
    { label: "Immediate", value: "Immediate" },
    { label: "Memory", value: "Memory" },
  ];

  const INTERRUPT_SYMBOLS = [
    { label: "1(Input)", value: "1(Input)" },
    { label: "2(Output)", value: "2(Output)" },
  ];

  const registers = [
    { label: "R1", value: "R1" },
    { label: "R2", value: "R2" },
  ];

  /* ================= OPERAND FUNCTIONS ================= */

  const addOperand = () => {
    setOperands(prev => [
      ...prev,
      { id: prev.length + 1, type: "Register", isDestination: false },
    ]);
  };

  const updateOperandType = (id, type) => {
    setOperands(prev =>
      prev.map(op => (op.id === id ? { ...op, type } : op))
    );
  };

  const selectDestination = id => {
    setOperands(prev =>
      prev.map(op => ({ ...op, isDestination: op.id === id }))
    );
  };

  const deleteOperand = id => {
    if (operands.length === 1) return;

    let updated = operands.filter(op => op.id !== id);

    if (!updated.some(op => op.isDestination)) {
      updated[0].isDestination = true;
    }

    setOperands(updated);
  };

  /* ================= HANDLERS ================= */

  const handleAddCPU = () => {
    if (!architectureName) {
      Alert.alert("Validation", "Architecture Name is required");
      return;
    }
    Alert.alert("Success", "CPU Design Added");
  };

  const handleUpdateArchitecture = () => {
    const architectureData = {
      architectureName,
      memorySize,
      busSize,
      stackSize,
      registerCount,
      instructionCount,
      flagName,
      flagAction,
      generalRegister,
      addressingMode,
      addressingCode,
      addressingSymbol,
      isInterrupt,
      operationCode,
      mnemonic,
      operands: isInterrupt ? [] : operands,
      interruptSymbol,
      inputRegister,
      outputRegister,
      microOperation,
    };

    console.log("Updated Architecture:", architectureData);
    Alert.alert("Success", "Architecture Updated Successfully");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Architecture</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>

        {/* ================= CPU DESIGN ================= */}
        <Card title="CPU DESIGN">

          <Text style={styles.label}>Architecture Name</Text>
          <TextInput style={styles.input} value={architectureName} onChangeText={setArchitectureName} placeholder="Enter Architecture Name" placeholderTextColor="black" />

          <Text style={styles.label}>Memory Size</Text>
          <TextInput style={styles.input} value={memorySize} onChangeText={setMemorySize} placeholder="Enter Memory Size" placeholderTextColor="black" />

          <Text style={styles.label}>Bus Size</Text>
          <TextInput style={styles.input} value={busSize} onChangeText={setBusSize} placeholder="Enter Bus Size" placeholderTextColor="black" />

          <Text style={styles.label}>Stack Size</Text>
          <TextInput style={styles.input} value={stackSize} onChangeText={setStackSize} placeholder="Enter Stack Size" placeholderTextColor="black" />

          <Text style={styles.label}>No of Registers</Text>
          <TextInput style={styles.input} value={registerCount} onChangeText={setRegisterCount} placeholder="Enter No of Registers" placeholderTextColor="black" />

          <Text style={styles.label}>No of Instructions</Text>
          <TextInput style={styles.input} value={instructionCount} onChangeText={setInstructionCount} placeholder="Enter No of Instructions" placeholderTextColor="black" />

          <FullButton text="Add" onPress={handleAddCPU} />
        </Card>

        {/* ================= REGISTER DESIGN ================= */}
        <Card title="Register Design">

          <Text style={styles.label}>Flag Register Name</Text>
          <TextInput style={styles.input} value={flagName} onChangeText={setFlagName} placeholder="Enter Flag Register Name" placeholderTextColor="black" />

          <Text style={styles.label}>Flag Register Action</Text>
          <TextInput style={styles.textArea} multiline value={flagAction} onChangeText={setFlagAction} placeholder="Enter Flag Register Action" placeholderTextColor="black" />

          <RowButtons />

          <Text style={styles.label}>General Purpose Register Name</Text>
          <TextInput style={styles.input} value={generalRegister} onChangeText={setGeneralRegister} placeholder="Enter General Purpose Register Name" placeholderTextColor="black" />

          <RowButtons />
        </Card>

        {/* ================= ADDRESSING MODES ================= */}
        <Card title="Add Addressing Modes">

          <DropdownField label="Addressing Mode" data={addressingModeData} value={addressingMode} onChange={setAddressingMode} />
          <DropdownField label="Addressing Mode Code" data={addressingCodeData} value={addressingCode} onChange={setAddressingCode} />

          <Text style={styles.label}>Addressing Mode Symbol</Text>
          <TextInput style={styles.input} value={addressingSymbol} onChangeText={setAddressingSymbol} placeholder="Enter Addressing Mode Symbol" placeholderTextColor="black" />

          <FullButton text="Add" />
        </Card>

        {/* ================= INSTRUCTION DESIGN ================= */}
        <Card title="Instruction Design">

          <View style={styles.checkboxRow}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setIsInterrupt(!isInterrupt)}>
              {isInterrupt && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <Text style={{ marginLeft: 10 }}>Interrupt Instruction</Text>
          </View>

          <Text style={styles.label}>Operation Code</Text>
          <TextInput style={styles.input} value={operationCode} onChangeText={setOperationCode} placeholder="Enter Operation Code" placeholderTextColor="black" />

          <Text style={styles.label}>Mnemonic</Text>
          <TextInput style={styles.input} value={mnemonic} onChangeText={setMnemonic} placeholder="Enter Mnemonic" placeholderTextColor="black" />

          {!isInterrupt && (
            <>
              <Text style={styles.label}>Operands</Text>

              {operands.map((op, index) => (
                <View key={op.id} style={styles.operandRow}>
                  <Text style={{ width: 80 }}>Operand {index + 1}</Text>

                  <Dropdown
                    style={styles.dropdownSmall}
                    data={OPERAND_TYPES}
                    labelField="label"
                    valueField="value"
                    value={op.type}
                    onChange={(item) => updateOperandType(op.id, item.value)}
                  />

                  <TouchableOpacity
                    style={[styles.radio, op.isDestination && styles.radioSelected]}
                    onPress={() => selectDestination(op.id)}
                  />

                  {operands.length > 1 && (
                    <TouchableOpacity onPress={() => deleteOperand(op.id)}>
                      <Text style={{ fontSize: 18, marginLeft: 5 }}>🗑</Text>
                    </TouchableOpacity>
                  )}

                  {index === operands.length - 1 && (
                    <TouchableOpacity onPress={addOperand}>
                      <Text style={{ fontSize: 22, marginLeft: 5 }}>＋</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          )}

          {isInterrupt && (
            <>
              <DropdownField label="Interrupt" data={INTERRUPT_SYMBOLS} value={interruptSymbol} onChange={setInterruptSymbol} />
              <DropdownField label="Input Register" data={registers} value={inputRegister} onChange={setInputRegister} />
              <DropdownField label="Output Register" data={registers} value={outputRegister} onChange={setOutputRegister} />
            </>
          )}

          <Text style={styles.label}>Micro-Operation</Text>
          <TextInput style={styles.textArea} multiline value={microOperation} onChangeText={setMicroOperation} placeholder="Enter Micro-Operation" placeholderTextColor="black" />

          <RowButtons />

          <FullButton text="Update Architecture" onPress={handleUpdateArchitecture} />
        </Card>

      </ScrollView>
    </View>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const DropdownField = ({ label, data, value, onChange }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Dropdown
      style={styles.dropdown}
      data={data}
      labelField="label"
      valueField="value"
      value={value}
      placeholder={`Select ${label}`}
      onChange={(item) => onChange(item.value)}
    />
  </>
);

const FullButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.fullButton} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const RowButtons = () => (
  <View style={styles.row}>
    <TouchableOpacity style={styles.halfButton}>
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.halfButton}>
      <Text style={styles.buttonText}>Add</Text>
    </TouchableOpacity>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    height: 55,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1E3A8A",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    height: 100,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownSmall: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 8,
    width: 120,
    marginHorizontal: 5,
  },
  operandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 9,
    borderColor: "#2e4a9e",
  },
  radioSelected: {
    backgroundColor: "#2e4a9e",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  halfButton: {
    backgroundColor: "#2e4a9e",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  fullButton: {
    backgroundColor: "#2e4a9e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#2e4a9e",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#2e4a9e",
  },
});

export default EditScreen;