import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { updateArchitecture } from "../api/architectureApi";

const UpdateArchitectureScreen = ({ route }) => {
  // ✅ FIX: safe access (prevents crash)
  const architectureData = route?.params?.architectureData;

  // ================= STATE =================
  const [cpuData, setCpuData] = useState({});
  const [registerList, setRegisterList] = useState([]);
  const [addressingModes, setAddressingModes] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const [currentRegister, setCurrentRegister] = useState({});
  const [currentAddressing, setCurrentAddressing] = useState({});
  const [currentInstruction, setCurrentInstruction] = useState({});

  const [regIndex, setRegIndex] = useState(0);
  const [instIndex, setInstIndex] = useState(0);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (!architectureData) return;

    setCpuData(architectureData.cpu || {});
    setRegisterList(architectureData.registers || []);
    setAddressingModes(architectureData.addressingModes || []);
    setInstructions(architectureData.instructions || []);

    setCurrentRegister(architectureData.registers?.[0] || {});
    setCurrentInstruction(architectureData.instructions?.[0] || {});
  }, [architectureData]);

  // ================= NAVIGATION =================
  const nextRegister = () => {
    if (registerList.length === 0) return;
    const next = (regIndex + 1) % registerList.length;
    setRegIndex(next);
    setCurrentRegister(registerList[next]);
  };

  const nextInstruction = () => {
    if (instructions.length === 0) return;
    const next = (instIndex + 1) % instructions.length;
    setInstIndex(next);
    setCurrentInstruction(instructions[next]);
  };

  // ================= ADD =================
  const addRegister = () => {
    if (!currentRegister?.name) return;
    setRegisterList([...registerList, currentRegister]);
    setCurrentRegister({});
  };

  const addAddressing = () => {
    if (!currentAddressing?.mode) return;
    setAddressingModes([...addressingModes, currentAddressing]);
    setCurrentAddressing({});
  };

  const addInstruction = () => {
    if (!currentInstruction?.opcode) return;
    setInstructions([...instructions, currentInstruction]);
    setCurrentInstruction({});
  };

  // ================= UPDATE =================
  const handleFinalUpdate = async () => {
    try {
      const payload = {
        Name: cpuData.name,
        MemorySize: Number(cpuData.memorySize),
        StackSize: Number(cpuData.stackSize),
        BusSize: Number(cpuData.busSize),
        NumberOfRegisters: registerList.length,
        NumberOfInstructions: instructions.length,
      };

      await updateArchitecture(architectureData.ArchitectureID, payload);
      alert("Architecture updated successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ FIX: render guard (prevents hook mismatch)
  if (!architectureData) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit Architecture</Text>

      {/* ================= CPU ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CPU Design Configuration</Text>

        <Text style={styles.label}>Architecture Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter architecture name"
          value={cpuData.name || ""}
          onChangeText={(text) =>
            setCpuData({ ...cpuData, name: text })
          }
        />

        <Text style={styles.label}>Memory Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 64 B"
          value={cpuData.memorySize || ""}
          onChangeText={(text) =>
            setCpuData({ ...cpuData, memorySize: text })
          }
        />

        <Text style={styles.label}>Bus Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 32-bit"
          value={cpuData.busSize || ""}
          onChangeText={(text) =>
            setCpuData({ ...cpuData, busSize: text })
          }
        />

        <Text style={styles.label}>Stack Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 16 B"
          value={cpuData.stackSize || ""}
          onChangeText={(text) =>
            setCpuData({ ...cpuData, stackSize: text })
          }
        />
      </View>

      {/* ================= REGISTER ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Register Design Configuration</Text>

        <Text style={styles.label}>GP Register Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={currentRegister.name || ""}
          onChangeText={(text) =>
            setCurrentRegister({ ...currentRegister, name: text })
          }
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={nextRegister}>
            <Text style={styles.btnText}>NEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={addRegister}>
            <Text style={styles.btnText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= ADDRESSING ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Addressing Modes</Text>

        <Text style={styles.label}>Addressing Mode</Text>
        <TextInput
          style={styles.input}
          placeholder="Select Mode"
          value={currentAddressing.mode || ""}
          onChangeText={(text) =>
            setCurrentAddressing({
              ...currentAddressing,
              mode: text,
            })
          }
        />

        <Text style={styles.label}>Mode Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Select Code"
          value={currentAddressing.code || ""}
          onChangeText={(text) =>
            setCurrentAddressing({
              ...currentAddressing,
              code: text,
            })
          }
        />

        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Symbol"
          value={currentAddressing.symbol || ""}
          onChangeText={(text) =>
            setCurrentAddressing({
              ...currentAddressing,
              symbol: text,
            })
          }
        />

        <TouchableOpacity style={styles.primaryFullBtn} onPress={addAddressing}>
          <Text style={styles.btnText}>ADD</Text>
        </TouchableOpacity>
      </View>

      {/* ================= INSTRUCTION ================= */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Instruction Design Configuration
        </Text>

        <View style={styles.checkboxRow}>
          <Text>☐ Is Interrupt Instruction?</Text>
        </View>

        <Text style={styles.label}>OpCode</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 01"
          value={currentInstruction.opcode || ""}
          onChangeText={(text) =>
            setCurrentInstruction({
              ...currentInstruction,
              opcode: text,
            })
          }
        />

        <Text style={styles.label}>Mnemonic</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ADD"
          value={currentInstruction.mnemonic || ""}
          onChangeText={(text) =>
            setCurrentInstruction({
              ...currentInstruction,
              mnemonic: text,
            })
          }
        />

        <Text style={styles.label}>Instruction Action</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="// Write Java Code Here"
          multiline
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={nextInstruction}>
            <Text style={styles.btnText}>NEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={addInstruction}>
            <Text style={styles.btnText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= FINAL ================= */}
      <TouchableOpacity style={styles.finalBtn} onPress={handleFinalUpdate}>
        <Text style={styles.btnText}>Update Architecture</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UpdateArchitectureScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 15,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E3A8A",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#555",
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#F9FAFB",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  primaryBtn: {
    backgroundColor: "#1E3A8A",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },

  secondaryBtn: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },

  primaryFullBtn: {
    backgroundColor: "#1E3A8A",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },

  finalBtn: {
    backgroundColor: "#1E3A8A",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  checkboxRow: {
    marginVertical: 10,
  },
});