import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { executeProgram } from "../api/executionApi";
import { getArchitectureDetails } from "../api/detailApi";
import { ArchitectureContext } from "../context/ArchitectureContext";

// ================= DEFAULT FLAGS =================
const DEFAULT_FLAG_REGISTERS = [
  { name: "Zero" },
  { name: "Carry" },
  { name: "Sign" },
  { name: "Overflow" },
];

// ================= FLAG VALUE NORMALIZER =================
const normalizeFlagValue = (value) => {
  if (value === true) return 1;
  if (value === false) return 0;
  if (value === "true" || value === "True") return 1;
  if (value === "false" || value === "False") return 0;
  if (value === 1 || value === "1") return 1;
  if (value === 0 || value === "0") return 0;
  return value ?? 0;
};

// ================= FLAG NAME GETTER =================
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
    `F${index + 1}`
  );
};

// ================= BACKEND FLAGS MAPPING =================
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

// ================= BUILD FLAGS =================
const buildDisplayFlags = (userFlagRegisters = [], apiFlags = []) => {
  const hasUserFlags =
    Array.isArray(userFlagRegisters) && userFlagRegisters.length > 0;

  const flagSource = hasUserFlags ? userFlagRegisters : DEFAULT_FLAG_REGISTERS;

  const backendValues = getBackendFlagValues(apiFlags);

  return flagSource.map((flag, index) => {
    const flagName = getFlagName(flag, index);

    return {
      name: flagName,
      value: getMappedFlagValueByName(
        flagName,
        backendValues,
        apiFlags,
        index
      ),
    };
  });
};

