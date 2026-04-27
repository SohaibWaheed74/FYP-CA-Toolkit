import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArchitectureContext } from "../context/ArchitectureContext";
import { executeProgram } from "../api/executionApi";
import { saveCodeFile, getCodeFiles, getCodeFileById } from "../api/codefile";

const EditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectedArchitecture: contextArchitecture } =
    useContext(ArchitectureContext);

  const selectedArchitecture =
    route?.params?.architecture || contextArchitecture;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const [fileNameInput, setFileNameInput] = useState("");
  const [cycles, setCycles] = useState(null);

  // =========================
  // RUN PROGRAM (FIXED)
  // =========================
  const handleRun = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please write some assembly code first.");
      return;
    }

    if (!selectedArchitecture?.ArchitectureID) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    try {
      setIsRunning(true);
      setError("");

      const programLines = code
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const result = await executeProgram(
        selectedArchitecture.ArchitectureID,
        programLines
      );

      const executionResult = {
        registers: result?.Registers || [],
        flags: result?.Flags || [],
        memory: result?.MemorySummary || {},
        stack: result?.StackSummary || {},
        errors: result?.Errors || [],
        success: result?.Success,
      };

      const registerVisualizationParams = {
        architectureId: selectedArchitecture.ArchitectureID,
        architecture: selectedArchitecture,
        executionResult: executionResult,

        registers:
          selectedArchitecture?.Registers ||
          selectedArchitecture?.registers ||
          selectedArchitecture?.ArchitectureRegisters ||
          selectedArchitecture?.architectureRegisters ||
          [],

        flags:
          selectedArchitecture?.Flags ||
          selectedArchitecture?.flags ||
          selectedArchitecture?.FlagRegisters ||
          selectedArchitecture?.flagRegisters ||
          selectedArchitecture?.ArchitectureFlags ||
          selectedArchitecture?.architectureFlags ||
          selectedArchitecture?.ArchitectureFlagRegisters ||
          selectedArchitecture?.architectureFlagRegisters ||
          [],
      };

      console.log("PASSING TO REGISTER VISUALIZATION:", registerVisualizationParams);

      navigation.getParent()?.navigate("RegistersVizTab", registerVisualizationParams);

    } catch (err) {
      console.log("ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Execution failed";

      setError(message);
    } finally {
      setIsRunning(false);
    }
  };

  // =========================
  // COMPARE
  // =========================
  const handleCompare = () => {
    navigation.navigate("Compare", {
      architectureId: selectedArchitecture?.ArchitectureID,
      architecture: selectedArchitecture,
    });
  };

  // =========================
  // STEP DEBUG
  // =========================
  const handleRunStep = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please write some assembly code first.");
      return;
    }

    if (!selectedArchitecture?.ArchitectureID) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    const programLines = code
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const debuggingParams = {
      architectureId: selectedArchitecture.ArchitectureID,
      architecture: selectedArchitecture,
      registers:
        selectedArchitecture?.Registers ||
        selectedArchitecture?.registers ||
        selectedArchitecture?.ArchitectureRegisters ||
        selectedArchitecture?.architectureRegisters ||
        [],
      flags:
        selectedArchitecture?.Flags ||
        selectedArchitecture?.flags ||
        selectedArchitecture?.FlagRegisters ||
        selectedArchitecture?.flagRegisters ||
        selectedArchitecture?.ArchitectureFlags ||
        selectedArchitecture?.architectureFlags ||
        [],
      program: programLines,
    };

    console.log("PASSING TO DEBUGGING:", debuggingParams);

    if (navigation.getState()?.routeNames?.includes("Debugging")) {
      navigation.navigate("Debugging", debuggingParams);
      return;
    }

    navigation.getParent()?.navigate("EditorTab", {
      screen: "Debugging",
      params: debuggingParams,
    });
  };

  // =========================
  // SAVE FILE
  // =========================
  const handleSave = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Nothing to save");
      return;
    }

    if (!selectedArchitecture?.ArchitectureID) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    setModalVisible(true);
  };

  const saveFile = async () => {
    if (!fileNameInput.trim()) {
      Alert.alert("Error", "Filename required");
      return;
    }

    if (!selectedArchitecture?.ArchitectureID) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    const fileNameWithExt = fileNameInput.trim().endsWith(".txt")
      ? fileNameInput.trim()
      : `${fileNameInput.trim()}.txt`;

    try {
      console.log("ARCHITECTURE ID:", selectedArchitecture.ArchitectureID);
      console.log("FILE NAME:", fileNameWithExt);
      console.log("CODE:", code);

      await saveCodeFile(
        selectedArchitecture.ArchitectureID,
        fileNameWithExt,
        code
      );

      setModalVisible(false);
      setFileNameInput("");
      Alert.alert("Success", `Saved to database as ${fileNameWithExt}`);
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to save code file");
    }
  };

  // =========================
  // CYCLE COUNT
  // =========================
  const handleCycleCount = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please write some assembly code first.");
      return;
    }

    const programLines = code
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let totalCycles = 0;

    programLines.forEach(line => {
      const instructionName = line.split(" ")[0].toUpperCase();

      const instruction = selectedArchitecture?.Instructions?.find(
        ins => ins.Mnemonics?.toUpperCase() === instructionName
      );

      totalCycles += instruction ? (instruction.InstructionFormat ?? 0) + 1 : 1;
    });

    setCycles(totalCycles);
  };

  // =========================
  // OPEN FILE FROM DATABASE
  // =========================
  const handleOpen = async () => {
    if (!selectedArchitecture?.ArchitectureID) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    try {
      const files = await getCodeFiles(selectedArchitecture.ArchitectureID);

      if (!files || files.length === 0) {
        Alert.alert("No Files", "No saved code files found for this architecture.");
        return;
      }

      setSavedFiles(files);
      setOpenModalVisible(true);
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to load saved files");
    }
  };

  const openSavedFile = async (fileId) => {
    try {
      const file = await getCodeFileById(fileId);

      setCode(file?.Code || file?.code || "");
      setOpenModalVisible(false);

      Alert.alert("Success", `Loaded ${file?.FileName || file?.fileName || "file"}`);
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to open code file");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <View style={styles.mainCard}>

          {/* TOOLBAR */}
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.runBtn} onPress={handleRun}>
              {isRunning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>▶ Run</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRunStep}>
              <Text style={styles.primaryText}>Run Step</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={handleSave}>
              <Text style={styles.outlineText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={handleOpen}>
              <Text style={styles.outlineText}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleCycleCount}>
              <Text style={styles.primaryText}>Count Cycles</Text>
            </TouchableOpacity>
          </View>

          {/* COMPARE */}
          <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
            <Text style={styles.compareButtonText}>Compare</Text>
          </TouchableOpacity>

          {/* EDITOR */}
          <View style={styles.editorBox}>
            <TextInput
              value={code}
              onChangeText={setCode}
              multiline
              placeholder="Write your assembly code..."
              placeholderTextColor="#A0AEC0"
              style={styles.editorInput}
            />
          </View>

          {/* ERROR */}
          <Text style={styles.errorTitle}>Error Display</Text>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error || "No Errors"}
            </Text>
          </View>

          {/* CYCLES */}
          {cycles !== null && (
            <View style={styles.cycleBox}>
              <Text style={styles.cycleTitle}>Clock Cycle Result</Text>
              <Text style={styles.cycleText}>
                Program executed in {cycles} cycles
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* SAVE MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Filename</Text>

            <TextInput
              value={fileNameInput}
              onChangeText={setFileNameInput}
              placeholder="example.txt"
              style={styles.modalInput}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveFile}>
                <Text style={{ color: "green" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OPEN MODAL */}
      <Modal visible={openModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Saved File</Text>

            <ScrollView style={{ maxHeight: 250 }}>
              {savedFiles.map((file, index) => (
                <TouchableOpacity
                  key={(file.FileID || file.fileID || index).toString()}
                  style={styles.fileItem}
                  onPress={() => openSavedFile(file.FileID || file.fileID)}
                >
                  <Text style={styles.fileNameText}>
                    {file.FileName || file.fileName || "Untitled File"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setOpenModalVisible(false)}>
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default EditorScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#EEF2F9" },

  wrapper: { padding: 14 },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3E8F2"
  },

  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginBottom: 10
  },

  runBtn: {
    backgroundColor: "#1F3C88",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6
  },

  primaryBtn: {
    backgroundColor: "#1F3C88",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600"
  },

  outlineBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1F3C88",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6
  },

  outlineText: {
    color: "#1F3C88",
    fontSize: 12,
    fontWeight: "600"
  },

  compareButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 12,
    elevation: 3
  },

  compareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },

  editorBox: {
    backgroundColor: "#F9FBFF",
    borderRadius: 10,
    padding: 10,
    minHeight: 360,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    marginBottom: 10
  },

  editorInput: {
    fontSize: 12,
    color: "#2C2F38",
    lineHeight: 18
  },

  errorTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
    marginTop: 2
  },

  errorBox: {
    backgroundColor: "#F4F7FD",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    minHeight: 55
  },

  errorText: {
    fontSize: 12,
    color: "#64748B"
  },

  cycleBox: {
    backgroundColor: "#E8F0FF",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1F3C88",
    alignItems: "center"
  },

  cycleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F3C88",
    marginBottom: 6
  },

  cycleText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500"
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%"
  },

  modalTitle: {
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 16
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 20
  },

  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  modalBtn: {
    padding: 10
  },

  fileItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB"
  },

  fileNameText: {
    fontSize: 14,
    color: "#1F3C88",
    fontWeight: "600"
  }
});