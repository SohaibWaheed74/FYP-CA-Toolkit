import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  createArchitecture,
  addRegisters,
  addInstructions,
  addAddressingModes
} from "../api/architectureApi";


const OPERAND_TYPES = [
    { label: "Register", value: "Register" },
    { label: "Immediate", value: "Immediate" },
    { label: "Memory", value: "Memory" },
];

const INTERRUPT_SYMBOLS = [
    { label: "1(Input)", value: "1(Input)" },
    { label: "2(Output)", value: "2(Output)" },
];

export default function InstructionDesign() {
    const navigation = useNavigation();
    const route = useRoute();

    const { cpuData, flagRegisters, gpRegisters, addressingList } =
        route.params || {};

    const registers = gpRegisters?.map(r => ({ label: r, value: r })) || [];

    const [opcode, setOpcode] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [action, setAction] = useState("");

    const [isInterrupt, setIsInterrupt] = useState(false);
    const [interruptSymbol, setInterruptSymbol] = useState(null);
    const [inputRegister, setInputRegister] = useState(null);
    const [outputRegister, setOutputRegister] = useState(null);

    const [operands, setOperands] = useState([
        { id: 1, type: "Register", isDestination: true },
    ]);

    const [instructions, setInstructions] = useState([]);

    // OPERAND FUNCTIONS
    const addOperand = () => {
        setOperands(prev => [
            ...prev,
            { id: prev.length + 1, type: "Register", isDestination: false },
        ]);
    };

    const updateOperandType = (id, type) => {
        setOperands(prev =>
            prev.map(op => (op.id === id ? { ...op, type } : op))
        );
    };

    const selectDestination = id => {
        setOperands(prev =>
            prev.map(op => ({ ...op, isDestination: op.id === id }))
        );
    };

    const deleteOperand = id => {
        if (operands.length === 1) return;
        let updated = operands.filter(op => op.id !== id);
        if (!updated.some(op => op.isDestination)) {
            updated[0].isDestination = true;
        }
        setOperands(updated);
    };

    // ADD INSTRUCTION
    const handleAddInstruction = () => {
        const instruction = {
            opcode,
            mnemonic,
            isInterrupt,
            interruptSymbol,
            operands: isInterrupt ? [] : operands,
            inputRegister,
            outputRegister,
            action,
        };

        setInstructions(prev => [...prev, instruction]);

        // RESET FIELDS AFTER ADDING
        setOpcode("");
        setMnemonic("");
        setAction("");
        setOperands([{ id: 1, type: "Register", isDestination: true }]);
        setInterruptSymbol(null);
        setInputRegister(null);
        setOutputRegister(null);
        setIsInterrupt(false);
    };

    const handleCreateArchitecture = () => {
        const architecture = {
            cpuData,
            flagRegisters,
            gpRegisters,
            addressingList,
            instructions,
        };
        console.log("Final Architecture:", architecture);
        navigation.navigate("Testing", { architecture });
    };

    return (
        <View style={{ flex: 1 }}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Instruction Design</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    {/* INTERRUPT TOGGLE */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setIsInterrupt(!isInterrupt)}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                isInterrupt && styles.checkboxChecked,
                            ]}
                        />
                        <Text style={{ marginLeft: 8 }}> Interrupt Instruction</Text>
                    </TouchableOpacity>

                    {/* OPCODE */}
                    <Text style={styles.label}>Opcode</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter instruction Code(e.g., 01)"
                        placeholderTextColor="black"
                        value={opcode}
                        onChangeText={setOpcode}
                    />

                    {/* MNEMONIC */}
                    <Text style={styles.label}>Mnemonic</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Mnemonic(e.g., ADD, SUB)"
                        placeholderTextColor="black"
                        value={mnemonic}
                        onChangeText={setMnemonic}
                    />

                    {/* NORMAL INSTRUCTION */}
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
                                        style={[
                                            styles.radio,
                                            op.isDestination && styles.radioSelected,
                                        ]}
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

                    {/* INTERRUPT INSTRUCTION - ALWAYS MOUNTED */}
                    <View style={{ display: isInterrupt ? "flex" : "none" }}>
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
                            data={registers}
                            labelField="label"
                            valueField="value"
                            value={inputRegister}
                            onChange={item => setInputRegister(item.value)}
                        />

                        <Text style={styles.label}>Output Register</Text>
                        <Dropdown
                            style={styles.dropdownFull}
                            placeholder="Select Output Register"
                            data={registers}
                            labelField="label"
                            valueField="value"
                            value={outputRegister}
                            onChange={item => setOutputRegister(item.value)}
                        />
                    </View>

                    {/* ACTION */}
                    <Text style={styles.label}>Action</Text>
                    <TextInput
                        style={[styles.input, { height: 90 }]}
                        multiline
                        value={action}
                        placeholder="// Write Java Code Here for Logic of Instruction"
                        placeholderTextColor="black"
                        onChangeText={setAction}
                    />

                    {/* ADD INSTRUCTION */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAddInstruction}
                    >
                        <Text style={styles.buttonText}>ADD</Text>
                    </TouchableOpacity>

                    {/* DISPLAY ADDED INSTRUCTIONS */}
                    {instructions.map((instr, index) => (
                        <View key={index} style={styles.instructionCard}>
                            <Text style={styles.cardTitle}>
                                {instr.mnemonic || "(No Mnemonic)"}
                            </Text>
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
                                    {instr.operands
                                        .map(op => `${op.type}${op.isDestination ? "(D)" : ""}`)
                                        .join(", ")}
                                </Text>
                            )}
                            <Text>Action: {instr.action || "(No Action)"}</Text>
                        </View>
                    ))}

                    {/* CREATE ARCHITECTURE */}
                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={handleCreateArchitecture}
                    >
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
    headerTitle: {
        color: "#1E3A8A",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },
    container: { padding: 16, backgroundColor: "#f5f7fb" },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
    label: { marginTop: 12, fontWeight: "bold" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
    },
    operandRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6,
    },
    dropdown: {
        width: 130,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        marginHorizontal: 6,
    },
    dropdownFull: {
        height: 42,
        borderWidth: 1,
        borderColor: "#ccc",
        marginVertical: 6,
    },
    radio: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderRadius: 9,
        borderColor: "#1f3c88",
    },
    radioSelected: { backgroundColor: "#1f3c88" },
    plus: { fontSize: 22, marginLeft: 4 },
    delete: { fontSize: 18, marginLeft: 4 },
    button: {
        backgroundColor: "#1f3c88",
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: "#1f3c88",
    },
    checkboxChecked: {
        backgroundColor: "#1f3c88",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingHorizontal: 2,
        paddingRight: 115,
    },
    createBtn: {
        backgroundColor: "#1f3c88",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    instructionCard: {
        backgroundColor: "#e8eaf6",
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    cardTitle: { fontWeight: "bold", marginBottom: 4 },
});
