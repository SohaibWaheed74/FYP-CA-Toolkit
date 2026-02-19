import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Debugging = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const scrollRef = useRef(null);
    const runInterval = useRef(null);

    // ================= RECEIVE PROGRAM =================
    const [program, setProgram] = useState([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState("");

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
        { name: "Sp", value: 0 },
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
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Debugging</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.container}>

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
                    <View style={styles.dynamicGrid}>
                        {registers.map((reg, index) => (
                            <View key={index} style={styles.dynamicRegItem}>
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
                    <View style={styles.dynamicGrid}>
                        {flags.map((flag, index) => (
                            <View key={index} style={styles.dynamicRegItem}>
                                <Text style={styles.regName}>{flag.name}</Text>
                                <View style={styles.valueBox}>
                                    <Text style={styles.valueText}>{flag.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* output Display */}
                <Text style={styles.sectionTitle}>OutPut Display</Text>
                <View style={styles.outputBox}>
                    <Text style={styles.outputText}>{output || "No Output"}</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

export default Debugging;

// ================= STYLES =================
const styles = StyleSheet.create({
    header: {
        height: 56,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    container: {
        flex: 1,
        backgroundColor: "#F4F6FB",
        padding: 16,
    },
    headerTitle: {
        color: "#1E3A8A",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#2C3E94",
        paddingVertical: 8,
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
    dynamicGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start", // align items to the left
        gap: 12, // spacing between items (works in RN 0.71+)
    },

    dynamicRegItem: {
        minWidth: 70, // minimum width for a register
        maxWidth: 90, // max width
        flexGrow: 1,  // allows shrinking and expanding dynamically
        alignItems: "center",
        marginBottom: 15,
    },
    outputTitle: { fontSize: 12, fontWeight: "600", color: "#334155", marginBottom: 4, marginTop: 2 },
    outputBox: { backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#E1E7F5", minHeight: 55 },
    outputText: { fontSize: 12, color: "#64748B" },

});
