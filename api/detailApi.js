// const BASE_URL = "http://192.168.1.7/ComputerArchitectureToolkitAPI/api";
const BASE_URL = "http://192.168.18.108/ComputerArchitectureToolkitAPI/api";

// ================= DEFAULT FLAG REGISTERS =================
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

// ================= FETCH ALL ARCHITECTURES =================
export const getAllArchitectures = async () => {
  try {
    const response = await fetch(`${BASE_URL}/architecture/all`);

    if (!response.ok) {
      throw new Error("Failed to fetch architectures");
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.log("All Architectures API Error:", error);
    throw error;
  }
};

// ================= HELPER: CLEAN DB VALUE =================
const cleanDbValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "NULL" ||
    value === "null"
  ) {
    return "-";
  }

  return value;
};

// ================= HELPER: CHECK FLAG REGISTER =================
const getIsFlagRegister = (register) => {
  const value =
    register?.IsFlagRegister ??
    register?.isFlagRegister ??
    register?.is_flag_register ??
    false;

  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "True"
  );
};

// ================= HELPER: INFER OPERANDS FROM ACTION =================
const getMaxOperandFromAction = (action) => {
  if (!action || action === "-") {
    return 0;
  }

  const matches = action.match(/\bA[1-9]\d*\b/g);

  if (!matches) {
    return 0;
  }

  const numbers = matches.map((item) =>
    parseInt(item.replace("A", ""), 10)
  );

  return Math.max(...numbers);
};

const getSourceOperands = (count, destinationOperand) => {
  const destinationIndex = parseInt(destinationOperand, 10);

  if (!count || count <= 1) {
    return "-";
  }

  const sources = [];

  for (let i = 1; i <= count; i++) {
    if (i !== destinationIndex) {
      sources.push(`A${i}`);
    }
  }

  return sources.length > 0 ? sources.join(", ") : "-";
};

const getOperandTypeByMnemonic = (mnemonic) => {
  const name = mnemonic?.toString().toUpperCase();

  if (name === "STORE") {
    return "Memory, Register";
  }

  if (name === "LOAD") {
    return "Register, Memory";
  }

  if (name === "PUSH" || name === "POP") {
    return "Register / Stack";
  }

  if (name === "MOV" || name === "MOVE" || name === "SET") {
    return "Register / Immediate";
  }

  return "Register / Immediate";
};

const getAffectedFlagsByMnemonic = (mnemonic) => {
  const name = mnemonic?.toString().toUpperCase();

  const noFlagInstructions = [
    "MOV",
    "MOVE",
    "SET",
    "LOAD",
    "STORE",
    "PUSH",
    "POP",
  ];

  if (noFlagInstructions.includes(name)) {
    return "NULL";
  }

  return "Zero, Carry, Sign, Overflow";
};

