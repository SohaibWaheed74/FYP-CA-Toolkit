import React, { useState, useEffect, useRef } from "react";
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

const Debugging = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const scrollRef = useRef(null);
    const runInterval = useRef(null);

    const architecture = route.params?.architecture || null;

    const architectureId =
        route.params?.architectureId ||
        route.params?.architecture?.ArchitectureID ||
        route.params?.architecture?.architectureID ||
        route.params?.architecture?.id ||
        route.params?.architecture?.architectureId;

    const routeRegisters = route.params?.registers || [];
    const routeFlags = route.params?.flags || [];

    // ================= RECEIVE PROGRAM =================
    const [program, setProgram] = useState([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);

    // false = no loading, "step" = step loading, "run" = run loading
    const [isRunning, setIsRunning] = useState(false);

    const [output, setOutput] = useState("");

    // ================= DYNAMIC REGISTERS / FLAGS FROM DATABASE =================
    const [registers, setRegisters] = useState([]);
    const [flags, setFlags] = useState([]);
    const [generalRegisters, setGeneralRegisters] = useState([]);
    const [flagRegisters, setFlagRegisters] = useState([]);

    const isStepLoading = isRunning === "step";
    const isRunLoading = isRunning === "run";
    const isAnyLoading = isStepLoading || isRunLoading;

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

    const makeFlagBoxes = (items = []) => {
        if (!Array.isArray(items)) return [];

        return items.map((flag, index) => ({
            name:
                flag?.name ||
                flag?.Name ||
                flag?.FlagName ||
                flag?.flagName ||
                flag?.FlagRegisterName ||
                flag?.flagRegisterName ||
                flag?.RegisterName ||
                flag?.registerName ||
                `F${index + 1}`,
            value: 0,
        }));
    };

    const getRegisterSource = () => {
        if (generalRegisters.length > 0) return generalRegisters;
        if (routeRegisters.length > 0) return routeRegisters;

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
        if (flagRegisters.length > 0) return flagRegisters;
        if (routeFlags.length > 0) return routeFlags;

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

    // ================= OUTPUT SAME AS REGISTER VISUALIZATION =================
    const getOutputFromResult = (result) => {
        const errors = result?.Errors || result?.errors || [];

        if (errors.length > 0) {
            return errors.join("\n");
        }

        const registersArray = result?.Registers || result?.registers || [];

        return `Result: ${registersArray[0] ?? 0}`;
    };

    // ================= INITIAL PROGRAM RECEIVE =================
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

    // ================= FETCH CORRECT DB REGISTER / FLAG NAMES =================
    useEffect(() => {
        let isMounted = true;

        const fetchDetails = async () => {
            try {
                if (!architectureId) return;

                const data = await getArchitectureDetails(architectureId);

                if (!isMounted) return;

                const dbGeneralRegisters = data?.generalRegisters || [];
                const dbFlagRegisters = data?.flagRegisters || [];

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

    // ================= FALLBACK IF DETAILS API DOES NOT RETURN =================
    useEffect(() => {
        if (generalRegisters.length === 0 && routeRegisters.length > 0) {
            setRegisters(makeRegisterBoxes(routeRegisters));
        }

        if (flagRegisters.length === 0 && routeFlags.length > 0) {
            setFlags(makeFlagBoxes(routeFlags));
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
        const dbFlagBoxes = getArchitectureFlags();

        if (!apiFlags || !Array.isArray(apiFlags)) {
            return dbFlagBoxes;
        }

        if (dbFlagBoxes.length > 0) {
            return dbFlagBoxes.map((flag, index) => ({
                name: flag.name,
                value:
                    apiFlags[index] === true
                        ? 1
                        : apiFlags[index] === false
                        ? 0
                        : apiFlags[index] ?? 0,
            }));
        }

        return [];
    };

    // ================= STEP FORWARD USING EXECUTE API =================
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

            // First click: first instruction
            // Second click: first + second instruction
            // Third click: first + second + third instruction
            const stepProgramLines = program.slice(0, stepIndex + 1);

            const result = await executeProgram(architectureId, stepProgramLines);

            const updatedRegisters = mapApiRegistersWithDbNames(result?.Registers);
            const updatedFlags = mapApiFlagsWithDbNames(result?.Flags);

            setRegisters(updatedRegisters);
            setFlags(updatedFlags);
            setOutput(getOutputFromResult(result));

            // highlight the line that was actually executed
            setCurrentLine(stepIndex);

            // prepare next step
            setStepIndex((prev) => prev + 1);
        } catch (error) {
            setOutput(String(error));
        } finally {
            setIsRunning(false);
        }
    };

    // ================= STEP BACK =================
    const handleStepBack = () => {
        if (isAnyLoading) return;

        if (stepIndex > 0) {
            const prevStep = stepIndex - 1;
            const prevLine = prevStep > 0 ? prevStep - 1 : 0;

            setStepIndex(prevStep);
            setCurrentLine(prevLine);
            updatePC(prevLine);
        }
    };

    // ================= RUN FULL PROGRAM WITH EXECUTE API =================
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

            const result = await executeProgram(architectureId, program);

            const updatedRegisters = mapApiRegistersWithDbNames(result?.Registers);
            const updatedFlags = mapApiFlagsWithDbNames(result?.Flags);

            setRegisters(updatedRegisters);
            setFlags(updatedFlags);
            setOutput(getOutputFromResult(result));

            setCurrentLine(program.length - 1);
            setStepIndex(program.length);
        } catch (error) {
            setOutput(String(error));
        } finally {
            setIsRunning(false);
        }
    };

    // ================= RELOAD =================
    const handleReload = () => {
        if (isAnyLoading) return;

        clearInterval(runInterval.current);
        setIsRunning(false);
        setCurrentLine(0);
        setStepIndex(0);
        setOutput("");

        setRegisters(getArchitectureRegisters());
        setFlags(getArchitectureFlags());
    };

    // ================= UPDATE PC REGISTER =================
    const updatePC = (value) => {
        setRegisters((prev) =>
            prev.map((reg) =>
                reg.name === "PC" || reg.name === "Pc" || reg.name === "pc"
                    ? { ...reg, value: value }
                    : reg
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
                    <TouchableOpacity
                        style={[
                            styles.controlBtn,
                            isAnyLoading && styles.disabledBtn,
                        ]}
                        onPress={handleStepBack}
                        disabled={isAnyLoading}
                    >
                        <Ionicons
                            name="arrow-back-outline"
                            size={18}
                            color="#2C3E94"
                        />
                        <Text style={styles.controlText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.controlBtn,
                            isAnyLoading && styles.disabledBtn,
                        ]}
                        onPress={handleStepForward}
                        disabled={isAnyLoading}
                    >
                        {isStepLoading ? (
                            <ActivityIndicator size="small" color="#2C3E94" />
                        ) : (
                            <Ionicons
                                name="arrow-forward-outline"
                                size={18}
                                color="#2C3E94"
                            />
                        )}

                        <Text style={styles.controlText}>
                            {isStepLoading ? "Wait" : "Step"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.controlBtn,
                            isAnyLoading && styles.disabledBtn,
                        ]}
                        onPress={handleRun}
                        disabled={isAnyLoading}
                    >
                        {isRunLoading ? (
                            <ActivityIndicator size="small" color="#2C3E94" />
                        ) : (
                            <Ionicons
                                name="play-outline"
                                size={18}
                                color="#2C3E94"
                            />
                        )}

                        <Text style={styles.controlText}>
                            {isRunLoading ? "Running..." : "Run"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.controlBtn,
                            isAnyLoading && styles.disabledBtn,
                        ]}
                        onPress={handleReload}
                        disabled={isAnyLoading}
                    >
                        <Ionicons
                            name="refresh-outline"
                            size={18}
                            color="#2C3E94"
                        />
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

                {/* ================= OUTPUT DISPLAY ================= */}
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
        minWidth: 74,
        justifyContent: "center",
    },
    disabledBtn: {
        opacity: 0.6,
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
        justifyContent: "flex-start",
        gap: 12,
    },
    dynamicRegItem: {
        minWidth: 70,
        maxWidth: 90,
        flexGrow: 1,
        alignItems: "center",
        marginBottom: 15,
    },
    outputTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 4,
        marginTop: 2,
    },
    outputBox: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E1E7F5",
        minHeight: 55,
    },
    outputText: {
        fontSize: 12,
        color: "#64748B",
    },
});