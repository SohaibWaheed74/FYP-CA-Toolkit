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

const OPERAND_TYPES = [
    { label: "Register", value: "Register" },
    { label: "Immediate", value: "Immediate" },
    { label: "Memory", value: "Memory" },
];

const REGISTER_OPTIONS = [
    { label: "R0", value: "R0" },
    { label: "R1", value: "R1" },
    { label: "R2", value: "R2" },
    { label: "R3", value: "R3" },
];

const INTERRUPT_SYMBOLS = [
    { label: "INT 0", value: "INT0" },
    { label: "INT 1", value: "INT1" },
    { label: "INT 2", value: "INT2" },
];

export default function InstructionDesign({ route }) {

    const registers = route?.params?.registers || REGISTER_OPTIONS;

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

    const selectDestination = (id) => {
        setOperands(prev =>
            prev.map(op => ({
                ...op,
                isDestination: op.id === id,
            }))
        );
    };

    const deleteOperand = (id) => {
        if (operands.length === 1) return;

        let updated = operands.filter(op => op.id !== id);
        if (!updated.some(op => op.isDestination)) {
            updated[0].isDestination = true;
        }
        setOperands(updated);
    };


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

        console.log("Instruction Added:", instruction);
        setInstructions(prev => [...prev, instruction]);

        // RESET
        setOpcode("");
        setMnemonic("");
        setAction("");
        setOperands([{ id: 1, type: "Register", isDestination: true }]);
        setInterruptSymbol(null);
        setInputRegister(null);
        setOutputRegister(null);
        setIsInterrupt(false);
    };
    // CREATE ARCHITECTURE 
    const handleCreateArchitecture = () => {
        const architecture = { cpuData, registers, instructions, }; 
        console.log("Final Architecture:", architecture); 
        // 🔜 FUTURE API CALL 
        // api.post("/architecture", architecture) 
        };


        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Instruction Design</Text>

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
                        value={opcode}
                        onChangeText={setOpcode}
                    />

                    {/* MNEMONIC */}
                    <Text style={styles.label}>Mnemonic</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Mnemonic(e.g., ADD, SUB)"
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
                                        onChange={item =>
                                            updateOperandType(op.id, item.value)
                                        }
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

                    {/* INTERRUPT */}
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
                        </>
                    )}

                    {/* ACTION */}
                    <Text style={styles.label}>Action</Text>
                    <TextInput
                        style={[styles.input, { height: 90 }]}
                        multiline
                        value={action}
                        placeholder="// Write Java Code Here for Logic of Instruction"
                        onChangeText={setAction}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleAddInstruction}>
                        <Text style={styles.buttonText}>ADD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.createBtn} onPress={handleCreateArchitecture} >
                        <Text style={styles.buttonText}>CreateArchitecture</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    /* =======================
            STYLES
    ======================= */

    const styles = StyleSheet.create({
        container: { padding: 16, backgroundColor: "#f5f7fb" },
        card: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
        title: { fontSize: 20, fontWeight: "600", textAlign: "center" },
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
            textAlign: "center" 
        },
        checkboxRow: { 
            flexDirection: "row", 
            alignItems: "center", 
            marginBottom: 10 
        },
        checkbox: {
            width: 18,
            height: 18,
            borderWidth: 2,
            borderColor: "#1f3c88",
        },
        checkboxChecked: {
            backgroundColor: "#1f3c88"
        },
        headerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            paddingHorizontal: 2,
            paddingRight: 115
        },
        createBtn: { 
            backgroundColor: "#1f3c88", 
            padding: 12, 
            borderRadius: 8, 
            marginTop: 10, 
        },
        buttonText: { 
            color: "#fff", 
            textAlign: "center", 
            fontWeight: "600", 

        },

    });
