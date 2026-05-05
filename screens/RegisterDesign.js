import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

  // ================= Registers =================
  const [flagRegisterName, setFlagRegisterName] = useState("");
  const [flagRegisterAction, setFlagRegisterAction] = useState("");
  const [gpRegisterName, setGpRegisterName] = useState("");

  const [flagRegisters, setFlagRegisters] = useState([]);
  const [gpRegisters, setGpRegisters] = useState([]);

  // ================= Addressing =================
  const [addrMode, setAddrMode] = useState("");
  const [addrCode, setAddrCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [addressingList, setAddressingList] = useState([]);

  const maxRegisters = parseInt(cpuData?.registerCount) || 0;
  const totalRegisters = flagRegisters.length + gpRegisters.length;
  const remainingRegisters = maxRegisters - totalRegisters;

  // ================= Common Validations =================
  const isRegisterLimitReached = () => {
    const currentTotal = flagRegisters.length + gpRegisters.length;

    if (maxRegisters <= 0) {
      Alert.alert(
        "Error",
        "No of Registers is missing or invalid from CPU Design."
      );
      return true;
    }

    if (currentTotal >= maxRegisters) {
      Alert.alert(
        "Limit Reached",
        `You can only add ${maxRegisters} registers in total as defined in CPU Design.`
      );
      return true;
    }

    return false;
  };

  const isDuplicateRegister = (name) => {
    const newName = name.trim().toLowerCase();

    const existsInGP = gpRegisters.some(
      (gp) => gp.trim().toLowerCase() === newName
    );

    const existsInFlag = flagRegisters.some(
      (flag) => flag.name.trim().toLowerCase() === newName
    );

    if (existsInGP || existsInFlag) {
      Alert.alert("Duplicate Register", "This register name already exists.");
      return true;
    }

    return false;
  };

  // ================= Add Flag Register =================
  const addFlagRegister = () => {
    if (!flagRegisterName.trim()) {
      Alert.alert(
        "Flag Register Optional",
        "Flag register create karna optional hai. Agar create karna hai to flag register name enter karein, warna direct Next press kar dein."
      );
      return;
    }

    if (isRegisterLimitReached()) {
      return;
    }

    if (isDuplicateRegister(flagRegisterName)) {
      return;
    }

    const newFlagRegister = {
      name: flagRegisterName.trim(),
      action: flagRegisterAction.trim() || "",
      isFlagRegister: true,
    };

    setFlagRegisters((prev) => [...prev, newFlagRegister]);

    setFlagRegisterName("");
    setFlagRegisterAction("");
  };

  // ================= Add GP Register =================
  const addGpRegister = () => {
    if (!gpRegisterName.trim()) {
      Alert.alert("Error", "Please enter GP register name.");
      return;
    }

    if (isRegisterLimitReached()) {
      return;
    }

    if (isDuplicateRegister(gpRegisterName)) {
      return;
    }

    setGpRegisters((prev) => [...prev, gpRegisterName.trim()]);
    setGpRegisterName("");
  };

  // ================= Add Addressing Mode =================
  const addAddressingMode = () => {
    if (!addrMode || !addrCode || !symbol.trim()) {
      Alert.alert(
        "Error",
        "Please select addressing mode, code and enter symbol."
      );
      return;
    }

    const newMode = {
      mode: addrMode,
      code: addrCode,
      symbol: symbol.trim(),
    };

    setAddressingList((prev) => [...prev, newMode]);

    setAddrMode("");
    setAddrCode("");
    setSymbol("");
  };

  // ================= Next =================
  const handleNext = () => {
    // IMPORTANT:
    // Backend ke liye PascalCase keys bhej rahe hain:
    // Name, Action, IsFlagRegister
    const registers = [
      ...flagRegisters.map((flag) => ({
        Name: flag.name,
        Action: flag.action || "",
        IsFlagRegister: true,
      })),

      ...gpRegisters.map((gp) => ({
        Name: gp,
        Action: "",
        IsFlagRegister: false,
      })),
    ];

    console.log("REGISTER DESIGN FINAL REGISTERS:", JSON.stringify(registers, null, 2));

    navigation.navigate("InstructionDesign", {
      cpuData,

      // New combined list for DB/API
      registers,

      // Old separate lists also sending, taake next screen break na ho
      flagRegisters,
      gpRegisters,

      addressingList,
    });
  };

  // ================= UI =================
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Register Design</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Register Count Info */}
        {/* <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Total Registers Allowed: {maxRegisters}
          </Text>

          <Text style={styles.infoText}>
            Added Registers: {totalRegisters}
          </Text>

          <Text style={styles.infoText}>
            Remaining Registers:{" "}
            {remainingRegisters < 0 ? 0 : remainingRegisters}
          </Text>
        </View> */}

        {/* -------- Flag Register -------- */}
        <Text style={styles.label}>Flag Register Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Flag register name"
          placeholderTextColor="black"
          value={flagRegisterName}
          onChangeText={setFlagRegisterName}
          returnKeyType="next"
        />

        <Text style={styles.label}>Flag Register Action</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="// Write Java Code Here for Logic of Flag Register"
          placeholderTextColor="black"
          value={flagRegisterAction}
          onChangeText={setFlagRegisterAction}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.addBtn} onPress={addFlagRegister}>
          <Text style={styles.btnText}>ADD FLAG REGISTER</Text>
        </TouchableOpacity>

        {flagRegisters.map((flag, index) => (
          <View key={`flag-${index}`} style={styles.card}>
            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Flag Register:</Text> {flag.name}
            </Text>

            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Action:</Text>{" "}
              {flag.action ? flag.action : "No action"}
            </Text>

            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Is Flag Register:</Text>{" "}
              {flag.isFlagRegister ? "True" : "False"}
            </Text>
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
          returnKeyType="done"
        />

        <TouchableOpacity style={styles.addBtn} onPress={addGpRegister}>
          <Text style={styles.btnText}>ADD GP REGISTER</Text>
        </TouchableOpacity>

        {gpRegisters.map((gp, index) => (
          <View key={`gp-${index}`} style={styles.card}>
            <Text style={styles.submittedText}>
              <Text style={styles.bold}>GP Register:</Text> {gp}
            </Text>

            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Is Flag Register:</Text> False
            </Text>
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
          value={addrMode || null}
          onChange={(item) => setAddrMode(item.value)}
        />

        <Text style={styles.label}>Addressing Mode Code</Text>
        <Dropdown
          style={styles.dropdown}
          data={addressingCodes}
          labelField="label"
          valueField="value"
          placeholder="Select Addressing Mode Code"
          value={addrCode || null}
          onChange={(item) => setAddrCode(item.value)}
        />

        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Symbol"
          placeholderTextColor="black"
          value={symbol}
          onChangeText={setSymbol}
          returnKeyType="done"
        />

        <TouchableOpacity style={styles.addBtn} onPress={addAddressingMode}>
          <Text style={styles.btnText}>ADD ADDRESSING MODE</Text>
        </TouchableOpacity>

        {addressingList.map((addr, index) => (
          <View key={`addr-${index}`} style={styles.card}>
            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Mode:</Text> {addr.mode}
            </Text>

            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Code:</Text> {addr.code}
            </Text>

            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Symbol:</Text> {addr.symbol}
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterDesign;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

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

  scroll: {
    flex: 1,
  },

  container: {
    padding: 20,
    backgroundColor: "#f5f6fa",
    paddingTop: 10,
    paddingBottom: 140,
  },

  infoCard: {
    backgroundColor: "#eef1fc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#cfd6e4",
  },

  infoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 3,
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
    color: "#000",
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

  submittedText: {
    fontSize: 14,
    marginBottom: 2,
  },

  bold: {
    fontWeight: "bold",
  },
});