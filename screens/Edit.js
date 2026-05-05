import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";

// ✅ Apni API file ke according path/name adjust kar lena
import {
  getArchitectureDetails,
  updateArchitecture,
} from "../api/detailApi";

const EditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const architectureId =
    route?.params?.architectureId ||
    route?.params?.ArchitectureID ||
    route?.params?.id;

  /* ================= CPU STATES ================= */
  const [architectureName, setArchitectureName] = useState("");
  const [memorySize, setMemorySize] = useState("");
  const [busSize, setBusSize] = useState("");
  const [stackSize, setStackSize] = useState("");
  const [registerCount, setRegisterCount] = useState("");
  const [instructionCount, setInstructionCount] = useState("");

  /* ================= REGISTER STATES ================= */
  const [flagName, setFlagName] = useState("");
  const [flagAction, setFlagAction] = useState("");
  const [generalRegister, setGeneralRegister] = useState("");

  /* ================= ADDRESSING MODE STATES ================= */
  const [addressingMode, setAddressingMode] = useState(null);
  const [addressingCode, setAddressingCode] = useState(null);
  const [addressingSymbol, setAddressingSymbol] = useState("");

  /* ================= INSTRUCTION STATES ================= */
  const [isInterrupt, setIsInterrupt] = useState(false);
  const [operationCode, setOperationCode] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [microOperation, setMicroOperation] = useState("");

  const [interruptSymbol, setInterruptSymbol] = useState(null);
  const [inputRegister, setInputRegister] = useState(null);
  const [outputRegister, setOutputRegister] = useState(null);

  const [operands, setOperands] = useState([
    { id: 1, type: "Register", isDestination: true },
  ]);

  /* ================= DB LIST STATES ================= */
  const [flagRegisters, setFlagRegisters] = useState([]);
  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [addressingModes, setAddressingModes] = useState([]);
  const [instructions, setInstructions] = useState([]);

  /* ================= EDITED LIST STATES ================= */
  const [updatedFlagRegisters, setUpdatedFlagRegisters] = useState([]);
  const [updatedGeneralRegisters, setUpdatedGeneralRegisters] = useState([]);
  const [updatedAddressingModes, setUpdatedAddressingModes] = useState([]);
  const [updatedInstructions, setUpdatedInstructions] = useState([]);

  /* ================= INDEX STATES ================= */
  const [flagIndex, setFlagIndex] = useState(0);
  const [generalIndex, setGeneralIndex] = useState(0);
  const [addressingIndex, setAddressingIndex] = useState(0);
  const [instructionIndex, setInstructionIndex] = useState(0);

  /* ================= FINISHED STATES ================= */
  const [flagFinished, setFlagFinished] = useState(false);
  const [generalFinished, setGeneralFinished] = useState(false);
  const [addressingFinished, setAddressingFinished] = useState(false);
  const [instructionFinished, setInstructionFinished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  /* ================= DROPDOWN DATA ================= */

  const addressingModeData = [
    { label: "Immediate", value: "Immediate" },
    { label: "Direct", value: "Direct" },
    { label: "Indirect", value: "Indirect" },
  ];

  const addressingCodeData = [
    { label: "00", value: "00" },
    { label: "01", value: "01" },
    { label: "10", value: "10" },
  ];

  const OPERAND_TYPES = [
    { label: "Register", value: "Register" },
    { label: "Immediate", value: "Immediate" },
    { label: "Memory", value: "Memory" },
  ];

  const INTERRUPT_SYMBOLS = [
    { label: "1(Input)", value: "1(Input)" },
    { label: "2(Output)", value: "2(Output)" },
  ];

  const registers =
    generalRegisters.length > 0
      ? generalRegisters.map((item, index) => {
          const regName = getValue(item, [
            "Name",
            "RegisterName",
            "GeneralRegisterName",
            "registerName",
            "name",
          ]);

          return {
            label: String(regName || `R${index + 1}`),
            value: String(regName || `R${index + 1}`),
          };
        })
      : [
          { label: "R1", value: "R1" },
          { label: "R2", value: "R2" },
        ];

  /* ================= HELPER FUNCTIONS ================= */

  function getValue(obj, keys, defaultValue = "") {
    if (!obj) return defaultValue;

    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }

    return defaultValue;
  }

  function safeString(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function toBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    const text = safeString(value).toLowerCase();
    return text === "true" || text === "1" || text === "yes";
  }

  function extractArray(data, keys) {
    for (const key of keys) {
      if (Array.isArray(data?.[key])) return data[key];
      if (Array.isArray(data?.Data?.[key])) return data.Data[key];
      if (Array.isArray(data?.data?.[key])) return data.data[key];
    }

    return [];
  }

  function isFlagRegister(item) {
    const type = safeString(
      getValue(item, ["Type", "RegisterType", "type", "registerType"])
    ).toLowerCase();

    const name = safeString(
      getValue(item, ["Name", "RegisterName", "name", "registerName"])
    ).toLowerCase();

    return type.includes("flag") || name.includes("flag");
  }

  function normalizeInterruptSymbol(value) {
    const text = safeString(value);

    if (text === "1" || text.toLowerCase().includes("input")) {
      return "1(Input)";
    }

    if (text === "2" || text.toLowerCase().includes("output")) {
      return "2(Output)";
    }

    return text || null;
  }

  function showAllDataFetchedAlert(fieldName) {
    Alert.alert(
      "All Data Fetched",
      `All ${fieldName} data has been fetched from database for this architecture.`
    );
  }

  function showNoDataAlert(fieldName) {
    Alert.alert(
      "No Data",
      `No ${fieldName} data found in database for this architecture.`
    );
  }

  /* ================= LOAD ARCHITECTURE DATA ================= */

  useEffect(() => {
    fetchArchitectureData();
  }, [architectureId]);

  const fetchArchitectureData = async () => {
    if (!architectureId) {
      Alert.alert("Error", "Architecture ID not found.");
      return;
    }

    try {
      setLoading(true);

      setFlagFinished(false);
      setGeneralFinished(false);
      setAddressingFinished(false);
      setInstructionFinished(false);

      const data = await getArchitectureDetails(architectureId);

      const architecture = data?.Architecture || data?.architecture || data;

      setArchitectureName(
        safeString(
          getValue(architecture, ["Name", "ArchitectureName", "architectureName"])
        )
      );

      setMemorySize(
        safeString(getValue(architecture, ["MemorySize", "memorySize"]))
      );

      setBusSize(safeString(getValue(architecture, ["BusSize", "busSize"])));

      setStackSize(
        safeString(getValue(architecture, ["StackSize", "stackSize"]))
      );

      const allRegisters = extractArray(data, ["Registers", "registers"]);

      let flags = extractArray(data, [
        "FlagRegisters",
        "flagRegisters",
        "Flags",
        "flags",
      ]);

      let generals = extractArray(data, [
        "GeneralRegisters",
        "generalRegisters",
        "GeneralPurposeRegisters",
        "generalPurposeRegisters",
        "GpRegisters",
        "gpRegisters",
      ]);

      if (flags.length === 0 && allRegisters.length > 0) {
        flags = allRegisters.filter((item) => isFlagRegister(item));
      }

      if (generals.length === 0 && allRegisters.length > 0) {
        generals = allRegisters.filter((item) => !isFlagRegister(item));
      }

      const modes = extractArray(data, [
        "AddressingModes",
        "addressingModes",
      ]);

      const instructionList = extractArray(data, [
        "Instructions",
        "instructions",
        "InstructionSet",
        "instructionSet",
      ]);

      setFlagRegisters(flags);
      setGeneralRegisters(generals);
      setAddressingModes(modes);
      setInstructions(instructionList);

      setUpdatedFlagRegisters(flags);
      setUpdatedGeneralRegisters(generals);
      setUpdatedAddressingModes(modes);
      setUpdatedInstructions(instructionList);

      setRegisterCount(String(flags.length + generals.length));
      setInstructionCount(String(instructionList.length));

      setFlagIndex(0);
      setGeneralIndex(0);
      setAddressingIndex(0);
      setInstructionIndex(0);

      if (flags.length > 0) {
        fillFlagRegister(flags[0]);
      }

      if (generals.length > 0) {
        fillGeneralRegister(generals[0]);
      }

      if (modes.length > 0) {
        fillAddressingMode(modes[0]);
      }

      if (instructionList.length > 0) {
        fillInstruction(instructionList[0]);
      }
    } catch (error) {
      console.log("Fetch Architecture Error:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to fetch architecture data from database."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILL FIELD FUNCTIONS ================= */

  const fillFlagRegister = (item) => {
    setFlagName(
      safeString(
        getValue(item, [
          "Name",
          "RegisterName",
          "FlagName",
          "FlagRegisterName",
          "name",
          "registerName",
        ])
      )
    );

    setFlagAction(
      safeString(
        getValue(item, [
          "Action",
          "FlagAction",
          "FlagRegisterAction",
          "action",
        ])
      )
    );
  };

  const fillGeneralRegister = (item) => {
    setGeneralRegister(
      safeString(
        getValue(item, [
          "Name",
          "RegisterName",
          "GeneralRegisterName",
          "name",
          "registerName",
        ])
      )
    );
  };

  const fillAddressingMode = (item) => {
    setAddressingMode(
      safeString(
        getValue(item, [
          "AddressingMode",
          "Mode",
          "Name",
          "addressingMode",
          "mode",
        ])
      ) || null
    );

    setAddressingCode(
      safeString(
        getValue(item, [
          "AddressingModeCode",
          "Code",
          "addressingModeCode",
          "code",
        ])
      ) || null
    );

    setAddressingSymbol(
      safeString(
        getValue(item, [
          "AddressingModeSymbol",
          "Symbol",
          "addressingModeSymbol",
          "symbol",
        ])
      )
    );
  };

  const fillInstruction = (item) => {
    const interrupt = toBoolean(
      getValue(item, [
        "IsInterrupt",
        "isInterrupt",
        "Interrupt",
        "interrupt",
      ])
    );

    setIsInterrupt(interrupt);

    setOperationCode(
      safeString(
        getValue(item, [
          "OperationCode",
          "Opcode",
          "OpCode",
          "operationCode",
          "opcode",
        ])
      )
    );

    setMnemonic(
      safeString(getValue(item, ["Mnemonic", "mnemonic", "Name", "name"]))
    );

    setMicroOperation(
      safeString(
        getValue(item, [
          "MicroOperation",
          "microOperation",
          "Action",
          "action",
        ])
      )
    );

    setInterruptSymbol(
      normalizeInterruptSymbol(
        getValue(item, ["InterruptSymbol", "interruptSymbol"])
      )
    );

    setInputRegister(
      safeString(
        getValue(item, [
          "InputRegister",
          "inputRegister",
          "InputRegisterName",
          "inputRegisterName",
        ])
      ) || null
    );

    setOutputRegister(
      safeString(
        getValue(item, [
          "OutputRegister",
          "outputRegister",
          "OutputRegisterName",
          "outputRegisterName",
        ])
      ) || null
    );

    const itemOperands =
      item?.Operands ||
      item?.operands ||
      item?.InstructionOperands ||
      item?.instructionOperands ||
      [];

    if (!interrupt && Array.isArray(itemOperands) && itemOperands.length > 0) {
      const normalized = itemOperands.map((op, index) => ({
        id: index + 1,
        type:
          safeString(
            getValue(op, ["Type", "OperandType", "type", "operandType"])
          ) || "Register",
        isDestination: toBoolean(
          getValue(op, [
            "IsDestination",
            "isDestination",
            "Destination",
            "destination",
          ])
        ),
      }));

      if (!normalized.some((op) => op.isDestination)) {
        normalized[0].isDestination = true;
      }

      setOperands(normalized);
    } else {
      setOperands([{ id: 1, type: "Register", isDestination: true }]);
    }
  };

  /* ================= CREATE CURRENT OBJECTS ================= */

  const getCurrentFlagObject = () => {
    const oldItem = flagRegisters[flagIndex] || {};

    return {
      ...oldItem,
      Name: flagName,
      RegisterName: flagName,
      FlagRegisterName: flagName,
      Action: flagAction,
      FlagAction: flagAction,
      FlagRegisterAction: flagAction,
      Type: "Flag",
      RegisterType: "Flag",
    };
  };

  const getCurrentGeneralObject = () => {
    const oldItem = generalRegisters[generalIndex] || {};

    return {
      ...oldItem,
      Name: generalRegister,
      RegisterName: generalRegister,
      GeneralRegisterName: generalRegister,
      Type: "General",
      RegisterType: "General",
    };
  };

  const getCurrentAddressingObject = () => {
    const oldItem = addressingModes[addressingIndex] || {};

    return {
      ...oldItem,
      AddressingMode: addressingMode,
      Mode: addressingMode,
      AddressingModeCode: addressingCode,
      Code: addressingCode,
      AddressingModeSymbol: addressingSymbol,
      Symbol: addressingSymbol,
    };
  };

  const getCurrentInstructionObject = () => {
    const oldItem = instructions[instructionIndex] || {};

    return {
      ...oldItem,
      IsInterrupt: isInterrupt,
      OperationCode: operationCode,
      Opcode: operationCode,
      Mnemonic: mnemonic,
      MicroOperation: microOperation,
      Action: microOperation,
      InterruptSymbol: interruptSymbol,
      InputRegister: inputRegister,
      OutputRegister: outputRegister,
      Operands: isInterrupt ? [] : operands,
    };
  };

  /* ================= STORE CURRENT CHANGES IN LIST ================= */

  const updateItemInList = (list, index, newItem) => {
    const copy = [...list];

    if (index >= 0 && index < copy.length) {
      copy[index] = newItem;
    } else {
      copy.push(newItem);
    }

    return copy;
  };

  const handleAddFlagRegister = () => {
    const updated = updateItemInList(
      updatedFlagRegisters,
      flagIndex,
      getCurrentFlagObject()
    );

    setUpdatedFlagRegisters(updated);
    setFlagRegisters(updated);

    Alert.alert("Saved", "Flag register changes stored in list.");
  };

  const handleAddGeneralRegister = () => {
    const updated = updateItemInList(
      updatedGeneralRegisters,
      generalIndex,
      getCurrentGeneralObject()
    );

    setUpdatedGeneralRegisters(updated);
    setGeneralRegisters(updated);

    Alert.alert("Saved", "General purpose register changes stored in list.");
  };

  const handleAddAddressingMode = () => {
    const updated = updateItemInList(
      updatedAddressingModes,
      addressingIndex,
      getCurrentAddressingObject()
    );

    setUpdatedAddressingModes(updated);
    setAddressingModes(updated);

    Alert.alert("Saved", "Addressing mode changes stored in list.");
  };

  const handleAddInstruction = () => {
    const updated = updateItemInList(
      updatedInstructions,
      instructionIndex,
      getCurrentInstructionObject()
    );

    setUpdatedInstructions(updated);
    setInstructions(updated);

    Alert.alert("Saved", "Instruction changes stored in list.");
  };

  /* ================= NEXT BUTTON HANDLERS ================= */

  const handleNextFlagRegister = () => {
    if (flagRegisters.length === 0) {
      showNoDataAlert("flag register");
      return;
    }

    if (flagFinished) return;

    const nextIndex = flagIndex + 1;

    if (nextIndex >= flagRegisters.length) {
      setFlagFinished(true);
      showAllDataFetchedAlert("flag register");
      return;
    }

    setFlagIndex(nextIndex);
    fillFlagRegister(flagRegisters[nextIndex]);

    if (nextIndex === flagRegisters.length - 1) {
      setFlagFinished(true);
      showAllDataFetchedAlert("flag register");
    }
  };

  const handleNextGeneralRegister = () => {
    if (generalRegisters.length === 0) {
      showNoDataAlert("general purpose register");
      return;
    }

    if (generalFinished) return;

    const nextIndex = generalIndex + 1;

    if (nextIndex >= generalRegisters.length) {
      setGeneralFinished(true);
      showAllDataFetchedAlert("general purpose register");
      return;
    }

    setGeneralIndex(nextIndex);
    fillGeneralRegister(generalRegisters[nextIndex]);

    if (nextIndex === generalRegisters.length - 1) {
      setGeneralFinished(true);
      showAllDataFetchedAlert("general purpose register");
    }
  };

  const handleNextAddressingMode = () => {
    if (addressingModes.length === 0) {
      showNoDataAlert("addressing mode");
      return;
    }

    if (addressingFinished) return;

    const nextIndex = addressingIndex + 1;

    if (nextIndex >= addressingModes.length) {
      setAddressingFinished(true);
      showAllDataFetchedAlert("addressing mode");
      return;
    }

    setAddressingIndex(nextIndex);
    fillAddressingMode(addressingModes[nextIndex]);

    if (nextIndex === addressingModes.length - 1) {
      setAddressingFinished(true);
      showAllDataFetchedAlert("addressing mode");
    }
  };

  const handleNextInstruction = () => {
    if (instructions.length === 0) {
      showNoDataAlert("instruction");
      return;
    }

    if (instructionFinished) return;

    const nextIndex = instructionIndex + 1;

    if (nextIndex >= instructions.length) {
      setInstructionFinished(true);
      showAllDataFetchedAlert("instruction");
      return;
    }

    setInstructionIndex(nextIndex);
    fillInstruction(instructions[nextIndex]);

    if (nextIndex === instructions.length - 1) {
      setInstructionFinished(true);
      showAllDataFetchedAlert("instruction");
    }
  };

  /* ================= OPERAND FUNCTIONS ================= */

  const addOperand = () => {
    setOperands((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "Register",
        isDestination: false,
      },
    ]);
  };

  const updateOperandType = (id, type) => {
    setOperands((prev) =>
      prev.map((op) => (op.id === id ? { ...op, type } : op))
    );
  };

  const selectDestination = (id) => {
    setOperands((prev) =>
      prev.map((op) => ({
        ...op,
        isDestination: op.id === id,
      }))
    );
  };

  const deleteOperand = (id) => {
    if (operands.length === 1) return;

    const updated = operands.filter((op) => op.id !== id);

    if (!updated.some((op) => op.isDestination)) {
      updated[0].isDestination = true;
    }

    setOperands(updated);
  };

  /* ================= UPDATE ARCHITECTURE ================= */

  const handleUpdateArchitecture = async () => {
    if (!architectureName) {
      Alert.alert("Validation", "Architecture Name is required.");
      return;
    }

    try {
      setUpdateLoading(true);

      const payload = {
        ArchitectureID: architectureId,
        ArchitectureId: architectureId,
        Name: architectureName,
        ArchitectureName: architectureName,
        MemorySize: memorySize,
        BusSize: busSize,
        StackSize: stackSize,
        RegisterCount: registerCount,
        InstructionCount: instructionCount,

        Architecture: {
          ArchitectureID: architectureId,
          ArchitectureId: architectureId,
          Name: architectureName,
          ArchitectureName: architectureName,
          MemorySize: memorySize,
          BusSize: busSize,
          StackSize: stackSize,
          RegisterCount: registerCount,
          InstructionCount: instructionCount,
        },

        FlagRegisters: updatedFlagRegisters,
        GeneralRegisters: updatedGeneralRegisters,
        Registers: [...updatedGeneralRegisters, ...updatedFlagRegisters],
        AddressingModes: updatedAddressingModes,
        Instructions: updatedInstructions,
      };

      console.log("UPDATE ARCHITECTURE PAYLOAD:", JSON.stringify(payload, null, 2));

      await updateArchitecture(architectureId, payload);

      Alert.alert("Success", "Architecture updated successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("Update Architecture Error:", error);

      Alert.alert(
        "Error",
        error?.message || "Failed to update architecture."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Architecture</Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {/* ================= CPU DESIGN ================= */}
        <Card title="CPU DESIGN">
          <Text style={styles.label}>Architecture Name</Text>
          <TextInput
            style={styles.input}
            value={architectureName}
            onChangeText={setArchitectureName}
            placeholder="Enter Architecture Name"
            placeholderTextColor="black"
          />

          <Text style={styles.label}>Memory Size</Text>
          <TextInput
            style={styles.input}
            value={memorySize}
            onChangeText={setMemorySize}
            placeholder="Enter Memory Size"
            placeholderTextColor="black"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Bus Size</Text>
          <TextInput
            style={styles.input}
            value={busSize}
            onChangeText={setBusSize}
            placeholder="Enter Bus Size"
            placeholderTextColor="black"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Stack Size</Text>
          <TextInput
            style={styles.input}
            value={stackSize}
            onChangeText={setStackSize}
            placeholder="Enter Stack Size"
            placeholderTextColor="black"
            keyboardType="numeric"
          />

          <Text style={styles.label}>No of Registers</Text>
          <TextInput
            style={styles.input}
            value={registerCount}
            onChangeText={setRegisterCount}
            placeholder="Enter No of Registers"
            placeholderTextColor="black"
            keyboardType="numeric"
          />

          <Text style={styles.label}>No of Instructions</Text>
          <TextInput
            style={styles.input}
            value={instructionCount}
            onChangeText={setInstructionCount}
            placeholder="Enter No of Instructions"
            placeholderTextColor="black"
            keyboardType="numeric"
          />
        </Card>

        {/* ================= REGISTER DESIGN ================= */}
        <Card title="Register Design">
          <Text style={styles.label}>Flag Register Name</Text>
          <TextInput
            style={styles.input}
            value={flagName}
            onChangeText={setFlagName}
            placeholder="Enter Flag Register Name"
            placeholderTextColor="black"
          />

          <Text style={styles.label}>Flag Register Action</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={flagAction}
            onChangeText={setFlagAction}
            placeholder="Enter Flag Register Action"
            placeholderTextColor="black"
          />

          <RowButtons
            onNext={handleNextFlagRegister}
            onAdd={handleAddFlagRegister}
            nextDisabled={flagFinished}
          />

          <Text style={styles.label}>General Purpose Register Name</Text>
          <TextInput
            style={styles.input}
            value={generalRegister}
            onChangeText={setGeneralRegister}
            placeholder="Enter General Purpose Register Name"
            placeholderTextColor="black"
          />

          <RowButtons
            onNext={handleNextGeneralRegister}
            onAdd={handleAddGeneralRegister}
            nextDisabled={generalFinished}
          />
        </Card>

        {/* ================= ADDRESSING MODES ================= */}
        <Card title="Add Addressing Modes">
          <DropdownField
            label="Addressing Mode"
            data={addressingModeData}
            value={addressingMode}
            onChange={setAddressingMode}
          />

          <DropdownField
            label="Addressing Mode Code"
            data={addressingCodeData}
            value={addressingCode}
            onChange={setAddressingCode}
          />

          <Text style={styles.label}>Addressing Mode Symbol</Text>
          <TextInput
            style={styles.input}
            value={addressingSymbol}
            onChangeText={setAddressingSymbol}
            placeholder="Enter Addressing Mode Symbol"
            placeholderTextColor="black"
          />

          <RowButtons
            onNext={handleNextAddressingMode}
            onAdd={handleAddAddressingMode}
            nextDisabled={addressingFinished}
          />
        </Card>

        {/* ================= INSTRUCTION DESIGN ================= */}
        <Card title="Instruction Design">
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsInterrupt(!isInterrupt)}
            >
              {isInterrupt && <View style={styles.checkboxInner} />}
            </TouchableOpacity>

            <Text style={{ marginLeft: 10 }}>Interrupt Instruction</Text>
          </View>

          <Text style={styles.label}>Operation Code</Text>
          <TextInput
            style={styles.input}
            value={operationCode}
            onChangeText={setOperationCode}
            placeholder="Enter Operation Code"
            placeholderTextColor="black"
          />

          <Text style={styles.label}>Mnemonic</Text>
          <TextInput
            style={styles.input}
            value={mnemonic}
            onChangeText={setMnemonic}
            placeholder="Enter Mnemonic"
            placeholderTextColor="black"
          />

          {!isInterrupt && (
            <>
              <Text style={styles.label}>Operands</Text>

              {operands.map((op, index) => (
                <View key={op.id} style={styles.operandRow}>
                  <Text style={{ width: 80 }}>Operand {index + 1}</Text>

                  <Dropdown
                    style={styles.dropdownSmall}
                    data={OPERAND_TYPES}
                    labelField="label"
                    valueField="value"
                    value={op.type}
                    onChange={(item) => updateOperandType(op.id, item.value)}
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
                      <Text style={{ fontSize: 18, marginLeft: 5 }}>🗑</Text>
                    </TouchableOpacity>
                  )}

                  {index === operands.length - 1 && (
                    <TouchableOpacity onPress={addOperand}>
                      <Text style={{ fontSize: 22, marginLeft: 5 }}>＋</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          )}

          {isInterrupt && (
            <>
              <DropdownField
                label="Interrupt"
                data={INTERRUPT_SYMBOLS}
                value={interruptSymbol}
                onChange={setInterruptSymbol}
              />

              <DropdownField
                label="Input Register"
                data={registers}
                value={inputRegister}
                onChange={setInputRegister}
              />

              <DropdownField
                label="Output Register"
                data={registers}
                value={outputRegister}
                onChange={setOutputRegister}
              />
            </>
          )}

          <Text style={styles.label}>Micro-Operation</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={microOperation}
            onChangeText={setMicroOperation}
            placeholder="Enter Micro-Operation"
            placeholderTextColor="black"
          />

          <RowButtons
            onNext={handleNextInstruction}
            onAdd={handleAddInstruction}
            nextDisabled={instructionFinished}
          />

          <FullButton
            text={updateLoading ? "Updating..." : "Update Architecture"}
            onPress={handleUpdateArchitecture}
            disabled={updateLoading}
          />
        </Card>
      </ScrollView>
    </View>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const DropdownField = ({ label, data, value, onChange }) => (
  <>
    <Text style={styles.label}>{label}</Text>

    <Dropdown
      style={styles.dropdown}
      data={data}
      labelField="label"
      valueField="value"
      value={value}
      placeholder={`Select ${label}`}
      onChange={(item) => onChange(item.value)}
    />
  </>
);

const FullButton = ({ text, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.fullButton, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const RowButtons = ({ onNext, onAdd, nextDisabled }) => (
  <View style={styles.row}>
    <TouchableOpacity
      style={[styles.halfButton, nextDisabled && styles.disabledButton]}
      onPress={onNext}
      disabled={nextDisabled}
    >
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.halfButton} onPress={onAdd}>
      <Text style={styles.buttonText}>Add</Text>
    </TouchableOpacity>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6fb",
  },

  header: {
    height: 55,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1E3A8A",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    color: "#111827",
  },

  textArea: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    height: 100,
    marginBottom: 10,
    textAlignVertical: "top",
    color: "#111827",
  },

  dropdown: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  dropdownSmall: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 8,
    width: 120,
    marginHorizontal: 5,
  },

  operandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  radio: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 9,
    borderColor: "#2e4a9e",
  },

  radioSelected: {
    backgroundColor: "#2e4a9e",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  halfButton: {
    backgroundColor: "#2e4a9e",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },

  fullButton: {
    backgroundColor: "#2e4a9e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    backgroundColor: "#9CA3AF",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#2e4a9e",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#2e4a9e",
  },
});

export default EditScreen;