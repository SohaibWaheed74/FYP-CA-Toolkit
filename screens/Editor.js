import React, { useState, useContext, useRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { ArchitectureContext } from "../context/ArchitectureContext";
import { executeProgram } from "../api/executionApi";
import { saveCodeFile, getCodeFiles, getCodeFileById } from "../api/codefile";
import { getInstructionsByArchitectureId } from "../api/instructionApi";
import { calculateCountCycleByArchitectureId } from "../utils/CountCycle";
import { buildCycleAnimationTrace } from "../utils/cycleAnimationTrace";
import { getArchitectureDetails } from "../api/architectureApi";

import CycleAnimationScreen from "./CycleAnimationScreen";

const EditorScreen = () => {
  // =========================
  // ALL HOOKS AT TOP
  // =========================
  const navigation = useNavigation();
  const route = useRoute();
  const scrollRef = useRef(null);

  const {
    selectedArchitecture: contextArchitecture,
    updateMemoryFromExecutionResult,
  } = useContext(ArchitectureContext);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const [fileNameInput, setFileNameInput] = useState("");
  const [cycles, setCycles] = useState(null);

  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintCode, setHintCode] = useState("");
  const [hintMnemonics, setHintMnemonics] = useState([]);
  const [hintRegisters, setHintRegisters] = useState([]);

  const [animationVisible, setAnimationVisible] = useState(false);
  const [cycleTrace, setCycleTrace] = useState([]);
  const [animationArchitectureName, setAnimationArchitectureName] =
    useState("Selected Architecture");

  // =========================
  // SELECTED ARCHITECTURE
  // =========================
  const selectedArchitecture =
    route?.params?.architecture || contextArchitecture;

  const architectureId =
    selectedArchitecture?.ArchitectureID ||
    selectedArchitecture?.architectureID ||
    selectedArchitecture?.architectureId ||
    selectedArchitecture?.id;

  const scrollToEditor = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: 120,
        animated: true,
      });
    }, 300);
  };

  // =========================
  // HINT HELPERS
  // =========================
  const asArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (value?.Instructions && Array.isArray(value.Instructions)) {
      return value.Instructions;
    }

    if (value?.instructions && Array.isArray(value.instructions)) {
      return value.instructions;
    }

    if (value?.Registers && Array.isArray(value.Registers)) {
      return value.Registers;
    }

    if (value?.registers && Array.isArray(value.registers)) {
      return value.registers;
    }

    return [];
  };

  const getArchitectureName = () => {
    return (
      selectedArchitecture?.Name ||
      selectedArchitecture?.name ||
      selectedArchitecture?.ArchitectureName ||
      selectedArchitecture?.architectureName ||
      selectedArchitecture?.Architecture?.Name ||
      selectedArchitecture?.architecture?.name ||
      "Selected Architecture"
    );
  };

  const getUniqueList = (list) => {
    return Array.from(
      new Set(
        list
          .map((item) => String(item || "").trim())
          .filter((item) => item.length > 0)
      )
    );
  };

  const getMnemonicFromInstruction = (instruction) => {
    return (
      instruction?.Mnemonic ||
      instruction?.mnemonic ||
      instruction?.Name ||
      instruction?.name ||
      instruction?.InstructionName ||
      instruction?.instructionName ||
      instruction?.Operation ||
      instruction?.operation ||
      ""
    );
  };

  const getRegisterName = (register, index) => {
    return (
      register?.RegisterName ||
      register?.registerName ||
      register?.Name ||
      register?.name ||
      register?.RegisterCode ||
      register?.registerCode ||
      `R${index + 1}`
    );
  };

  const collectRegistersFromSources = (details) => {
    const sourceRegisters = [
      ...asArray(selectedArchitecture?.Registers),
      ...asArray(selectedArchitecture?.registers),
      ...asArray(selectedArchitecture?.GeneralRegisters),
      ...asArray(selectedArchitecture?.generalRegisters),
      ...asArray(selectedArchitecture?.ArchitectureRegisters),
      ...asArray(selectedArchitecture?.architectureRegisters),

      ...asArray(details?.Registers),
      ...asArray(details?.registers),
      ...asArray(details?.GeneralRegisters),
      ...asArray(details?.generalRegisters),
      ...asArray(details?.ArchitectureRegisters),
      ...asArray(details?.architectureRegisters),

      ...asArray(details?.Architecture?.Registers),
      ...asArray(details?.architecture?.registers),
    ];

    const names = sourceRegisters.map((reg, index) =>
      getRegisterName(reg, index)
    );

    const uniqueNames = getUniqueList(names);

    if (uniqueNames.length > 0) {
      return uniqueNames;
    }

    return ["R1", "R2", "R3", "R4"];
  };

  const collectMnemonicsFromSources = (instructionsFromApi, details) => {
    const sourceInstructions = [
      ...asArray(instructionsFromApi),
      ...asArray(instructionsFromApi?.Instructions),
      ...asArray(instructionsFromApi?.instructions),

      ...asArray(selectedArchitecture?.Instructions),
      ...asArray(selectedArchitecture?.instructions),

      ...asArray(details?.Instructions),
      ...asArray(details?.instructions),
      ...asArray(details?.Architecture?.Instructions),
      ...asArray(details?.architecture?.instructions),
    ];

    const names = sourceInstructions.map((instruction) =>
      getMnemonicFromInstruction(instruction)
    );

    return getUniqueList(names);
  };

  const buildExampleCodeFromArchitecture = (mnemonics, registers) => {
    const upperMnemonics = mnemonics.map((m) => String(m).toUpperCase());

    const findMnemonic = (possibleNames) => {
      for (const name of possibleNames) {
        const index = upperMnemonics.findIndex(
          (mnemonic) => mnemonic === name.toUpperCase()
        );

        if (index !== -1) {
          return mnemonics[index];
        }
      }

      return null;
    };

    const r1 = registers[0] || "R1";
    const r2 = registers[1] || "R2";
    const r3 = registers[2] || "R3";
    const r4 = registers[3] || "R4";

    const mov = findMnemonic(["MOV", "MOVE", "SET"]);
    const add = findMnemonic(["ADD"]);
    const sub = findMnemonic(["SUB"]);
    const mul = findMnemonic(["MUL"]);
    const div = findMnemonic(["DIV"]);
    const push = findMnemonic(["PUSH"]);
    const pop = findMnemonic(["POP"]);
    const store = findMnemonic(["STORE", "ST"]);
    const load = findMnemonic(["LOAD", "LD"]);
    const input = findMnemonic(["IN", "INPUT"]);
    const output = findMnemonic(["OUT", "OUTPUT"]);

    const lines = [];

    if (mov) {
      lines.push(`${mov} ${r1},10`);
      lines.push(`${mov} ${r2},20`);
    }

    if (add && mov) {
      lines.push(`${add} ${r3},${r1},${r2}`);
    }

    if (sub && mov) {
      lines.push(`${sub} ${r4},${r2},${r1}`);
    }

    if (mul && mov) {
      lines.push(`${mul} ${r3},${r1},${r2}`);
    }

    if (div && mov) {
      lines.push(`${div} ${r4},${r2},${r1}`);
    }

    if (store) {
      lines.push(`${store} [50],${r1}`);
    }

    if (load) {
      lines.push(`${load} ${r3},[50]`);
    }

    if (push) {
      lines.push(`${push} ${r1}`);
      lines.push(`${push} ${r2}`);
    }

    if (pop) {
      lines.push(`${pop} ${r3}`);
    }

    if (input) {
      lines.push(`${input} ${r1}`);
    }

    if (output) {
      lines.push(`${output} ${r1}`);
    }

    if (lines.length > 0) {
      return lines.join("\n");
    }

    if (mnemonics.length > 0) {
      return `${mnemonics[0]} ${r1},10`;
    }

    return "";
  };

  // =========================
  // HINT BUTTON
  // =========================
  const handleHint = async () => {
    if (!architectureId) {
      Alert.alert("Error", "Please select an architecture first.");
      return;
    }

    try {
      setHintLoading(true);

      let instructionsFromApi = [];
      let architectureDetails = null;

      try {
        instructionsFromApi = await getInstructionsByArchitectureId(
          architectureId
        );
      } catch (instructionError) {
        console.log("Hint Instructions Fetch Error:", instructionError);
      }

      try {
        architectureDetails = await getArchitectureDetails(architectureId);
      } catch (detailsError) {
        console.log("Hint Architecture Details Error:", detailsError);
      }

      const registers = collectRegistersFromSources(architectureDetails);
      const mnemonics = collectMnemonicsFromSources(
        instructionsFromApi,
        architectureDetails
      );

      const generatedCode = buildExampleCodeFromArchitecture(
        mnemonics,
        registers
      );

      setHintRegisters(registers);
      setHintMnemonics(mnemonics);
      setHintCode(generatedCode);
      setHintModalVisible(true);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || err?.toString() || "Failed to generate hint"
      );
    } finally {
      setHintLoading(false);
    }
  };

  const useHintCode = () => {
    if (!hintCode.trim()) {
      Alert.alert("No Example", "No executable example code generated.");
      return;
    }

    setCode(hintCode);
    setHintModalVisible(false);

    setTimeout(() => {
      scrollToEditor();
    }, 100);
  };

  // =========================
  // RUN PROGRAM + MEMORY UPDATE
  // =========================
  const handleRun = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please write some assembly code first.");
      return;
    }

    if (!architectureId) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    try {
      setIsRunning(true);
      setError("");

      const programLines = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const result = await executeProgram(architectureId, programLines);

      updateMemoryFromExecutionResult(result);

      const executionResult = {
        registers: result?.Registers || [],
        flags: result?.Flags || [],
        memory: result?.MemorySummary || {},
        stack: result?.StackSummary || {},
        errors: result?.Errors || [],
        success: result?.Success,
      };

      const registerVisualizationParams = {
        architectureId: architectureId,
        architecture: selectedArchitecture,
        executionResult,

        registers:
          selectedArchitecture?.Registers ||
          selectedArchitecture?.registers ||
          selectedArchitecture?.GeneralRegisters ||
          selectedArchitecture?.generalRegisters ||
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

      console.log(
        "PASSING TO REGISTER VISUALIZATION:",
        registerVisualizationParams
      );

      navigation
        .getParent()
        ?.navigate("RegistersVizTab", registerVisualizationParams);
    } catch (err) {
      console.log("ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        err?.toString() ||
        "Execution failed";

      setError(message);
      Alert.alert("Execution Error", message);
    } finally {
      setIsRunning(false);
    }
  };

  // =========================
  // COMPARE
  // =========================
  const handleCompare = () => {
    navigation.navigate("Compare", {
      architectureId: architectureId,
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

    if (!architectureId) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    const programLines = code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const debuggingParams = {
      architectureId: architectureId,
      architecture: selectedArchitecture,
      registers:
        selectedArchitecture?.Registers ||
        selectedArchitecture?.registers ||
        selectedArchitecture?.GeneralRegisters ||
        selectedArchitecture?.generalRegisters ||
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

    if (!architectureId) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    setFileNameInput("");
    setModalVisible(true);
  };

  const saveFile = async () => {
    if (!fileNameInput.trim()) {
      Alert.alert("Error", "Filename required");
      return;
    }

    if (!architectureId) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    const fileNameWithExt = fileNameInput.trim().endsWith(".txt")
      ? fileNameInput.trim()
      : `${fileNameInput.trim()}.txt`;

    try {
      console.log("ARCHITECTURE ID:", architectureId);
      console.log("FILE NAME:", fileNameWithExt);
      console.log("CODE:", code);

      await saveCodeFile(architectureId, fileNameWithExt, code);

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
  const handleCycleCount = async () => {
    if (!code.trim()) {
      setError("Please write some assembly code first.");
      setCycles(null);
      return;
    }

    if (!architectureId) {
      setError("No architecture selected.");
      setCycles(null);
      return;
    }

    try {
      setError("");

      const result = await calculateCountCycleByArchitectureId({
        code,
        architectureId,
        getInstructionsByArchitectureId,
        architecture: selectedArchitecture || {},
      });

      setCycles(result.totalCycles);

      console.log("Cycle Count Result:", result);
    } catch (err) {
      const message =
        err?.message || err?.toString() || "Failed to count cycles";

      setCycles(null);
      setError(message);

      console.log("Cycle Count Error:", err);
    }
  };

  // =========================
  // CYCLE ANIMATION
  // =========================
  const handleCycleAnimation = async () => {
    if (!code.trim()) {
      setError("Please write some assembly code first.");
      setCycles(null);
      return;
    }

    if (!architectureId) {
      setError("No architecture selected.");
      setCycles(null);
      return;
    }

    try {
      setError("");

      const programLines = code
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const countResult = await calculateCountCycleByArchitectureId({
        code,
        architectureId,
        getInstructionsByArchitectureId,
        architecture: selectedArchitecture || {},
      });

      let architectureDetails = selectedArchitecture || {};

      try {
        const details = await getArchitectureDetails(architectureId);

        architectureDetails = {
          ...architectureDetails,
          ...details,
        };

        setAnimationArchitectureName(
          details?.architecture?.name ||
            details?.ArchitectureName ||
            details?.name ||
            selectedArchitecture?.ArchitectureName ||
            selectedArchitecture?.name ||
            "Selected Architecture"
        );
      } catch (detailsError) {
        console.log("Architecture details for animation failed:", detailsError);

        setAnimationArchitectureName(
          selectedArchitecture?.ArchitectureName ||
            selectedArchitecture?.name ||
            "Selected Architecture"
        );
      }

      let backendExecutionResult = null;

      try {
        backendExecutionResult = await executeProgram(
          architectureId,
          programLines
        );
      } catch (executionError) {
        console.log(
          "Backend execution for animation final flags failed:",
          executionError
        );
      }

      const trace = buildCycleAnimationTrace({
        countResult,
        architecture: architectureDetails,
        executionResult: backendExecutionResult,
      });

      setCycles(countResult.totalCycles);
      setCycleTrace(trace);
      setAnimationVisible(true);

      console.log("Cycle Animation Trace:", JSON.stringify(trace, null, 2));
    } catch (err) {
      const message =
        err?.message || err?.toString() || "Failed to load cycle animation";

      setCycles(null);
      setCycleTrace([]);
      setAnimationVisible(false);
      setError(message);

      console.log("Cycle Animation Error:", err);
    }
  };

  // =========================
  // OPEN FILE FROM DATABASE
  // =========================
  const handleOpen = async () => {
    if (!architectureId) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    try {
      const files = await getCodeFiles(architectureId);

      if (!files || files.length === 0) {
        Alert.alert(
          "No Files",
          "No saved code files found for this architecture."
        );
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

      Alert.alert(
        "Success",
        `Loaded ${file?.FileName || file?.fileName || "file"}`
      );
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to open code file");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.wrapper}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          {/* TOOLBAR */}
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.runBtn}
              onPress={handleRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>▶ Run</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRunStep}>
              <Text style={styles.primaryText}>Run Step</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.blueToolBtn}
              onPress={handleHint}
              disabled={hintLoading}
            >
              <View style={styles.iconTextRow}>
                {hintLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="bulb-outline" size={14} color="#FFFFFF" />
                )}

                <Text style={styles.blueToolText}>Hint</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.blueToolBtn} onPress={handleSave}>
              <View style={styles.iconTextRow}>
                <Ionicons name="save-outline" size={14} color="#FFFFFF" />
                <Text style={styles.blueToolText}>Save</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.blueToolBtn} onPress={handleOpen}>
              <View style={styles.iconTextRow}>
                <Ionicons
                  name="folder-open-outline"
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.blueToolText}>Open</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleCycleCount}
            >
              <Text style={styles.primaryText}>Count Cycles</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleCycleAnimation}
            >
              <Text style={styles.primaryText}>Animation</Text>
            </TouchableOpacity> */}
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
              scrollEnabled
              textAlignVertical="top"
              onFocus={scrollToEditor}
              placeholder="Write your assembly code..."
              placeholderTextColor="#A0AEC0"
              style={styles.editorInput}
            />
          </View>

          {/* ERROR */}
          <Text style={styles.errorTitle}>Error Display</Text>

          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error || "No Errors"}</Text>
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
              placeholderTextColor="#8AA0C2"
              style={styles.modalInput}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor="#1F3C88"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveFile}>
                <Text style={styles.modalSaveText}>Save</Text>
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
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setOpenModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HINT MODAL */}
      <Modal visible={hintModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.hintModalContainer}>
            <Text style={styles.modalTitle}>Architecture Hint</Text>

            <Text style={styles.hintInfoText}>
              Architecture: {getArchitectureName()}
            </Text>

            <Text style={styles.hintInfoText}>
              Registers:{" "}
              {hintRegisters.length > 0 ? hintRegisters.join(", ") : "N/A"}
            </Text>

            <Text style={styles.hintInfoText}>
              Mnemonics:{" "}
              {hintMnemonics.length > 0 ? hintMnemonics.join(", ") : "N/A"}
            </Text>

            <Text style={styles.hintCodeTitle}>Example Code</Text>

            <ScrollView style={styles.hintCodeBox}>
              <Text style={styles.hintCodeText}>
                {hintCode || "No example code generated for this architecture."}
              </Text>
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setHintModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={useHintCode}>
                <Text style={styles.modalSaveText}>Use Example</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CycleAnimationScreen
        visible={animationVisible}
        onClose={() => setAnimationVisible(false)}
        cycleTrace={cycleTrace}
        architectureName={animationArchitectureName}
      />
    </KeyboardAvoidingView>
  );
};

