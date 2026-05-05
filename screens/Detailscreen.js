import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { getArchitectureDetails } from "../api/detailApi";

const DEFAULT_FLAG_REGISTERS = [
  {
    id: "default-zero",
    name: "Zero",
    size: "1 bit",
    action: "Set when result is zero",
    isFlagRegister: true,
  },
  {
    id: "default-carry",
    name: "Carry",
    size: "1 bit",
    action: "Set when carry or borrow occurs",
    isFlagRegister: true,
  },
  {
    id: "default-sign",
    name: "Sign",
    size: "1 bit",
    action: "Set when result is negative",
    isFlagRegister: true,
  },
  {
    id: "default-overflow",
    name: "Overflow",
    size: "1 bit",
    action: "Set when arithmetic overflow occurs",
    isFlagRegister: true,
  },
];

const NO_FLAG_INSTRUCTIONS = ["MOV", "MOVE", "SET", "LOAD", "STORE", "PUSH", "POP"];

const FIELD_KEYS = {
  architecture: ["architecture", "Architecture"],
  registers: ["registers", "Registers", "allRegisters", "AllRegisters"],
  generalRegisters: ["generalRegisters", "GeneralRegisters"],
  flagRegisters: ["flagRegisters", "FlagRegisters"],
  instructions: ["instructions", "Instructions"],
  actions: ["actions", "Actions"],
  addressingModes: ["addressingModes", "AddressingModes"],
};

const isUsefulValue = value => {
  if (value === undefined || value === null) return false;

  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned !== "" && cleaned !== "-" && cleaned.toLowerCase() !== "null";
  }

  if (Array.isArray(value)) return value.length > 0;

  return true;
};

const pickValue = (item, keys, fallback = "-") => {
  for (const key of keys) {
    if (isUsefulValue(item?.[key])) return item[key];
  }

  return fallback;
};