// ================= FETCH SINGLE ARCHITECTURE DETAILS =================
export const getArchitectureDetails = async (architectureId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/architecture/${architectureId}/details`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch architecture details");
    }

    const data = await response.json();

    console.log(
      "RAW ARCHITECTURE DETAILS API DATA:",
      JSON.stringify(data, null, 2)
    );

    // ===== Architecture Info =====
    const architecture = {
      name: cleanDbValue(data?.Architecture?.Name),

      memorySize: data?.Architecture?.MemorySize
        ? `${data.Architecture.MemorySize} Bytes`
        : "-",

      busSize: data?.Architecture?.BusSize
        ? `${data.Architecture.BusSize}-bit`
        : "-",

      stackSize: data?.Architecture?.StackSize
        ? `${data.Architecture.StackSize} Bytes`
        : "-",
    };

    // ===== Registers =====
    const registers = data?.Registers || [];

    const generalRegisters = registers
      .filter((r) => !getIsFlagRegister(r))
      .map((r) => ({
        id: r.RegisterID,
        name: cleanDbValue(r.Name),
        size: r.RegisterSize ? `${r.RegisterSize}-bit` : "-",
        role: "General Purpose",
        action: cleanDbValue(r.Action),
        isFlagRegister: false,
      }));

    const customFlagRegisters = registers
      .filter((r) => getIsFlagRegister(r))
      .map((r) => ({
        id: r.RegisterID,
        name: cleanDbValue(r.Name),
        size: r.RegisterSize ? `${r.RegisterSize}-bit` : "-",
        action: cleanDbValue(r.Action),
        isFlagRegister: true,
      }));

    const flagRegisters =
      customFlagRegisters.length > 0
        ? customFlagRegisters
        : DEFAULT_FLAG_REGISTERS;

    // ===== Instructions =====
    const instructions = (data?.Instructions || []).map((i) => {
      const action = cleanDbValue(i.Action);
      const mnemonic = cleanDbValue(i.Mnemonics);

      const dbOperandCount = parseInt(i.NumberOfOperands, 10) || 0;
      const actionOperandCount = getMaxOperandFromAction(action);

      const finalOperandCount = Math.max(dbOperandCount, actionOperandCount);

      const rawDestinationOperand =
        i.DestinationOperand !== null &&
        i.DestinationOperand !== undefined
          ? i.DestinationOperand
          : "-";

      const destinationOperand =
        rawDestinationOperand !== "-"
          ? `A${rawDestinationOperand}`
          : "-";

      return {
        id: i.InstructionID,
        InstructionID: i.InstructionID,

        mnemonic,
        Mnemonics: mnemonic,

        opcode: cleanDbValue(i.Opcode),
        Opcode: cleanDbValue(i.Opcode),

        set: action,
        instruction: action,

        action,
        Action: action,

        numberOfOperands: finalOperandCount || "-",
        NumberOfOperands: finalOperandCount || "-",

        operand1: finalOperandCount >= 1 ? "A1" : "-",
        Operand1: finalOperandCount >= 1 ? "A1" : "-",

        operand2: finalOperandCount >= 2 ? "A2" : "-",
        Operand2: finalOperandCount >= 2 ? "A2" : "-",

        operand3: finalOperandCount >= 3 ? "A3" : "N/A",
        Operand3: finalOperandCount >= 3 ? "A3" : "N/A",

        destinationOperand,
        DestinationOperand: destinationOperand,

        sourceOperand: getSourceOperands(
          finalOperandCount,
          rawDestinationOperand
        ),
        SourceOperand: getSourceOperands(
          finalOperandCount,
          rawDestinationOperand
        ),

        operandType: getOperandTypeByMnemonic(mnemonic),
        OperandType: getOperandTypeByMnemonic(mnemonic),

        instructionFormat:
          i.InstructionFormat !== null && i.InstructionFormat !== undefined
            ? i.InstructionFormat
            : "-",
        InstructionFormat:
          i.InstructionFormat !== null && i.InstructionFormat !== undefined
            ? i.InstructionFormat
            : "-",

        affectedFlags: getAffectedFlagsByMnemonic(mnemonic),
        AffectedFlags: getAffectedFlagsByMnemonic(mnemonic),

        interruptSymbol: cleanDbValue(i.InterruptSymbol),
        InterruptSymbol: cleanDbValue(i.InterruptSymbol),

        outputRegister: cleanDbValue(i.OutputRegister),
        OutputRegister: cleanDbValue(i.OutputRegister),

        inputRegister: cleanDbValue(i.InputRegister),
        InputRegister: cleanDbValue(i.InputRegister),
      };
    });

    // ===== Actions =====
    const actions = (data?.Instructions || []).map((i) => ({
      id: i.InstructionID,
      mnemonic: cleanDbValue(i.Mnemonics),
      action: cleanDbValue(i.Action),
    }));

    // ===== Addressing Modes =====
    const addressingModes = (data?.AddressingModes || []).map((m) => ({
      id: m.AddressingModeID,
      name: cleanDbValue(m.AddressingModeName),
      code: cleanDbValue(m.AddressingModeCode),
      symbol: cleanDbValue(m.AddressingModeSymbol),
    }));

    return {
      architecture,
      registers,
      flagRegisters,
      generalRegisters,
      instructions,
      actions,
      addressingModes,
    };
  } catch (error) {
    console.log("Detail API Error:", error);
    throw error;
  }
};

// ================= DELETE ARCHITECTURE =================
export const deleteArchitecture = async (architectureId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/architecture/delete/${architectureId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Failed to delete architecture");
    }

    return data;
  } catch (error) {
    console.log("Delete Architecture API Error:", error);
    throw error;
  }
};