const Debugging = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const runInterval = useRef(null);

  const { updateMemoryFromExecutionResult, initializeMemory } =
    useContext(ArchitectureContext);

  const architecture = route.params?.architecture || null;

  const architectureId =
    route.params?.architectureId ||
    route.params?.architecture?.ArchitectureID ||
    route.params?.architecture?.architectureID ||
    route.params?.architecture?.id ||
    route.params?.architecture?.architectureId;

  const routeRegisters = route.params?.registers || [];
  const routeFlags = route.params?.flags || [];

  const [program, setProgram] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  const [registers, setRegisters] = useState([]);
  const [flags, setFlags] = useState([]);
  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [flagRegisters, setFlagRegisters] = useState([]);

  const isStepLoading = isRunning === "step";
  const isBackLoading = isRunning === "back";
  const isRunLoading = isRunning === "run";
  const isAnyLoading = isStepLoading || isBackLoading || isRunLoading;

  const makeRegisterBoxes = (items = []) => {
    if (!Array.isArray(items)) return [];

    return items.map((reg, index) => ({
      name:
        reg?.name ||
        reg?.Name ||
        reg?.RegisterName ||
        reg?.registerName ||
        `R${index + 1}`,
      value: 0,
    }));
  };

  const makeFlagBoxes = (items = [], apiFlags = []) => {
    return buildDisplayFlags(items, apiFlags);
  };

  const getRegisterSource = () => {
    if (Array.isArray(generalRegisters) && generalRegisters.length > 0) {
      return generalRegisters;
    }

    if (Array.isArray(routeRegisters) && routeRegisters.length > 0) {
      return routeRegisters;
    }

    return (
      architecture?.generalRegisters ||
      architecture?.GeneralRegisters ||
      architecture?.Registers ||
      architecture?.registers ||
      architecture?.ArchitectureRegisters ||
      architecture?.architectureRegisters ||
      []
    );
  };

  const getFlagSource = () => {
    if (Array.isArray(flagRegisters) && flagRegisters.length > 0) {
      return flagRegisters;
    }

    if (Array.isArray(routeFlags) && routeFlags.length > 0) {
      return routeFlags;
    }

    return (
      architecture?.flagRegisters ||
      architecture?.FlagRegisters ||
      architecture?.Flags ||
      architecture?.flags ||
      architecture?.ArchitectureFlags ||
      architecture?.architectureFlags ||
      architecture?.ArchitectureFlagRegisters ||
      architecture?.architectureFlagRegisters ||
      []
    );
  };

  const getArchitectureRegisters = () => {
    return makeRegisterBoxes(getRegisterSource());
  };

  const getArchitectureFlags = () => {
    return makeFlagBoxes(getFlagSource());
  };

  const getMemorySize = () => {
    return (
      Number(architecture?.MemorySize) ||
      Number(architecture?.memorySize) ||
      Number(
        String(architecture?.memorySize || "")
          .replace(" Bytes", "")
          .trim()
      ) ||
      0
    );
  };

  const resetMemoryIfPossible = () => {
    const memorySize = getMemorySize();

    if (memorySize > 0) {
      initializeMemory(memorySize);
    }
  };

  const getOutputFromResult = (result) => {
    const errors = result?.Errors || result?.errors || [];

    if (Array.isArray(errors) && errors.length > 0) {
      return errors.join("\n");
    }

    const registersArray = result?.Registers || result?.registers || [];

    return `Result: ${registersArray[0] ?? 0}`;
  };

  useEffect(() => {
    if (route.params?.program) {
      setProgram(route.params.program);
      setCurrentLine(0);
      setStepIndex(0);
    }

    console.log("DEBUGGING SCREEN RECEIVED DATA:", {
      architectureId,
      architecture,
      program: route.params?.program || [],
      registers: routeRegisters,
      flags: routeFlags,
    });
  }, [route.params]);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        if (!architectureId) {
          setRegisters(getArchitectureRegisters());
          setFlags(getArchitectureFlags());
          return;
        }

        const data = await getArchitectureDetails(architectureId);

        if (!isMounted) return;

        const dbGeneralRegisters =
          data?.generalRegisters ||
          data?.GeneralRegisters ||
          data?.Registers ||
          data?.registers ||
          [];

        const dbFlagRegisters =
          data?.flagRegisters ||
          data?.FlagRegisters ||
          data?.Flags ||
          data?.flags ||
          [];

        setGeneralRegisters(dbGeneralRegisters);
        setFlagRegisters(dbFlagRegisters);

        setRegisters(makeRegisterBoxes(dbGeneralRegisters));
        setFlags(makeFlagBoxes(dbFlagRegisters));

        console.log("DEBUGGING DETAILS FROM API:", {
          generalRegisters: dbGeneralRegisters,
          flagRegisters: dbFlagRegisters,
        });
      } catch (err) {
        console.log("Debugging Details Fetch Error:", err);

        if (!isMounted) return;

        setRegisters(getArchitectureRegisters());
        setFlags(getArchitectureFlags());
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [architectureId]);

  useEffect(() => {
    if (generalRegisters.length === 0 && routeRegisters.length > 0) {
      setRegisters(makeRegisterBoxes(routeRegisters));
    }

    if (flagRegisters.length === 0) {
      if (routeFlags.length > 0) {
        setFlags(makeFlagBoxes(routeFlags));
      } else {
        setFlags(makeFlagBoxes(DEFAULT_FLAG_REGISTERS));
      }
    }
  }, [generalRegisters, flagRegisters, routeRegisters, routeFlags]);

  const mapApiRegistersWithDbNames = (apiRegisters) => {
    const dbRegisterBoxes = getArchitectureRegisters();

    if (!apiRegisters || !Array.isArray(apiRegisters)) {
      return dbRegisterBoxes;
    }

    if (dbRegisterBoxes.length > 0) {
      return dbRegisterBoxes.map((reg, index) => ({
        name: reg.name,
        value: apiRegisters[index] ?? 0,
      }));
    }

    return apiRegisters.map((value, index) => ({
      name: `R${index + 1}`,
      value: value ?? 0,
    }));
  };

  const mapApiFlagsWithDbNames = (apiFlags) => {
    return buildDisplayFlags(getFlagSource(), apiFlags || []);
  };

  // ================= COMMON EXECUTION FUNCTION =================
  const executeProgramUntilStep = async (targetStepIndex) => {
    const stepProgramLines = program.slice(0, targetStepIndex);

    const result = await executeProgram(architectureId, stepProgramLines);

    resetMemoryIfPossible();
    updateMemoryFromExecutionResult(result);

    const apiRegisters = result?.Registers || result?.registers || [];
    const apiFlags = result?.Flags || result?.flags || [];

    const updatedRegisters = mapApiRegistersWithDbNames(apiRegisters);
    const updatedFlags = mapApiFlagsWithDbNames(apiFlags);

    setRegisters(updatedRegisters);
    setFlags(updatedFlags);
    setOutput(getOutputFromResult(result));

    const newCurrentLine = targetStepIndex > 0 ? targetStepIndex - 1 : 0;

    setCurrentLine(newCurrentLine);
    setStepIndex(targetStepIndex);
  };

  // ================= STEP FORWARD + MEMORY UPDATE =================
  const handleStepForward = async () => {
    if (isAnyLoading) return;

    if (!architectureId) {
      setOutput("Architecture ID missing.");
      return;
    }

    if (!program || program.length === 0) {
      setOutput("No program found.");
      return;
    }

    if (stepIndex >= program.length) {
      setOutput("No more instructions to execute.");
      return;
    }

    try {
      setIsRunning("step");
      setOutput("");

      await executeProgramUntilStep(stepIndex + 1);
    } catch (error) {
      const message = error?.message || error?.toString() || "Step failed";
      setOutput(message);
    } finally {
      setIsRunning(false);
    }
  };

  // ================= STEP BACKWARD =================
  const handleStepBack = async () => {
    if (isAnyLoading) return;

    if (!architectureId) {
      setOutput("Architecture ID missing.");
      return;
    }

    if (!program || program.length === 0) {
      setOutput("No program found.");
      return;
    }

    if (stepIndex <= 0) {
      setOutput("Already at first instruction.");
      return;
    }

    try {
      setIsRunning("back");
      setOutput("");

      const targetStepIndex = stepIndex - 1;

      if (targetStepIndex <= 0) {
        resetMemoryIfPossible();
        setRegisters(getArchitectureRegisters());
        setFlags(getArchitectureFlags());
        setCurrentLine(0);
        setStepIndex(0);
        setOutput("Back to initial state.");
        return;
      }

      await executeProgramUntilStep(targetStepIndex);
    } catch (error) {
      const message = error?.message || error?.toString() || "Backward failed";
      setOutput(message);
    } finally {
      setIsRunning(false);
    }
  };

  // ================= RUN FULL PROGRAM + MEMORY UPDATE =================
  const handleRun = async () => {
    if (isAnyLoading) return;

    if (!architectureId) {
      setOutput("Architecture ID missing.");
      return;
    }

    if (!program || program.length === 0) {
      setOutput("No program found.");
      return;
    }

    try {
      setIsRunning("run");
      setOutput("");

      await executeProgramUntilStep(program.length);
    } catch (error) {
      const message = error?.message || error?.toString() || "Run failed";
      setOutput(message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReload = () => {
    if (isAnyLoading) return;

    clearInterval(runInterval.current);
    setIsRunning(false);
    setCurrentLine(0);
    setStepIndex(0);
    setOutput("");

    setRegisters(getArchitectureRegisters());
    setFlags(getArchitectureFlags());

    resetMemoryIfPossible();
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: currentLine * 35,
      animated: true,
    });
  }, [currentLine]);

  return (
  <View style={styles.mainWrapper}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Debugging</Text>

      <View style={{ width: 24 }} />
    </View>

    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.controlBtn, isAnyLoading && styles.disabledBtn]}
          onPress={handleStepBack}
          disabled={isAnyLoading}
        >
          {isBackLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="arrow-back-outline" size={10} color="#FFFFFF" />
          )}

          <Text style={styles.controlText}>
            {isBackLoading ? "Wait" : "Backward"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isAnyLoading && styles.disabledBtn]}
          onPress={handleStepForward}
          disabled={isAnyLoading}
        >
          {isStepLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="arrow-forward-outline" size={10} color="#FFFFFF" />
          )}

          <Text style={styles.controlText}>
            {isStepLoading ? "Wait" : "Forward"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isAnyLoading && styles.disabledBtn]}
          onPress={handleRun}
          disabled={isAnyLoading}
        >
          {isRunLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="play-outline" size={10} color="#FFFFFF" />
          )}

          <Text style={styles.controlText}>
            {isRunLoading ? "Running" : "Run"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isAnyLoading && styles.disabledBtn]}
          onPress={handleReload}
          disabled={isAnyLoading}
        >
          <Ionicons name="refresh-outline" size={10} color="#FFFFFF" />
          <Text style={styles.controlText}>Reload</Text>
        </TouchableOpacity>
      </View>

      {/* ================= TOP HALF: PROGRAM DISPLAY ================= */}
      <View style={styles.programSection}>
        <Text style={styles.sectionTitle}>Program Display</Text>

        <ScrollView
          style={styles.programBox}
          ref={scrollRef}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {program.map((line, index) => (
            <Text
              key={index}
              style={[
                styles.programText,
                index === currentLine && styles.highlightLine,
              ]}
            >
              {line}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* ================= BOTTOM HALF: REGISTERS + FLAGS ================= */}
      <View style={styles.registerSection}>
        <ScrollView
          style={styles.registerScroll}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.sectionTitle}>Register Display</Text>

          <View style={styles.registerBox}>
            <View style={styles.dynamicGrid}>
              {registers.map((reg, index) => (
                <View key={index} style={styles.dynamicRegItem}>
                  <Text style={styles.regName}>{reg.name}</Text>

                  <View style={styles.valueBox}>
                    <Text
                      style={styles.valueText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.45}
                    >
                      {reg.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Flag Registers</Text>

          <View style={styles.registerBox}>
            <View style={styles.dynamicGrid}>
              {flags.map((flag, index) => (
                <View key={index} style={styles.dynamicRegItem}>
                  <Text style={styles.regName}>{flag.name}</Text>

                  <View style={styles.valueBox}>
                    <Text
                      style={styles.valueText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.45}
                    >
                      {flag.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>OutPut Display</Text>

          <View style={styles.outputBox}>
            <Text style={styles.outputText}>{output || "No Output"}</Text>
          </View>

          <View style={{ height: 25 }} />
        </ScrollView>
      </View>
    </View>
  </View>
);
};

export default Debugging;

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },

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
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    padding: 16,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },

  controlBtn: {
    width: "24%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C3E94",
    borderWidth: 1,
    borderColor: "#2C3E94",
    paddingVertical: 8,
    paddingHorizontal: 1,
    borderRadius: 8,
    justifyContent: "center",
  },

  disabledBtn: {
    opacity: 0.6,
  },

  controlText: {
    marginLeft: 2,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 8,
  },

  programSection: {
    flex: 1,
    marginBottom: 10,
  },

  registerSection: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },

  programBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  programText: {
    paddingVertical: 6,
    color: "#6C7A89",
  },

  highlightLine: {
    backgroundColor: "#FFF3A3",
    color: "#000",
    borderRadius: 5,
    paddingHorizontal: 6,
  },

  registerScroll: {
    flex: 1,
  },

  registerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
  },

  regName: {
    marginBottom: 5,
    fontWeight: "500",
  },

  valueBox: {
    width: 70,
    height: 45,
    borderWidth: 1,
    borderColor: "#C5C5C5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 4,
  },

  valueText: {
    fontSize: 16,
    textAlign: "center",
    width: "100%",
  },

  dynamicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
  },

  dynamicRegItem: {
    minWidth: 80,
    maxWidth: 110,
    flexGrow: 1,
    alignItems: "center",
    marginBottom: 15,
  },

  outputBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    minHeight: 55,
    marginBottom: 10,
  },

  outputText: {
    fontSize: 12,
    color: "#64748B",
  },
});