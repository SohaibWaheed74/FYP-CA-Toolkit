import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Debugging = () => {
  const route = useRoute();
  const scrollRef = useRef(null);
  const runInterval = useRef(null);

  // ================= RECEIVE PROGRAM =================
  const [program, setProgram] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (route.params?.program) {
      setProgram(route.params.program);
      setCurrentLine(0);
    }
  }, [route.params]);

  // ================= MOCK REGISTERS (API LATER) =================
  const [registers, setRegisters] = useState([
    { name: "R1", value: 0 },
    { name: "R2", value: 0 },
    { name: "R3", value: 0 },
    { name: "R4", value: 0 },
    { name: "PC", value: 0 },
    { name: "IR", value: 0 },
  ]);

  const [flags, setFlags] = useState([
    { name: "Carry", value: 0 },
    { name: "Overflow", value: 0 },
    { name: "Sign", value: 0 },
    { name: "Zero", value: 0 },
  ]);

  // ================= STEP FORWARD =================
  const handleStepForward = () => {
    if (currentLine < program.length - 1) {
      const next = currentLine + 1;
      setCurrentLine(next);
      updatePC(next);
    }
  };

  // ================= STEP BACK =================
  const handleStepBack = () => {
    if (currentLine > 0) {
      const prev = currentLine - 1;
      setCurrentLine(prev);
      updatePC(prev);
    }
  };

  // ================= RUN FULL PROGRAM =================
  const handleRun = () => {
    if (isRunning) return;

    setIsRunning(true);

    runInterval.current = setInterval(() => {
      setCurrentLine(prev => {
        if (prev >= program.length - 1) {
          clearInterval(runInterval.current);
          setIsRunning(false);
          return prev;
        }

        const next = prev + 1;
        updatePC(next);
        return next;
      });
    }, 700);
  };

  // ================= RELOAD =================
  const handleReload = () => {
    clearInterval(runInterval.current);
    setIsRunning(false);
    setCurrentLine(0);
    updatePC(0);
  };

  // ================= UPDATE PC REGISTER =================
  const updatePC = (value) => {
    setRegisters(prev =>
      prev.map(reg =>
        reg.name === "PC" ? { ...reg, value: value } : reg
      )
    );
  };

  // ================= AUTO SCROLL =================
  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: currentLine * 35,
      animated: true,
    });
  }, [currentLine]);

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.heading}>Debugging</Text>

      {/* ================= CONTROL BUTTONS ================= */}
      <View style={styles.buttonRow}>

        <TouchableOpacity style={styles.controlBtn} onPress={handleStepBack}>
          <Ionicons name="arrow-back-outline" size={18} />
          <Text style={styles.controlText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={handleStepForward}>
          <Ionicons name="arrow-forward-outline" size={18} />
          <Text style={styles.controlText}>Step</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={handleRun}>
          <Ionicons name="play-outline" size={18} />
          <Text style={styles.controlText}>
            {isRunning ? "Running..." : "Run"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={handleReload}>
          <Ionicons name="refresh-outline" size={18} />
          <Text style={styles.controlText}>Reload</Text>
        </TouchableOpacity>

      </View>

      {/* ================= PROGRAM DISPLAY ================= */}
      <Text style={styles.sectionTitle}>Program Display</Text>

      <ScrollView style={styles.programBox} ref={scrollRef}>
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

      {/* ================= REGISTER DISPLAY ================= */}
      <Text style={styles.sectionTitle}>Register Display</Text>

      <View style={styles.registerBox}>
        <View style={styles.grid}>
          {registers.map((reg, index) => (
            <View key={index} style={styles.regItem}>
              <Text style={styles.regName}>{reg.name}</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{reg.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ================= FLAG REGISTERS ================= */}
      <Text style={styles.sectionTitle}>Flag Registers</Text>

      <View style={styles.registerBox}>
        <View style={styles.grid}>
          {flags.map((flag, index) => (
            <View key={index} style={styles.regItem}>
              <Text style={styles.regName}>{flag.name}</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueText}>{flag.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default Debugging;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2C3E94",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C3E94",
    padding: 8,
    borderRadius: 8,
  },
  controlText: {
    marginLeft: 5,
    color: "#2C3E94",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },
  programBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 250,
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
  registerBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  regItem: {
    width: "22%",
    alignItems: "center",
    marginBottom: 15,
  },
  regName: {
    marginBottom: 5,
    fontWeight: "500",
  },
  valueBox: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#C5C5C5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  valueText: {
    fontSize: 16,
  },
});
