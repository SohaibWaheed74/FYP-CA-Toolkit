import React, { useEffect, useState, useContext } from "react";
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

import { ArchitectureContext } from "../context/ArchitectureContext";
import { executeProgram } from "../api/executionApi";
import { getCodeFiles, getCodeFileById } from "../api/codefile";
import { getInstructionsByArchitectureId } from "../api/instructionApi";
import { calculateCountCycleByArchitectureId } from "../utils/CountCycle";
import { getArchitectureDetails } from "../api/detailApi";

// ================= DEFAULT FLAGS =================
const DEFAULT_FLAG_REGISTERS = [
  { name: "Zero" },
  { name: "Carry" },
  { name: "Sign" },
  { name: "Overflow" },
];

// ================= FLAG HELPERS =================
const normalizeFlagValue = (value) => {
  if (value === true) return 1;
  if (value === false) return 0;
  if (value === "true" || value === "True") return 1;
  if (value === "false" || value === "False") return 0;
  if (value === 1 || value === "1") return 1;
  if (value === 0 || value === "0") return 0;
  return value ?? 0;
};

const getFlagName = (flag, index) => {
  return (
    flag?.name ||
    flag?.Name ||
    flag?.FlagName ||
    flag?.flagName ||
    flag?.FlagRegisterName ||
    flag?.flagRegisterName ||
    flag?.RegisterName ||
    flag?.registerName ||
    DEFAULT_FLAG_REGISTERS[index]?.name ||
    `Flag ${index + 1}`
  );
};

// Backend flag order:
// Flags[0] = Carry
// Flags[1] = Overflow
// Flags[2] = Sign
// Flags[3] = Zero
const getBackendFlagValues = (apiFlags = []) => {
  let zero = 0;
  let carry = 0;
  let sign = 0;
  let overflow = 0;

  if (Array.isArray(apiFlags)) {
    carry = normalizeFlagValue(apiFlags[0]);
    overflow = normalizeFlagValue(apiFlags[1]);
    sign = normalizeFlagValue(apiFlags[2]);
    zero = normalizeFlagValue(apiFlags[3]);
  } else if (apiFlags && typeof apiFlags === "object") {
    carry = normalizeFlagValue(
      apiFlags.Carry ??
        apiFlags.carry ??
        apiFlags.C ??
        apiFlags.c ??
        apiFlags.CF ??
        apiFlags.cf ??
        apiFlags["0"] ??
        0
    );

    overflow = normalizeFlagValue(
      apiFlags.Overflow ??
        apiFlags.overflow ??
        apiFlags.O ??
        apiFlags.o ??
        apiFlags.OF ??
        apiFlags.of ??
        apiFlags["1"] ??
        0
    );

    sign = normalizeFlagValue(
      apiFlags.Sign ??
        apiFlags.sign ??
        apiFlags.Negative ??
        apiFlags.negative ??
        apiFlags.S ??
        apiFlags.s ??
        apiFlags.SF ??
        apiFlags.sf ??
        apiFlags.N ??
        apiFlags.n ??
        apiFlags["2"] ??
        0
    );

    zero = normalizeFlagValue(
      apiFlags.Zero ??
        apiFlags.zero ??
        apiFlags.Z ??
        apiFlags.z ??
        apiFlags.ZF ??
        apiFlags.zf ??
        apiFlags["3"] ??
        0
    );
  }

  return {
    zero,
    carry,
    sign,
    overflow,
  };
};

const getMappedFlagValueByName = (flagName, backendValues, apiFlags, index) => {
  const lowerName = String(flagName || "").toLowerCase();

  if (
    lowerName.includes("zero") ||
    lowerName === "z" ||
    lowerName === "zf"
  ) {
    return backendValues.zero;
  }

  if (
    lowerName.includes("carry") ||
    lowerName === "c" ||
    lowerName === "cf"
  ) {
    return backendValues.carry;
  }

  if (
    lowerName.includes("sign") ||
    lowerName.includes("negative") ||
    lowerName === "s" ||
    lowerName === "sf" ||
    lowerName === "n"
  ) {
    return backendValues.sign;
  }

  if (
    lowerName.includes("overflow") ||
    lowerName === "o" ||
    lowerName === "of"
  ) {
    return backendValues.overflow;
  }

  if (Array.isArray(apiFlags)) {
    return normalizeFlagValue(apiFlags[index]);
  }

  return 0;
};

