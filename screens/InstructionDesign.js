import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createFullArchitecture } from "../api/architectureApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Numeric operand types for backend: 0=Register, 1=Immediate, 2=Memory
const OPERAND_TYPES = [
    { label: "Register", value: 0 },
    { label: "Immediate", value: 1 },
    { label: "Memory", value: 2 },
];

const INTERRUPT_SYMBOLS = [
    { label: "1(Input)", value: "1(Input)" },
    { label: "2(Output)", value: "2(Output)" },
];

export default function InstructionDesign() {
    const navigation = useNavigation();
    const route = useRoute();
    const { cpuData, flagRegisters, gpRegisters, addressingList } = route.params || {};

    const registers = gpRegisters?.map(r => ({ label: r, value: r })) || [];

    const [opcode, setOpcode] = useState("");
    const [mnemonics, setMnemonics] = useState("");
    const [action, setAction] = useState("");
    const [isInterrupt, setIsInterrupt] = useState(false);
    const [interruptSymbol, setInterruptSymbol] = useState(null);
    const [inputRegister, setInputRegister] = useState(null);
    const [outputRegister, setOutputRegister] = useState(null);

    const [operandCounter, setOperandCounter] = useState(2); // ID counter for operands
    const [operands, setOperands] = useState([{ id: 1, type: 0, isDestination: true }]);
    const [instructions, setInstructions] = useState([]);

    const maxInstructions = parseInt(cpuData?.instructionCount) || 0;

    // Reset outputRegister if it conflicts with inputRegister
    useEffect(() => {
        if (outputRegister === inputRegister) {
            setOutputRegister(null);
        }
    }, [inputRegister]);

    // Reset inputRegister if it conflicts with outputRegister
    useEffect(() => {
        if (inputRegister === outputRegister) {
            setInputRegister(null);
        }
    }, [outputRegister]);

    // OPERAND FUNCTIONS
    const addOperand = () => {
        setOperands(prev => {
            const newOp = { id: operandCounter, type: 0, isDestination: false };
            setOperandCounter(prevCount => prevCount + 1);
            return [...prev, newOp];
        });
    };

    const updateOperandType = (id, type) => {
        setOperands(prev => prev.map(op => (op.id === id ? { ...op, type } : op)));
    };

    const selectDestination = id => {
        const selected = operands.find(op => op.id === id);

        if (selected?.type === 1) {
            Alert.alert("Invalid", "Immediate value cannot be destination");
            return;
        }

        setOperands(prev =>
            prev.map(op => ({ ...op, isDestination: op.id === id }))
        );
    };

    const deleteOperand = id => {
        if (operands.length === 1) return;
        const updated = operands.filter(op => op.id !== id);
        if (!updated.some(op => op.isDestination)) updated[0].isDestination = true;
        setOperands(updated);
    };

    // ADD INSTRUCTION
    // FIXED handleAddInstruction (no mutation of operandsData)
    const handleAddInstruction = () => {
        if (instructions.length >= maxInstructions) {
            Alert.alert(
                "Limit Reached",
                `You can only add ${maxInstructions} instructions as defined in CPU Design.`
            );
            return;
        }

        let operandsData = [];

        if (!isInterrupt) {
            operandsData = operands.map(op => ({
                type: op.type,
                isDestination: op.isDestination
            }));
        }

        // 🔥 STEP 1: FORCE ONLY ONE DESTINATION (CRITICAL FIX)
        let firstDestinationIndex = operandsData.findIndex(op => op.isDestination);

        if (firstDestinationIndex === -1 && operandsData.length > 0) {
            firstDestinationIndex = 0;
        }

        operandsData = operandsData.map((op, idx) => ({
            ...op,
            isDestination: idx === firstDestinationIndex
        }));

        // 🔥 STEP 2: SAFE INDEX (NEVER -1)
        const destinationOperand = isInterrupt
            ? null
            : firstDestinationIndex + 1;

        const instructionFormat =
            isInterrupt ? 3 : parseInt(operandsData.map(op => op.type).join("")) || 0;

        const numberOfOperands = isInterrupt ? 0 : operandsData.length;

        const instruction = {
            Opcode: opcode,
            Mnemonics: mnemonics,
            InterruptSymbol: interruptSymbol,
            InputRegister: inputRegister,
            OutputRegister: outputRegister,
            Action: action,
            NumberOfOperands: numberOfOperands,
            DestinationOperand: destinationOperand,
            InstructionFormat: instructionFormat,

            opcode,
            mnemonics,
            isInterrupt,
            interruptSymbol,
            inputRegister,
            outputRegister,
            action,
            numberOfOperands,
            destinationOperand,
            instructionFormat,
            operands: operandsData,
        };

        setInstructions(prev => [...prev, instruction]);

        // Reset form (UNCHANGED)
        setOpcode("");
        setMnemonics("");
        setAction("");
        setOperands([{ id: 1, type: 0, isDestination: true }]);
        setOperandCounter(2);
        setInterruptSymbol(null);
        setInputRegister(null);
        setOutputRegister(null);
        setIsInterrupt(false);
    };
    // CREATE ARCHITECTURE
    const handleCreateArchitecture = async () => {
        try {
            if (!cpuData?.architectureName) {
                Alert.alert("Error", "CPU data is missing");
                return;
            }

            const normalizedAddressingModes = (addressingList || []).map(mode => ({
                AddressingModeName: mode.mode,
                AddressingModeCode: mode.code,
                AddressingModeSymbol: mode.symbol ?? null,
            }));

            const fullData = {
                architecture: {
                    name: cpuData.architectureName,
                    memorySize: parseInt(cpuData.memorySize) || 0,
                    stackSize: parseInt(cpuData.stackSize) || 0,
                    busSize: parseInt(cpuData.busSize) || 0,
                    numberOfRegisters: parseInt(cpuData.registerCount) || 0,
                    numberOfInstructions: parseInt(cpuData.instructionCount) || 0,
                },
                registers: [
                    ...gpRegisters.map(r => ({ name: r, action: "" })),
                    ...flagRegisters.map(f => ({ name: f.name, action: f.action ?? "" })),
                ],
                instructions,
                addressingModes: normalizedAddressingModes,
            };

            const result = await createFullArchitecture(fullData);

            if (result?.message) {
                await AsyncStorage.removeItem("cpuData");
                Alert.alert("Success", result.message);

                navigation.reset({
                    index: 0,
                    routes: [{ name: "CpuDesign" }],
                });
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message);
        }
    };

    // Compute filtered register options
    const inputRegisterOptions = registers.filter(r => r.value !== outputRegister);
    const outputRegisterOptions = registers.filter(r => r.value !== inputRegister);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Instruction Design</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setIsInterrupt(!isInterrupt)}
                    >
                        <View style={[styles.checkbox, isInterrupt && styles.checkboxChecked]} />
                        <Text style={{ marginLeft: 8 }}>Interrupt Instruction</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Opcode</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter instruction Code(e.g., 01)"
                        placeholderTextColor="black"
                        value={opcode}
                        onChangeText={setOpcode}
                    />

                    <Text style={styles.label}>Mnemonic</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Mnemonic(e.g., ADD, SUB)"
                        placeholderTextColor="black"
                        value={mnemonics}
                        onChangeText={setMnemonics}
                    />

                    {!isInterrupt && (
                        <>
                            <View style={styles.headerRow}>
                                <Text style={styles.label}>Operands</Text>
                                <Text style={styles.label}>Destination</Text>
                            </View>

                            {operands.map((op, index) => (
                                <View key={op.id} style={styles.operandRow}>
                                    <Text>Operand {index + 1}</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        data={OPERAND_TYPES}
                                        labelField="label"
                                        valueField="value"
                                        value={op.type}
                                        onChange={item => updateOperandType(op.id, item.value)}
                                    />
                                    <TouchableOpacity
                                        style={[styles.radio, op.isDestination && styles.radioSelected]}
                                        onPress={() => selectDestination(op.id)}
                                    />
                                    {operands.length > 1 && (
                                        <TouchableOpacity onPress={() => deleteOperand(op.id)}>
                                            <Text style={styles.delete}>🗑</Text>
                                        </TouchableOpacity>
                                    )}
                                    {index === operands.length - 1 && (
                                        <TouchableOpacity onPress={addOperand}>
                                            <Text style={styles.plus}>＋</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {isInterrupt && (
                        <>
                            <Text style={styles.label}>Interrupt</Text>
                            <Dropdown
                                style={styles.dropdownFull}
                                data={INTERRUPT_SYMBOLS}
                                labelField="label"
                                valueField="value"
                                value={interruptSymbol}
                                onChange={item => setInterruptSymbol(item.value)}
                            />

                            <Text style={styles.label}>Input Register</Text>
                            <Dropdown
                                style={styles.dropdownFull}
                                placeholder="Select Input Register"
                                data={inputRegisterOptions}
                                labelField="label"
                                valueField="value"
                                value={inputRegister}
                                onChange={item => setInputRegister(item.value)}
                            />

                            <Text style={styles.label}>Output Register</Text>
                            <Dropdown
                                style={styles.dropdownFull}
                                placeholder="Select Output Register"
                                data={outputRegisterOptions}
                                labelField="label"
                                valueField="value"
                                value={outputRegister}
                                onChange={item => setOutputRegister(item.value)}
                            />
                        </>
                    )}

                    <Text style={styles.label}>Action</Text>
                    <TextInput
                        style={[styles.input, { height: 90 }]}
                        multiline
                        placeholder="// Write Java Code Here for Logic of Instruction"
                        placeholderTextColor="black"
                        value={action}
                        onChangeText={setAction}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleAddInstruction}>
                        <Text style={styles.buttonText}>ADD</Text>
                    </TouchableOpacity>

                    {instructions.map((instr, index) => (
                        <View key={index} style={styles.instructionCard}>
                            <Text style={styles.cardTitle}>{instr.mnemonics || "(No Mnemonic)"}</Text>
                            <Text>Opcode: {instr.opcode}</Text>
                            {instr.isInterrupt ? (
                                <>
                                    <Text>Interrupt: {instr.interruptSymbol}</Text>
                                    <Text>Input Register: {instr.inputRegister}</Text>
                                    <Text>Output Register: {instr.outputRegister}</Text>
                                </>
                            ) : (
                                <Text>
                                    Operands:{" "}
                                    {instr.operands.map(op => `${op.type}${op.isDestination ? "(D)" : ""}`).join(", ")}
                                </Text>
                            )}
                            <Text>Number of Operands: {instr.numberOfOperands}</Text>
                            <Text>Destination Operand: {instr.destinationOperand}</Text>
                            <Text>Instruction Format: {instr.instructionFormat}</Text>
                            <Text>Action: {instr.action || "(No Action)"}</Text>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreateArchitecture}>
                        <Text style={styles.buttonText}>Create Architecture</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// ===== STYLES =====
const styles = StyleSheet.create({
    header: {
        height: 56,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    headerTitle:
    {
        color: "#1E3A8A",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center"
    },
    container:
    {
        padding: 16,
        backgroundColor: "#f5f7fb"
    },
    card:
    {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12
    },
    label:
    {
        marginTop: 12,
        fontWeight: "bold"
    },
    input:
    {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10
    },
    operandRow:
    {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6
    },
    dropdown:
    {
        width: 130,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        marginHorizontal: 6
    },
    dropdownFull:
    {
        height: 42,
        borderWidth: 1,
        borderColor: "#ccc",
        marginVertical: 6
    },
    radio:
    {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderRadius: 9,
        borderColor: "#1f3c88"
    },
    radioSelected:
    {
        backgroundColor: "#1f3c88"
    },
    plus:
    {
        fontSize: 22,
        marginLeft: 4
    },
    delete:
    {
        fontSize: 18,
        marginLeft: 4
    },
    button:
    {
        backgroundColor: "#1f3c88",
        padding: 12,
        borderRadius: 8,
        marginTop: 16
    },
    buttonText:
    {
        color: "#fff",
        textAlign: "center"
    },
    checkboxRow:
    {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    checkbox:
    {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: "#1f3c88"
    },
    checkboxChecked:
    {
        backgroundColor: "#1f3c88"
    },
    headerRow:
    {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingHorizontal: 2,
        paddingRight: 115
    },
    createBtn:
    {
        backgroundColor: "#1f3c88",
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    instructionCard:
    {
        backgroundColor: "#e8eaf6",
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    cardTitle:
    {
        fontWeight: "bold",
        marginBottom: 4
    },
});