export default EditorScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF2F9",
  },

  wrapper: {
    padding: 14,
    paddingBottom: 180,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E3E8F2",
  },

  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginBottom: 10,
  },

  runBtn: {
    backgroundColor: "#1F3C88",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },

  primaryBtn: {
    backgroundColor: "#1F3C88",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  blueToolBtn: {
    backgroundColor: "#1F3C88",
    borderWidth: 1,
    borderColor: "#1F3C88",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 6,
    marginBottom: 6,
  },

  blueToolText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  compareButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 12,
    elevation: 3,
  },

  compareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  editorBox: {
    backgroundColor: "#F9FBFF",
    borderRadius: 10,
    padding: 10,
    minHeight: 360,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    marginBottom: 10,
  },

  editorInput: {
    fontSize: 12,
    color: "#2C2F38",
    lineHeight: 18,
    minHeight: 340,
    textAlignVertical: "top",
  },

  errorTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
    marginTop: 2,
  },

  errorBox: {
    backgroundColor: "#F4F7FD",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    minHeight: 55,
  },

  errorText: {
    fontSize: 12,
    color: "#64748B",
  },

  cycleBox: {
    backgroundColor: "#E8F0FF",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1F3C88",
    alignItems: "center",
  },

  cycleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F3C88",
    marginBottom: 6,
  },

  cycleText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },

  hintModalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "88%",
    maxHeight: "82%",
  },

  modalTitle: {
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
  },

  modalInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#B9C7DC",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    color: "#061F4F",
    fontSize: 14,
  },

  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
  },

  modalCancelText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  modalSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: "#1F3C88",
  },

  modalSaveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  hintInfoText: {
    fontSize: 12,
    color: "#334155",
    marginBottom: 6,
    fontWeight: "600",
  },

  hintCodeTitle: {
    fontSize: 13,
    color: "#1F3C88",
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 6,
  },

  hintCodeBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E1E7F5",
    borderRadius: 8,
    padding: 10,
    maxHeight: 220,
  },

  hintCodeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#111827",
    lineHeight: 20,
  },

  fileItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  fileNameText: {
    fontSize: 14,
    color: "#1F3C88",
    fontWeight: "600",
  },
});