const formatValue = value => {
  if (!isUsefulValue(value)) return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getTextValue = (item, keys, fallback = "-") => {
  return formatValue(pickValue(item, keys, fallback));
};

const normalizeRegisterSize = register => {
  const directSize = pickValue(register, ["size", "Size"], "");
  if (isUsefulValue(directSize)) return formatValue(directSize);

  const registerSize = pickValue(register, ["registerSize", "RegisterSize"], "");
  return isUsefulValue(registerSize) ? `${registerSize}-bit` : "-";
};

const isFlagRegister = register => {
  const value = pickValue(
    register,
    ["isFlagRegister", "IsFlagRegister", "is_flag_register"],
    false
  );

  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
};

const mapGeneralRegister = register => ({
  id: pickValue(register, ["id", "Id", "registerID", "RegisterID"], undefined),
  name: getTextValue(register, ["name", "Name", "registerName", "RegisterName"]),
  size: normalizeRegisterSize(register),
  role: getTextValue(register, ["role", "Role", "description", "Description"], "General Purpose"),
  action: getTextValue(register, ["action", "Action"], "-"),
  isFlagRegister: false,
});

const mapFlagRegister = register => ({
  id: pickValue(register, ["id", "Id", "registerID", "RegisterID"], undefined),
  name: getTextValue(register, ["name", "Name", "flagName", "FlagName"], "-"),
  size: normalizeRegisterSize(register),
  action: getTextValue(register, ["action", "Action", "purpose", "Purpose", "role", "Role"], "-"),
  isFlagRegister: true,
});

const getMnemonic = instruction => {
  return getTextValue(instruction, [
    "mnemonic",
    "Mnemonic",
    "mnemonics",
    "Mnemonics",
    "instructionName",
    "InstructionName",
    "name",
    "Name",
  ]);
};

const getOpcode = instruction => {
  return getTextValue(instruction, [
    "opcode",
    "Opcode",
    "opCode",
    "OpCode",
    "operationCode",
    "OperationCode",
    "code",
    "Code",
  ]);
};

const getInstructionFormat = instruction => {
  return getTextValue(instruction, ["instructionFormat", "InstructionFormat", "format", "Format"]);
};

const getDbOperandCount = instruction => {
  const rawCount = getTextValue(
    instruction,
    [
      "numberOfOperands",
      "NumberOfOperands",
      "noOfOperands",
      "NoOfOperands",
      "operandCount",
      "OperandCount",
      "operandsCount",
      "OperandsCount",
    ],
    ""
  );

  const count = Number.parseInt(rawCount, 10);
  return Number.isNaN(count) ? 0 : count;
};

const getActionOperandCount = action => {
  if (!isUsefulValue(action) || action === "-") return 0;

  const matches = String(action).match(/\bA[1-9]\d*\b/g);
  if (!matches) return 0;

  return Math.max(...matches.map(value => Number.parseInt(value.replace("A", ""), 10)));
};

const getOperandTypeName = code => {
  const operandTypes = {
    0: "Register",
    1: "Immediate",
    2: "Memory",
    3: "Interrupt",
  };

  return operandTypes[code] ?? "-";
};

const getDestinationIndex = instruction => {
  const destination = getTextValue(
    instruction,
    ["destinationOperand", "DestinationOperand", "destination", "Destination", "dest", "Dest"],
    ""
  );

  if (!isUsefulValue(destination)) return null;
  if (/^\d+$/.test(destination)) return Number.parseInt(destination, 10);

  const argumentMatch = destination.match(/^A(\d+)$/i);
  if (argumentMatch) return Number.parseInt(argumentMatch[1], 10);

  const operandMatch = destination.match(/^Operand\s*(\d+)$/i);
  if (operandMatch) return Number.parseInt(operandMatch[1], 10);

  return null;
};

const Table = ({ children }) => <View style={styles.table}>{children}</View>;

const TableHeader = ({ columns }) => (
  <View style={styles.tableHeader}>
    {columns.map(column => (
      <Text key={column.label} style={[styles.headerCell, column.style]}>
        {column.label}
      </Text>
    ))}
  </View>
);

const TableRow = ({ children }) => <View style={styles.tableRow}>{children}</View>;

const Cell = ({ children, blue = false, style }) => (
  <Text style={[blue ? styles.cellBlue : styles.cell, style]}>{children}</Text>
);

const EmptyRow = ({ message }) => (
  <TableRow>
    <Text style={styles.emptyCell}>{message}</Text>
  </TableRow>
);

const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const MiniRow = ({ label, value }) => (
  <View style={styles.miniRow}>
    <Text style={styles.miniLabel}>{label}</Text>
    <Text style={styles.miniValue}>{value || "-"}</Text>
  </View>
);

const Detailscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const architectureId = route.params?.architectureId;

  const [architecture, setArchitecture] = useState({});
  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [flagRegisters, setFlagRegisters] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [actions, setActions] = useState([]);
  const [addressingModes, setAddressingModes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const visibleFlagRegisters = useMemo(() => {
    return flagRegisters.length > 0 ? flagRegisters : DEFAULT_FLAG_REGISTERS;
  }, [flagRegisters]);

  const fetchArchitectureDetails = useCallback(async () => {
    if (!architectureId) {
      setErrorMessage("Architecture ID is missing.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getArchitectureDetails(architectureId);
      const allRegisters = pickValue(data, FIELD_KEYS.registers, []);

      setArchitecture(pickValue(data, FIELD_KEYS.architecture, {}));

      if (Array.isArray(allRegisters) && allRegisters.length > 0) {
        setGeneralRegisters(allRegisters.filter(register => !isFlagRegister(register)).map(mapGeneralRegister));
        setFlagRegisters(allRegisters.filter(isFlagRegister).map(mapFlagRegister));
      } else {
        setGeneralRegisters(pickValue(data, FIELD_KEYS.generalRegisters, []));
        setFlagRegisters(pickValue(data, FIELD_KEYS.flagRegisters, []));
      }

      setInstructions(pickValue(data, FIELD_KEYS.instructions, []));
      setActions(pickValue(data, FIELD_KEYS.actions, []));
      setAddressingModes(pickValue(data, FIELD_KEYS.addressingModes, []));
    } catch (error) {
      setErrorMessage(error?.message || "Failed to load architecture details.");
    } finally {
      setIsLoading(false);
    }
  }, [architectureId]);

  useEffect(() => {
    fetchArchitectureDetails();
  }, [fetchArchitectureDetails]);

  const getInstructionAction = useCallback(
    instruction => {
      const instructionAction = getTextValue(
        instruction,
        ["action", "Action", "operation", "Operation"],
        ""
      );

      if (instructionAction) return instructionAction;

      const mnemonic = getMnemonic(instruction).toLowerCase();
      const matchingAction = actions.find(action => {
        const actionMnemonic = getTextValue(
          action,
          ["mnemonic", "Mnemonic", "mnemonics", "Mnemonics"],
          ""
        ).toLowerCase();

        return actionMnemonic === mnemonic;
      });

      return getTextValue(matchingAction, ["action", "Action", "operation", "Operation"]);
    },
    [actions]
  );

  const getOperandCount = useCallback(
    instruction => {
      const dbCount = getDbOperandCount(instruction);
      const actionCount = getActionOperandCount(getInstructionAction(instruction));
      const finalCount = Math.max(dbCount, actionCount);

      return finalCount > 0 ? String(finalCount) : "-";
    },
    [getInstructionAction]
  );

  const getFormattedInstructionFormat = useCallback(
    instruction => {
      const rawFormat = getInstructionFormat(instruction);
      if (!isUsefulValue(rawFormat)) return "-";

      const rawText = String(rawFormat);
      if (rawText === "3") return rawText;

      const dbCount = getDbOperandCount(instruction);
      const inferredCount = Number.parseInt(getOperandCount(instruction), 10);
      const operandCount = dbCount || inferredCount;

      return operandCount > 0 ? rawText.padStart(operandCount, "0") : rawText;
    },
    [getOperandCount]
  );

  const getOperandTypeByPosition = useCallback(
    (instruction, position) => {
      const count = Number.parseInt(getOperandCount(instruction), 10);
      const emptyValue = position === 3 ? "N/A" : "-";

      if (Number.isNaN(count) || position > count) return emptyValue;

      const format = getFormattedInstructionFormat(instruction);
      if (!format || format === "-" || format === "3") return emptyValue;

      return getOperandTypeName(format[position - 1]);
    },
    [getFormattedInstructionFormat, getOperandCount]
  );

  const getDestinationOperand = instruction => {
    const directValue = getTextValue(
      instruction,
      [
        "destinationOperand",
        "DestinationOperand",
        "destination",
        "Destination",
        "dest",
        "Dest",
        "destinationRegister",
        "DestinationRegister",
      ],
      ""
    );

    if (directValue) {
      if (/^\d+$/.test(directValue)) return `A${directValue}`;

      const operandMatch = directValue.match(/^Operand\s*(\d+)$/i);
      return operandMatch ? `A${operandMatch[1]}` : directValue;
    }

    const destinationIndex = getDestinationIndex(instruction);
    return destinationIndex ? `A${destinationIndex}` : "-";
  };

  const getSourceOperand = instruction => {
    const directValue = getTextValue(
      instruction,
      ["sourceOperand", "SourceOperand", "source", "Source", "src", "Src", "sourceRegister", "SourceRegister"],
      ""
    );

    if (directValue) return directValue.replace(/\bOperand\s*(\d+)\b/gi, "A$1");

    const count = Number.parseInt(getOperandCount(instruction), 10);
    const destinationIndex = getDestinationIndex(instruction);

    if (Number.isNaN(count) || count <= 1) return "-";

    const sourceOperands = Array.from({ length: count }, (_, index) => index + 1)
      .filter(position => position !== destinationIndex)
      .map(position => `A${position}`);

    return sourceOperands.length ? sourceOperands.join(", ") : "-";
  };

  const getInterruptSymbol = instruction => {
    return getTextValue(
      instruction,
      ["interruptSymbol", "InterruptSymbol", "interrupt_symbol", "Interrupt", "interrupt"],
      ""
    );
  };

  const getInputRegister = instruction => {
    return getTextValue(
      instruction,
      ["inputRegister", "InputRegister", "input_register", "InputReg", "inputReg"],
      ""
    );
  };

  const getOutputRegister = instruction => {
    return getTextValue(
      instruction,
      ["outputRegister", "OutputRegister", "output_register", "OutputReg", "outputReg"],
      ""
    );
  };

  const hasInterruptDetails = instruction => {
    return [getInterruptSymbol(instruction), getInputRegister(instruction), getOutputRegister(instruction)].some(isUsefulValue);
  };

  const getAffectedFlags = instruction => {
    const apiFlags = getTextValue(instruction, ["affectedFlags", "AffectedFlags", "flags", "Flags"], "");
    if (apiFlags) return apiFlags;

    const mnemonic = getMnemonic(instruction).toUpperCase();
    if (NO_FLAG_INSTRUCTIONS.includes(mnemonic)) return "NULL";

    const flags = visibleFlagRegisters
      .map(flag => getTextValue(flag, ["name", "Name", "flagName", "FlagName"], ""))
      .filter(flag => flag && flag !== "-");

    return flags.length ? flags.join(", ") : "Zero, Carry, Sign, Overflow";
  };

  const renderArchitectureRows = () => {
    const rows = [
      {
        label: "Architecture Name",
        value: getTextValue(architecture, ["name", "Name", "architectureName", "ArchitectureName"]),
      },
      {
        label: "Memory Size",
        value: getTextValue(architecture, ["memorySize", "MemorySize"]),
      },
      {
        label: "Bus Size",
        value: getTextValue(architecture, ["busSize", "BusSize"]),
      },
      {
        label: "Stack Size",
        value: getTextValue(architecture, ["stackSize", "StackSize"]),
      },
    ];

    return rows.map(row => (
      <TableRow key={row.label}>
        <Cell blue>{row.label}</Cell>
        <Cell>{row.value}</Cell>
      </TableRow>
    ));
  };

  const renderInstructionCard = (instruction, index) => (
    <View key={pickValue(instruction, ["id", "Id"], index)} style={styles.instructionMiniCard}>
      <View style={styles.instructionTopRow}>
        <Text style={styles.mnemonicTitle}>{getMnemonic(instruction)}</Text>

        <View style={styles.opcodeBadge}>
          <Text style={styles.opcodeText}>Opcode: {getOpcode(instruction)}</Text>
        </View>
      </View>

      <View style={styles.miniTable}>
        <MiniRow label="Mnemonic" value={getMnemonic(instruction)} />
        <MiniRow label="Instruction Format" value={getFormattedInstructionFormat(instruction)} />
        <MiniRow label="Micro Operation" value={getInstructionAction(instruction)} />
        <MiniRow label="No. of Operands" value={getOperandCount(instruction)} />
        <MiniRow label="Operand 1 Type" value={getOperandTypeByPosition(instruction, 1)} />
        <MiniRow label="Operand 2 Type" value={getOperandTypeByPosition(instruction, 2)} />
        <MiniRow label="Operand 3 Type" value={getOperandTypeByPosition(instruction, 3)} />
        <MiniRow label="Destination" value={getDestinationOperand(instruction)} />
        <MiniRow label="Source" value={getSourceOperand(instruction)} />
        <MiniRow label="Example" value={getTextValue(instruction, ["example", "Example", "syntax", "Syntax", "format", "Format"])} />
        <MiniRow label="Affected Flags" value={getAffectedFlags(instruction)} />

        {hasInterruptDetails(instruction) && (
          <>
            <MiniRow label="Interrupt" value={getInterruptSymbol(instruction)} />
            <MiniRow label="Input Register" value={getInputRegister(instruction)} />
            <MiniRow label="Output Register" value={getOutputRegister(instruction)} />
          </>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={fetchArchitectureDetails}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Architecture Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card title="Architecture Details">
          <Table>
            <TableHeader columns={[{ label: "Field" }, { label: "Value" }]} />
            {renderArchitectureRows()}
          </Table>
        </Card>

        <Card title="Register File">
          <Text style={styles.subSection}>● GENERAL PURPOSE REGISTERS</Text>

          <Table>
            <TableHeader columns={[{ label: "Name" }, { label: "Size" }, { label: "Role" }]} />

            {generalRegisters.length > 0 ? (
              generalRegisters.map((register, index) => (
                <TableRow key={pickValue(register, ["id", "Id"], index)}>
                  <Cell blue>{getTextValue(register, ["name", "Name", "registerName", "RegisterName"])}</Cell>
                  <Cell>{getTextValue(register, ["size", "Size", "registerSize", "RegisterSize"])}</Cell>
                  <Cell>{getTextValue(register, ["role", "Role", "description", "Description"], "General Purpose")}</Cell>
                </TableRow>
              ))
            ) : (
              <EmptyRow message="No GP registers found" />
            )}
          </Table>

          <Text style={[styles.subSection, styles.flagSectionTitle]}>● FLAG REGISTERS</Text>

          <Table>
            <TableHeader columns={[{ label: "Name" }, { label: "Size" }, { label: "Action" }]} />

            {visibleFlagRegisters.map((register, index) => (
              <TableRow key={pickValue(register, ["id", "Id"], index)}>
                <Cell blue>{getTextValue(register, ["name", "Name", "flagName", "FlagName"])}</Cell>
                <Cell>{getTextValue(register, ["size", "Size", "flagSize", "FlagSize"])}</Cell>
                <Cell>{getTextValue(register, ["action", "Action", "purpose", "Purpose", "role", "Role"])}</Cell>
              </TableRow>
            ))}
          </Table>
        </Card>

        <Card title="Instruction Set">
          {instructions.length > 0 ? (
            instructions.map(renderInstructionCard)
          ) : (
            <Text style={styles.emptyText}>No instructions found</Text>
          )}

          <Text style={styles.totalText}>Total Instructions: {instructions.length}</Text>
        </Card>

        <Card title="Micro Operations">
          <Table>
            <TableHeader
              columns={[
                { label: "Mnemonic", style: styles.actionMnemonicHeader },
                { label: "Micro Operation", style: styles.actionHeader },
              ]}
            />

            {actions.length > 0 ? (
              actions.map((action, index) => (
                <TableRow key={pickValue(action, ["id", "Id"], index)}>
                  <Cell blue style={styles.actionMnemonicCell}>
                    {getTextValue(action, ["mnemonic", "Mnemonic", "mnemonics", "Mnemonics"])}
                  </Cell>
                  <Cell style={styles.actionCell}>{getTextValue(action, ["action", "Action", "operation", "Operation"])}</Cell>
                </TableRow>
              ))
            ) : (
              <EmptyRow message="No micro operations found" />
            )}
          </Table>
        </Card>

        <Card title="Addressing Modes">
          <Table>
            <TableHeader columns={[{ label: "Name" }, { label: "Code" }, { label: "Symbol" }]} />

            {addressingModes.length > 0 ? (
              addressingModes.map((mode, index) => (
                <TableRow key={pickValue(mode, ["id", "Id"], index)}>
                  <Cell blue>{getTextValue(mode, ["name", "Name", "addressingModeName", "AddressingModeName"])}</Cell>
                  <Cell>{getTextValue(mode, ["code", "Code", "addressingModeCode", "AddressingModeCode"])}</Cell>
                  <Cell>{getTextValue(mode, ["symbol", "Symbol", "addressingModeSymbol", "AddressingModeSymbol"])}</Cell>
                </TableRow>
              ))
            ) : (
              <EmptyRow message="No addressing modes found" />
            )}
          </Table>
        </Card>
      </ScrollView>
    </View>
  );
};

export default Detailscreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    height: 56,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "900",
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  subSection: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  flagSectionTitle: {
    marginTop: 15,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerCell: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
    color: "#111827",
  },
  cell: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    fontSize: 11,
    textAlign: "center",
    color: "#334155",
  },
  cellBlue: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    fontSize: 11,
    textAlign: "center",
    color: "#1E3A8A",
    fontWeight: "700",
  },
  emptyCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    fontSize: 11,
    textAlign: "center",
    color: "#64748B",
  },
  instructionMiniCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  instructionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mnemonicTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E3A8A",
  },
  opcodeBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  opcodeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  miniTable: {
    backgroundColor: "white",
  },
  miniRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  miniLabel: {
    width: "38%",
    paddingVertical: 9,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "bold",
    color: "#1E3A8A",
    backgroundColor: "#F8FAFC",
  },
  miniValue: {
    width: "62%",
    paddingVertical: 9,
    paddingHorizontal: 8,
    fontSize: 11,
    color: "#334155",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    paddingVertical: 12,
  },
  actionMnemonicHeader: {
    flex: 1,
  },
  actionHeader: {
    flex: 1.4,
  },
  actionMnemonicCell: {
    flex: 1,
  },
  actionCell: {
    flex: 1.4,
    fontSize: 10,
  },
  totalText: {
    textAlign: "right",
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#1E3A8A",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});