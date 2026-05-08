import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { executeProgram } from "../api/executionApi";
import { getCodeFiles, getCodeFileById } from "../api/codefile";
import { getInstructionsByArchitectureId } from "../api/instructionApi";
import { calculateCountCycleByArchitectureId } from "../utils/CountCycle";

const Compare = ({ navigation, route }) => {
  const architecture = route?.params?.architecture;

  const architectureId =
    route?.params?.architectureId ||
    architecture?.ArchitectureID ||
    architecture?.architectureID ||
    architecture?.architectureId ||
    architecture?.id;

  const [programACode, setProgramACode] = useState("");
  const [programBCode, setProgramBCode] = useState("");

  const [programAOutput, setProgramAOutput] = useState(null);
  const [programBOutput, setProgramBOutput] = useState(null);

  const [programAError, setProgramAError] = useState("");
  const [programBError, setProgramBError] = useState("");

  const [programALoading, setProgramALoading] = useState(false);
  const [programBLoading, setProgramBLoading] = useState(false);

  const [clock1, setClock1] = useState(null);
  const [clock2, setClock2] = useState(null);

  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const [selectedProgramForOpen, setSelectedProgramForOpen] = useState(null);

  const makeProgramLines = (code) => {
    return code
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.Message ||
      err?.message ||
      "Execution failed"
    );
  };

  const getTotalCyclesFromResult = (cycleResult) => {
    const total =
      cycleResult?.totalCycles ??
      cycleResult?.TotalCycles ??
      cycleResult?.cycles ??
      cycleResult?.Cycles ??
      cycleResult;

    const numericTotal = Number(total);

    if (!Number.isFinite(numericTotal)) {
      throw new Error("Cycle count result is empty or invalid.");
    }

    return numericTotal;
  };

  const normalizeExecutionResult = (result) => {
    return {
      answer:
        result?.Output ??
        result?.output ??
        result?.Result ??
        result?.result ??
        result?.Answer ??
        result?.answer ??
        result?.FinalOutput ??
        result?.finalOutput ??
        null,

      registers: result?.Registers || result?.registers || [],
      flags: result?.Flags || result?.flags || [],
      memory: result?.MemorySummary || result?.memory || {},
      stack: result?.StackSummary || result?.stack || {},
      errors: result?.Errors || result?.errors || [],
      success: result?.Success ?? result?.success ?? false,

      clockCycles:
        result?.ClockCycles ||
        result?.clockCycles ||
        result?.CycleCount ||
        result?.cycleCount ||
        result?.Cycles ||
        result?.cycles ||
        null,
    };
  };

  const formatOutput = (output) => {
    if (!output) {
      return "Run program to see output";
    }

    if (output.errors?.length > 0) {
      return "No output";
    }

    if (output.answer !== null && output.answer !== undefined) {
      return String(output.answer);
    }

    if (Array.isArray(output.registers) && output.registers.length > 0) {
      return String(output.registers[0]);
    }

    return "No output";
  };

  const handleOpen = async (programType) => {
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

      setSelectedProgramForOpen(programType);
      setSavedFiles(files);
      setOpenModalVisible(true);
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to load saved files");
    }
  };

  const openSavedFile = async (fileId) => {
    if (!fileId) {
      Alert.alert("Error", "Invalid file selected.");
      return;
    }

    try {
      const file = await getCodeFileById(fileId);
      const fileCode = file?.Code || file?.code || "";

      if (selectedProgramForOpen === "A") {
        setProgramACode(fileCode);
        setProgramAOutput(null);
        setProgramAError("");
        setClock1(null);
      } else if (selectedProgramForOpen === "B") {
        setProgramBCode(fileCode);
        setProgramBOutput(null);
        setProgramBError("");
        setClock2(null);
      }

      setOpenModalVisible(false);
      setSelectedProgramForOpen(null);

      Alert.alert(
        "Success",
        `Loaded ${file?.FileName || file?.fileName || "file"}`
      );
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to open code file");
    }
  };

  const calculateClockCycleForProgram = async (code) => {
    const cycleResult = await calculateCountCycleByArchitectureId({
      code,
      architectureId,
      getInstructionsByArchitectureId,
      architecture: architecture || {},
    });

    return getTotalCyclesFromResult(cycleResult);
  };

  const runProgram = async (programType) => {
    const isProgramA = programType === "A";
    const code = isProgramA ? programACode : programBCode;

    if (!code.trim()) {
      Alert.alert("Error", `Please write Program ${programType} code first.`);
      return;
    }

    if (!architectureId) {
      Alert.alert("Error", "No architecture selected.");
      return;
    }

    try {
      if (isProgramA) {
        setProgramALoading(true);
        setProgramAError("");
        setProgramAOutput(null);
        setClock1(null);
      } else {
        setProgramBLoading(true);
        setProgramBError("");
        setProgramBOutput(null);
        setClock2(null);
      }

      const programLines = makeProgramLines(code);

      let calculatedCycles = null;
      let cycleErrorMessage = "";

      try {
        calculatedCycles = await calculateClockCycleForProgram(code);
      } catch (cycleError) {
        cycleErrorMessage =
          cycleError?.message ||
          cycleError?.toString() ||
          "Failed to calculate clock cycles.";

        console.log(`PROGRAM ${programType} CYCLE ERROR:`, cycleError);
      }

      const result = await executeProgram(architectureId, programLines);

      console.log(`PROGRAM ${programType} EXECUTION RESULT:`, result);

      const executionResult = normalizeExecutionResult(result);
      const apiErrors = executionResult.errors || [];

      const finalClock =
        calculatedCycles !== null
          ? calculatedCycles
          : executionResult.clockCycles || "Cycle Error";

      if (isProgramA) {
        setProgramAOutput(executionResult);

        const finalError = apiErrors.length > 0 ? apiErrors.join("\n") : "";
        setProgramAError(
          cycleErrorMessage
            ? `${finalError}${finalError ? "\n" : ""}${cycleErrorMessage}`
            : finalError
        );

        setClock1(finalClock);
      } else {
        setProgramBOutput(executionResult);

        const finalError = apiErrors.length > 0 ? apiErrors.join("\n") : "";
        setProgramBError(
          cycleErrorMessage
            ? `${finalError}${finalError ? "\n" : ""}${cycleErrorMessage}`
            : finalError
        );

        setClock2(finalClock);
      }
    } catch (err) {
      console.log(`PROGRAM ${programType} ERROR:`, err);

      const message = getErrorMessage(err);

      if (isProgramA) {
        setProgramAError(message);
        setProgramAOutput(null);
        setClock1(null);
      } else {
        setProgramBError(message);
        setProgramBOutput(null);
        setClock2(null);
      }
    } finally {
      if (isProgramA) {
        setProgramALoading(false);
      } else {
        setProgramBLoading(false);
      }
    }
  };

  const renderProgramCard = ({
    title,
    programType,
    code,
    setCode,
    output,
    error,
    loading,
    clock,
    onRun,
    placeholder,
  }) => {
    return (
      <View style={styles.programCard}>
        <Text style={styles.programTitle}>{title}</Text>

        <TouchableOpacity
          style={styles.openBtn}
          onPress={() => handleOpen(programType)}
        >
          <Ionicons
            name="folder-outline"
            size={16}
            color="#1E3A8A"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.openText}>Open</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.runBtn, loading && styles.disabledBtn]}
          onPress={onRun}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons
                name="play"
                size={16}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.runText}>Run</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.codeBox}>
          <TextInput
            style={styles.codeInput}
            multiline
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={code}
            onChangeText={setCode}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.outputBox}>
          <Text style={styles.outputTitle}>Output Display</Text>
          <Text style={styles.outputValue}>{formatOutput(output)}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Error Display</Text>
          <Text style={styles.infoValue}>{error || "No Errors"}</Text>
        </View>

        <View style={styles.clockBox}>
          <Text style={styles.clockText}>Clock Cycle:</Text>
          <Text style={styles.clockValue}>{clock ?? "N/A"}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Compare Programs</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.architectureText}>
          Using Architecture:{" "}
          {architecture?.Name ||
            architecture?.name ||
            `Architecture ID ${architectureId || "N/A"}`}
        </Text>

        <View style={styles.parallelRow}>
          {renderProgramCard({
            title: "Program A",
            programType: "A",
            code: programACode,
            setCode: setProgramACode,
            output: programAOutput,
            error: programAError,
            loading: programALoading,
            clock: clock1,
            onRun: () => runProgram("A"),
            placeholder: "Enter Program A code here...",
          })}

          {renderProgramCard({
            title: "Program B",
            programType: "B",
            code: programBCode,
            setCode: setProgramBCode,
            output: programBOutput,
            error: programBError,
            loading: programBLoading,
            clock: clock2,
            onRun: () => runProgram("B"),
            placeholder: "Enter Program B code here...",
          })}
        </View>
      </ScrollView>

      <Modal visible={openModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Select Saved File for Program {selectedProgramForOpen || ""}
            </Text>

            <ScrollView style={{ maxHeight: 260 }}>
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
                onPress={() => {
                  setOpenModalVisible(false);
                  setSelectedProgramForOpen(null);
                }}
              >
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Compare;

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  headerTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "900",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 10,
    paddingBottom: 24,
  },

  architectureText: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  parallelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  programCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 640,
  },

  programTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 6,
  },

  openBtn: {
    borderWidth: 1,
    borderColor: "#1E3A8A",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  openText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 12,
  },

  runBtn: {
    backgroundColor: "#1E3A8A",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    minHeight: 34,
  },

  disabledBtn: {
    opacity: 0.7,
  },

  runText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  codeBox: {
    backgroundColor: "#F9FBFF",
    borderRadius: 8,
    padding: 10,
    minHeight: 300,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    marginBottom: 12,
  },

  codeInput: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 16,
    color: "#1F2937",
    flex: 1,
    minHeight: 280,
  },

  outputBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    minHeight: 70,
  },

  outputTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },

  outputValue: {
    fontSize: 14,
    color: "#14532D",
    lineHeight: 20,
    fontWeight: "700",
  },

  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    minHeight: 55,
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 11,
    color: "#64748B",
  },

  clockBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  clockText: {
    fontSize: 11,
    color: "#1E3A8A",
    fontWeight: "600",
  },

  clockValue: {
    fontSize: 11,
    fontWeight: "600",
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
    width: "82%",
  },

  modalTitle: {
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 16,
    color: "#1E3A8A",
  },

  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  fileItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  fileNameText: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "600",
  },
});