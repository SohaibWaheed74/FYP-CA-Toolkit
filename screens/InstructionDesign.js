import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";

const InstructionDesign = ({ route }) => {
    // RECEIVED DATA
    const { cpuData, registers } = route.params;

    // STATES
    const [opcode, setOpcode] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [addressType, setAddressType] = useState("direct");
    const [action, setAction] = useState("");

    const [operands, setOperands] = useState([
        { id: 1, value: "", isDestination: true },
    ]);

    const [instructions, setInstructions] = useState([]);

    // OPERAND HANDLERS
    const addOperand = () => {
        setOperands([
            ...operands,
            {
                id: operands.length + 1,
                value: "",
                isDestination: false,
            },
        ]);
    };

    const updateOperandValue = (id, text) => {
        setOperands(
            operands.map(op =>
                op.id === id ? { ...op, value: text } : op
            )
        );
    };

    const selectDestination = (id) => {
        setOperands(
            operands.map(op => ({
                ...op,
                isDestination: op.id === id,
            }))
        );
    };

    const deleteOperand = (id) => {
        if (operands.length === 1) return;

        const updatedOperands = operands.filter(op => op.id !== id);

        // Ensure at least one destination exists
        if (!updatedOperands.some(op => op.isDestination)) {
            updatedOperands[0].isDestination = true;
        }

        setOperands(updatedOperands);
    };

    // ADD INSTRUCTION
    const handleAddInstruction = () => {
        const instruction = {
            opcode,
            mnemonic,
            addressType,
            operands,
            action,
        };

        setInstructions([...instructions, instruction]);

        // Reset form
        setOpcode("");
        setMnemonic("");
        setAction("");
        setAddressType("direct");
        setOperands([{ id: 1, value: "", isDestination: true }]);

        console.log("Instruction Added:", instruction);
    };

    // CREATE ARCHITECTURE
    const handleCreateArchitecture = () => {
        const architecture = {
            cpuData,
            registers,
            instructions,
        };

        console.log("Final Architecture:", architecture);

        // 🔜 FUTURE API CALL
        // api.post("/architecture", architecture)
    };

    // =========================
    // RENDER
    // =========================
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Instruction Design</Text>

                {/* Opcode */}
                <Text style={styles.label}>OpCode</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter instruction code (e.g., 01)"
                    placeholderTextColor="black"
                    value={opcode}
                    onChangeText={setOpcode}
                />

                {/* Mnemonic */}
                <Text style={styles.label}>Mnemonic</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter mnemonic (e.g., ADD)"
                    placeholderTextColor="black"
                    value={mnemonic}
                    onChangeText={setMnemonic}
                />

                {/* Operands */}
                <View style={styles.headerRow}>
                    <Text style={styles.label}>Operands</Text>
                    <Text style={styles.label}>Destination</Text>
                </View>


                {operands.map((op, index) => (
                    <View key={op.id} style={styles.operandRow}>
                        <View style={[styles.input, { flex: 0.5, justifyContent: "center" }]}>
                            <Text style={{ color: "#000" }}>
                                {op.value || `Operand ${index + 1}`}
                            </Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                            paddingHorizontal: 12
                        }}>

                            {/* Destination Radio */}
                            <TouchableOpacity
                                style={[
                                    styles.radio,
                                    op.isDestination && styles.radioSelected,
                                ]}
                                onPress={() => selectDestination(op.id)}
                            />

                            {/* Delete Operand */}
                            {operands.length > 1 && (
                                <TouchableOpacity onPress={() => deleteOperand(op.id)}>
                                    <Text style={styles.delete}>🗑</Text>
                                </TouchableOpacity>

                            )}

                            {/* Add Operand */}
                            {index === operands.length - 1 && (
                                <TouchableOpacity onPress={addOperand}>
                                    <Text style={styles.plus}>＋</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}

                {/* Address Type */}
                <Text style={styles.label}>Address Type</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={styles.radioItem}
                        onPress={() => setAddressType("direct")}
                    >
                        <View
                            style={[
                                styles.radio,
                                addressType === "direct" && styles.radioSelected,
                            ]}
                        />
                        <Text>Direct Address</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.radioItem}
                        onPress={() => setAddressType("indirect")}
                    >
                        <View
                            style={[
                                styles.radio,
                                addressType === "indirect" && styles.radioSelected,
                            ]}
                        />
                        <Text>Indirect Address</Text>
                    </TouchableOpacity>
                </View>

                {/* Action */}
                <Text style={styles.label}>Action</Text>
                <TextInput
                    style={[styles.input, { height: 90 }]}
                    multiline
                    placeholder="// Write Java Code Here"
                    placeholderTextColor="black"
                    value={action}
                    onChangeText={setAction}
                />

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAddInstruction}
                >
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.createBtn}
                    onPress={handleCreateArchitecture}
                >
                    <Text style={styles.buttonText}>CreateArchitecture</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default InstructionDesign;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#f5f7fb",
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#cfd6e4",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    // operandRow: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     gap: 10,
    // },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "#1f3c88",
    },
    radioSelected: {
        backgroundColor: "#1f3c88",
    },
    plus: {
        fontSize: 24,
        color: "#1f3c88",
        marginLeft: 6,
    },
    delete: {
        fontSize: 18,
        color: "#d11a2a",
        marginLeft: 4,
    },
    radioGroup: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 10,
    },
    radioItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    button: {
        backgroundColor: "#1f3c88",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
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
    destinationContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
    },

    operandRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingHorizontal: 2,
        paddingRight:115 // aligns with rows below
    },

});
