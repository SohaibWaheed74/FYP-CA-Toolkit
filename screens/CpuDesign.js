import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

  // Load data from AsyncStorage when component mounts
  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem("cpuData");
      if (data) setSubmittedData(JSON.parse(data));
    };
    loadData();
  }, []);

  // ADD BUTTON HANDLER
  const handleAdd = async () => {
    const cpuData = {
      architectureName,
      memorySize,
      busSize,
      stackSize,
      registerCount,
      instructionCount,
    };

    // Add to submittedData array
    const newData = [...submittedData, cpuData];
    setSubmittedData(newData);

    // Save to AsyncStorage
    await AsyncStorage.setItem("cpuData", JSON.stringify(newData));
  };

  // NEXT BUTTON HANDLER
  const handleNext = () => {
    const cpuData = {
      architectureName,
      memorySize,
      busSize,
      stackSize,
      registerCount,
      instructionCount,
    };

    // Navigate to next screen with current form data
    navigation.navigate("RegisterDesign", { cpuData });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>CPU Design</Text>

        <Text style={styles.label}>Architecture Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter architecture name"
          placeholderTextColor="black"
          value={architectureName}
          onChangeText={setArchitectureName}
        />

        <Text style={styles.label}>Memory Size</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter memory size (e.g., 64 B)"
          placeholderTextColor="black"
          value={memorySize}
          onChangeText={setMemorySize}
        />

        <Text style={styles.label}>Bus Size</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter bus size (e.g., 32-bit)"
          placeholderTextColor="black"
          value={busSize}
          onChangeText={setBusSize}
        />

        <Text style={styles.label}>Stack Size</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter stack size (e.g., 16 B)"
          placeholderTextColor="black"
          value={stackSize}
          onChangeText={setStackSize}
        />

        <Text style={styles.label}>No of Registers</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter no of registers"
          placeholderTextColor="black"
          keyboardType="numeric"
          value={registerCount}
          onChangeText={setRegisterCount}
        />

        <Text style={styles.label}>No of Instructions</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter no of instructions"
          placeholderTextColor="black"
          keyboardType="numeric"
          value={instructionCount}
          onChangeText={setInstructionCount}
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
              <Text style={styles.bold}>Architecture:</Text> {item.architectureName}
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
              <Text style={styles.bold}>Registers:</Text> {item.registerCount.toString()}
            </Text>
            <Text style={styles.submittedText}>
              <Text style={styles.bold}>Instructions:</Text> {item.instructionCount.toString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CpuDesign;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
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
