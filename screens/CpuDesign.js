import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import RegisterDesign from "./RegisterDesign";

const CpuDesign = ({ navigation }) => {
  // FORM STATES
  const [architectureName, setArchitectureName] = useState("");
  const [memorySize, setMemorySize] = useState("");
  const [busSize, setBusSize] = useState("");
  const [stackSize, setStackSize] = useState("");
  const [registerCount, setRegisterCount] = useState("");
  const [instructionCount, setInstructionCount] = useState("");


  // HANDLER
  const handleNext = () => {
    navigation.navigate("RegisterDesign", {
      cpuData: {
        architectureName,
        memorySize,
        busSize,
        stackSize,
        registerCount,
        instructionCount,
      },
    });
  };

  // RENDER
  return (
    <>
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

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

     
    </>
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
    fontSize: 20,
    fontWeight: "600",
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
  button: {
    backgroundColor: "#1f3c88",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