const buildDisplayFlags = (userFlagRegisters = [], apiFlags = []) => {
  const hasUserFlags =
    Array.isArray(userFlagRegisters) && userFlagRegisters.length > 0;

  const flagsSource = hasUserFlags
    ? userFlagRegisters
    : DEFAULT_FLAG_REGISTERS;

  const backendValues = getBackendFlagValues(apiFlags);

  return flagsSource.map((flag, index) => {
    const flagName = getFlagName(flag, index);

    return {
      label: flagName,
      value: getMappedFlagValueByName(flagName, backendValues, apiFlags, index),
    };
  });
};

const Compare = ({ navigation, route }) => {
  // ================= ALL HOOKS AT TOP =================
  const { updateMemoryFromExecutionResult } = useContext(ArchitectureContext);

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

  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [flagRegisters, setFlagRegisters] = useState([]);

  // ================= PARAMS =================
  const architecture = route?.params?.architecture;

  const architectureId =
    route?.params?.architectureId ||
    architecture?.ArchitectureID ||
    architecture?.architectureID ||
    architecture?.architectureId ||
    architecture?.id;

  const routeRegisters = route?.params?.registers || [];
  const routeFlags = route?.params?.flags || [];

  // ================= EFFECT =================
  useEffect(() => {
    const fetchArchitectureDetailsForNames = async () => {
      try {
        if (!architectureId) return;

        const data = await getArchitectureDetails(architectureId);

        setGeneralRegisters(data?.generalRegisters || []);
        setFlagRegisters(data?.flagRegisters || []);

        console.log("COMPARE ARCHITECTURE DETAILS:", {
          generalRegisters: data?.generalRegisters || [],
          flagRegisters: data?.flagRegisters || [],
        });
      } catch (err) {
        console.log("Compare Details Fetch Error:", err);
      }
    };

    fetchArchitectureDetailsForNames();
  }, [architectureId]);

  // ================= DB REGISTER / FLAG SOURCES =================
  const dbRegisters =
    Array.isArray(generalRegisters) && generalRegisters.length > 0
      ? generalRegisters
      : Array.isArray(routeRegisters) && routeRegisters.length > 0
      ? routeRegisters
      : architecture?.generalRegisters ||
        architecture?.GeneralRegisters ||
        architecture?.Registers ||
        architecture?.registers ||
        architecture?.ArchitectureRegisters ||
        architecture?.architectureRegisters ||
        [];

  const dbFlags =
    Array.isArray(flagRegisters) && flagRegisters.length > 0
      ? flagRegisters
      : Array.isArray(routeFlags) && routeFlags.length > 0
      ? routeFlags
      : architecture?.flagRegisters ||
        architecture?.FlagRegisters ||
        architecture?.Flags ||
        architecture?.flags ||
        architecture?.ArchitectureFlags ||
        architecture?.architectureFlags ||
        architecture?.ArchitectureFlagRegisters ||
        architecture?.architectureFlagRegisters ||
        [];

  // ================= HELPERS =================
  const makeProgramLines = (code) => {
    return String(code || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.Message ||
      err?.message ||
      err?.toString() ||
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
      memory: result?.MemorySummary || result?.memorySummary || {},
      stack: result?.StackSummary || result?.stackSummary || {},
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

  const getRegisterName = (reg, index) => {
    return (
      reg?.name ||
      reg?.Name ||
      reg?.RegisterName ||
      reg?.registerName ||
      `R${index + 1}`
    );
  };

  const buildDisplayRegisters = (output) => {
    const registersArray = output?.registers || output?.Registers || [];

    if (Array.isArray(dbRegisters) && dbRegisters.length > 0) {
      return dbRegisters.map((reg, index) => ({
        label: getRegisterName(reg, index),
        value: registersArray[index] ?? 0,
      }));
    }

    if (Array.isArray(registersArray) && registersArray.length > 0) {
      return registersArray.map((value, index) => ({
        label: `R${index + 1}`,
        value: value ?? 0,
      }));
    }

    return ["R1", "R2", "R3", "R4"].map((name) => ({
      label: name,
      value: 0,
    }));
  };

  const buildFlagsForOutput = (output) => {
    const flagsArray = output?.flags || output?.Flags || [];
    return buildDisplayFlags(dbFlags, flagsArray);
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

  // ================= OPEN FILE =================
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
      }

      if (selectedProgramForOpen === "B") {
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

  // ================= RUN PROGRAM =================
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

      if (updateMemoryFromExecutionResult) {
        updateMemoryFromExecutionResult(result);
      }

      console.log(`PROGRAM ${programType} EXECUTION RESULT:`, result);

      const executionResult = normalizeExecutionResult(result);
      const apiErrors = executionResult.errors || [];

      const finalClock =
        calculatedCycles !== null
          ? calculatedCycles
          : executionResult.clockCycles || "Cycle Error";

      const finalError = apiErrors.length > 0 ? apiErrors.join("\n") : "";

      if (isProgramA) {
        setProgramAOutput(executionResult);

        setProgramAError(
          cycleErrorMessage
            ? `${finalError}${finalError ? "\n" : ""}${cycleErrorMessage}`
            : finalError
        );

        setClock1(finalClock);
      } else {
        setProgramBOutput(executionResult);

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

  // ================= DISPLAY DATA =================
  const side1Registers = buildDisplayRegisters(programAOutput);
  const side2Registers = buildDisplayRegisters(programBOutput);

  const side1Flags = buildFlagsForOutput(programAOutput);
  const side2Flags = buildFlagsForOutput(programBOutput);

  // ================= RENDER HELPERS =================
  const renderProgramColumn = ({
    programType,
    code,
    setCode,
    error,
    loading,
    clock,
    placeholder,
  }) => {
    return (
      <View style={styles.programColumn}>
        <View style={styles.topButtonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpen(programType)}
          >
            <Ionicons
              name="folder-outline"
              size={15}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.actionButtonText}>Open</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, loading && styles.disabledBtn]}
            onPress={() => runProgram(programType)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="play-outline"
                  size={15}
                  color="#FFFFFF"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.actionButtonText}>Run</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.codeBox}>
          <TextInput
            style={styles.codeInput}
            multiline
            scrollEnabled={true}
            nestedScrollEnabled={true}
            placeholder={placeholder}
            placeholderTextColor="#A3A3A3"
            value={code}
            onChangeText={setCode}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.smallLabel}>Error Display</Text>

        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || ""}</Text>
        </View>

        <View style={styles.clockBox}>
          <Text style={styles.clockPlaceholder}>
            Clock Cycles: {clock ?? ""}
          </Text>
        </View>
      </View>
    );
  };

  const renderSmallBox = (item, index, colorType) => {
    return (
      <View key={`${item.label}-${index}`} style={styles.registerItem}>
        <Text
          style={[
            styles.registerLabel,
            colorType === "purple" && styles.registerLabelPurple,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>

        <View style={styles.registerValueBox}>
          <Text
            style={styles.registerValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.45}
          >
            {item.value ?? 0}
          </Text>
        </View>
      </View>
    );
  };

  const renderStateCard = ({ title, data, colorType }) => {
    return (
      <View
        style={[
          styles.stateCard,
          colorType === "purple" && styles.stateCardPurple,
        ]}
      >
        <Text
          style={[
            styles.stateTitle,
            colorType === "purple" && styles.stateTitlePurple,
          ]}
        >
          {title}
        </Text>

        <View style={styles.stateGrid}>
          {data.map((item, index) => renderSmallBox(item, index, colorType))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.pageTitleRow}>
        <TouchableOpacity
          style={styles.pageBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Compare Programs</Text>

        <View style={{ width: 32 }} />
      </View>

      {/* ================= TOP HALF: EDITORS ================= */}
      <View style={styles.editorHalf}>
        <ScrollView
          style={styles.halfScroll}
          contentContainerStyle={styles.editorHalfContent}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.compareCard}>
            <View style={styles.programsRow}>
              {renderProgramColumn({
                programType: "A",
                code: programACode,
                setCode: setProgramACode,
                error: programAError,
                loading: programALoading,
                clock: clock1,
                placeholder: "MOV R1, #5",
              })}

              <View style={styles.verticalDivider} />

              {renderProgramColumn({
                programType: "B",
                code: programBCode,
                setCode: setProgramBCode,
                error: programBError,
                loading: programBLoading,
                clock: clock2,
                placeholder: "MOV R1, #5",
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ================= BOTTOM HALF: REGISTERS + FLAGS ================= */}
      <View style={styles.resultHalf}>
        <ScrollView
          style={styles.halfScroll}
          contentContainerStyle={styles.resultHalfContent}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.matrixWrapper}>
            <Text style={styles.matrixTitle}>
              • GENERAL PURPOSE REGISTER MATRIX COMPARISON
            </Text>

            <View style={styles.stateRow}>
              {renderStateCard({
                title: "SIDE 1 STATE",
                data: side1Registers,
                colorType: "blue",
              })}

              {renderStateCard({
                title: "SIDE 2 STATE",
                data: side2Registers,
                colorType: "purple",
              })}
            </View>
          </View>

          <View style={styles.matrixWrapper}>
            <Text style={styles.matrixTitle}>• FLAG REGISTER COMPARISON</Text>

            <View style={styles.stateRow}>
              {renderStateCard({
                title: "SIDE 1 FLAGS",
                data: side1Flags,
                colorType: "blue",
              })}

              {renderStateCard({
                title: "SIDE 2 FLAGS",
                data: side2Flags,
                colorType: "purple",
              })}
            </View>
          </View>
        </ScrollView>
      </View>

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
                <Text style={{ color: "red", fontWeight: "700" }}>Cancel</Text>
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
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  pageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#F8FAFC",
  },

  pageBackButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  pageTitle: {
    fontSize: 24,
    color: "#1E3A8A",
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
  },

  editorHalf: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  resultHalf: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },

  halfScroll: {
    flex: 1,
  },

  editorHalfContent: {
    paddingBottom: 12,
  },

  resultHalfContent: {
    paddingBottom: 30,
  },

  compareCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  programsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  programColumn: {
    flex: 1,
  },

  verticalDivider: {
    width: 1,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 10,
  },

  topButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  actionButton: {
    width: "48%",
    backgroundColor: "#1E3A8A",
    borderRadius: 7,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 40,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  disabledBtn: {
    opacity: 0.7,
  },

  codeBox: {
    height: 168,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.3,
    borderColor: "#A3A3A3",
    padding: 8,
    marginBottom: 10,
  },

  codeInput: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 17,
    color: "#1F2937",
    textAlignVertical: "top",
  },

  smallLabel: {
    color: "#1E3A8A",
    fontWeight: "800",
    fontSize: 11,
    marginBottom: 4,
  },

  errorBox: {
    height: 65,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#A3A3A3",
    padding: 7,
    marginBottom: 10,
  },

  errorText: {
    fontSize: 10,
    color: "#DC2626",
  },

  clockBox: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#A3A3A3",
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  clockPlaceholder: {
    fontSize: 12,
    color: "#A3A3A3",
    fontWeight: "600",
  },

  matrixWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 14,
  },

  matrixTitle: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },

  stateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stateCard: {
    width: "48%",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  stateCardPurple: {
    backgroundColor: "#F5F3FF",
    borderColor: "#EDE9FE",
  },

  stateTitle: {
    color: "#1E3A8A",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },

  stateTitlePurple: {
    color: "#5B21B6",
  },

  stateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  registerItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 10,
  },

  registerLabel: {
    fontSize: 12,
    color: "#1E3A8A",
    fontWeight: "800",
    marginBottom: 5,
  },

  registerLabelPurple: {
    color: "#5B21B6",
  },

  registerValueBox: {
    width: "100%",
    height: 58,
    borderWidth: 1.2,
    borderColor: "#A3A3A3",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  registerValue: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
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
    fontWeight: "700",
    fontSize: 16,
    color: "#1E3A8A",
  },

  modalBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
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