import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CpuDesign = ({ navigation }) => {
  // FORM STATES
  const [architectureName, setArchitectureName] = useState("");
  const [memorySize, setMemorySize] = useState("");
  const [busSize, setBusSize] = useState("");
  const [stackSize, setStackSize] = useState("");
  const [registerCount, setRegisterCount] = useState("");
  const [instructionCount, setInstructionCount] = useState("");

  // STORE SUBMITTED DATA
  const [submittedData, setSubmittedData] = useState([]);

  // Load data from AsyncStorage when component mounts/focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const data = await AsyncStorage.getItem("cpuData");

        if (data) {
          setSubmittedData(JSON.parse(data));
        } else {
          setSubmittedData([]);
        }

        setArchitectureName("");
        setMemorySize("");
        setBusSize("");
        setStackSize("");
        setRegisterCount("");
        setInstructionCount("");
      };

      loadData();
    }, [])
  );

  // ================= VALIDATION LOGIC =================
  const isPowerOfTwo = (n) => {
    if (isNaN(n) || n <= 0) return false;
    // Bitwise check to see if a number is a power of 2
    return (n & (n - 1)) === 0;
  };

  const validateInputs = () => {
    // 1. Check for empty fields
    if (
      !architectureName.trim() ||
      !memorySize.trim() ||
      !busSize.trim() ||
      !stackSize.trim() ||
      !registerCount.trim() ||
      !instructionCount.trim()
    ) {
      Alert.alert("Validation Error", "All fields are required. Please fill them out.");
      return false;
    }

    // 2. Extract numbers (removes letters like "B" or "-bit")
    const memNum = parseInt(memorySize.replace(/[^0-9]/g, ""), 10);
    const busNum = parseInt(busSize.replace(/[^0-9]/g, ""), 10);
    const stackNum = parseInt(stackSize.replace(/[^0-9]/g, ""), 10);

    // 3. Power of 2 Validations
    if (!isPowerOfTwo(memNum)) {
      Alert.alert("Validation Error", "Memory Size must be a power of 2 (e.g., 2, 4, 8, 16, 32, 64...).");
      return false;
    }

    if (!isPowerOfTwo(busNum)) {
      Alert.alert("Validation Error", "Bus Size must be a power of 2 (e.g., 2, 4, 8, 16, 32...).");
      return false;
    }

    if (!isPowerOfTwo(stackNum)) {
      Alert.alert("Validation Error", "Stack Size must be a power of 2 (e.g., 2, 4, 8, 16, 32...).");
      return false;
    }

    return true;
  };

  // ADD BUTTON HANDLER
  const handleAdd = async () => {
    if (!validateInputs()) return; // Stop if validation fails

    const cpuData = {
      architectureName,
      memorySize,
      busSize,
      stackSize,
      registerCount,
      instructionCount,
    };

    const newData = [...submittedData, cpuData];
    setSubmittedData(newData);

    await AsyncStorage.setItem("cpuData", JSON.stringify(newData));

    setArchitectureName("");
    setMemorySize("");
    setBusSize("");
    setStackSize("");
    setRegisterCount("");
    setInstructionCount("");
  };

  // NEXT BUTTON HANDLER
  const handleNext = () => {
    let cpuDataToSend;

    // Check if the user typed anything in the current form
    const isFormPartiallyFilled =
      architectureName.trim() ||
      memorySize.trim() ||
      busSize.trim() ||
      stackSize.trim() ||
      registerCount.trim() ||
      instructionCount.trim();

    if (isFormPartiallyFilled) {
      if (!validateInputs()) return; // Stop if validation fails

      cpuDataToSend = {
        architectureName,
        memorySize,
        busSize,
        stackSize,
        registerCount,
        instructionCount,
      };
    } else if (submittedData.length > 0) {
      // Form is empty but they already clicked "ADD" previously
      cpuDataToSend = submittedData[submittedData.length - 1];
    } else {
      Alert.alert("Error", "Please enter CPU design details first.");
      return;
    }

    navigation.navigate("RegisterDesign", { cpuData: cpuDataToSend });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>CPU Design</Text>

          <Text style={styles.label}>Architecture Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter architecture name"
            placeholderTextColor="black"
            value={architectureName}
            onChangeText={setArchitectureName}
            returnKeyType="next"
          />

          <Text style={styles.label}>Memory Size</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter memory size (e.g., 64 B)"
            placeholderTextColor="black"
            keyboardType="numeric"
            value={memorySize}
            onChangeText={setMemorySize}
            returnKeyType="next"
          />

          <Text style={styles.label}>Bus Size</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter bus size (e.g., 32-bit)"
            placeholderTextColor="black"
            keyboardType="numeric"
            value={busSize}
            onChangeText={setBusSize}
            returnKeyType="next"
          />

          <Text style={styles.label}>Stack Size</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter stack size (e.g., 16 B)"
            placeholderTextColor="black"
            keyboardType="numeric"
            value={stackSize}
            onChangeText={setStackSize}
            returnKeyType="next"
          />

          <Text style={styles.label}>No of Registers</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter no of registers"
            placeholderTextColor="black"
            keyboardType="numeric"
            value={registerCount}
            onChangeText={setRegisterCount}
            returnKeyType="next"
          />

          <Text style={styles.label}>No of Instructions</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter no of instructions"
            placeholderTextColor="black"
            keyboardType="numeric"
            value={instructionCount}
            onChangeText={setInstructionCount}
            returnKeyType="done"
          />

          {/* ADD BUTTON */}
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>

          {/* NEXT BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          {/* DISPLAY SUBMITTED DATA */}
          {submittedData.map((item, index) => (
            <View key={index} style={styles.submittedCard}>
              <Text style={styles.submittedText}>
                <Text style={styles.bold}>Architecture:</Text>{" "}
                {item.architectureName}
              </Text>
              <Text style={styles.submittedText}>
                <Text style={styles.bold}>Memory Size:</Text> {item.memorySize}
              </Text>
              <Text style={styles.submittedText}>
                <Text style={styles.bold}>Bus Size:</Text> {item.busSize}
              </Text>
              <Text style={styles.submittedText}>
                <Text style={styles.bold}>Stack Size:</Text> {item.stackSize}
              </Text>
              <Text style={styles.submittedText}>
                <Text style={styles.bold}>Registers:</Text>{" "}
                {item.registerCount?.toString()}
              </Text>
              <Text style={styles.submittedText}>
                <Text style={styles.bold}>Instructions:</Text>{" "}
                {item.instructionCount?.toString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CpuDesign;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  scroll: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
    paddingBottom: 160,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },

  title: {
    color: "#1f3c88",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#232323",
  },

  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#cfd6e4",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: "#fafcff",
    color: "#000",
  },

  addButton: {
    backgroundColor: "#1f3c88",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#1f3c88",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  submittedCard: {
    backgroundColor: "#eef1fc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },

  submittedText: {
    fontSize: 14,
    marginBottom: 2,
  },

  bold: {
    fontWeight: "bold",
  },
});