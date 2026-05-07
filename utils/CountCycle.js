// CountCycle.js
// -------------------------------------------------------------
// Count cycle logic based on teacher's Fetch + Decode + Execute
// timing-state concept.
//
// Important:
// - Mnemonics are fully user-defined in your FYP.
// - Do NOT hardcode ADD, SUB, MUL, STORE, etc.
// - First match the editor mnemonic with the instruction row from DB.
// - Then count cycles from that instruction's Action / Micro-operations.
//
// Teacher concept:
// T0: AR <- PC          Fetch
// T1: IR <- M[AR]      Fetch
// T2: Decode           Decode
// T3...Tn: Action      Execute
//
// Total cycles = Fetch cycles + Decode cycles + Execute action steps
// -------------------------------------------------------------

const DEFAULT_FETCH_CYCLES = 2; // T0 + T1
const DEFAULT_DECODE_CYCLES = 1; // T2
const DEFAULT_EXECUTE_CYCLES = 1;

// -------------------- BASIC HELPERS --------------------

function isEmptyValue(value) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "-" ||
    value === "NULL" ||
    value === "null"
  );
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstDefined(...values) {
  return values.find((value) => !isEmptyValue(value));
}

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

// -------------------- ARCHITECTURE / INSTRUCTION HELPERS --------------------

function getArchitectureInstructions(architecture) {
  return (
    architecture?.Instructions ||
    architecture?.instructions ||
    architecture?.ArchitectureInstructions ||
    architecture?.architectureInstructions ||
    []
  );
}

function splitMnemonicValues(value) {
  if (isEmptyValue(value)) return [];

  if (Array.isArray(value)) {
    return value.flatMap(splitMnemonicValues);
  }

  // Supports:
  // "Jama"
  // "Jama,Plus,Sum"
  // "Jama/Plus"
  // "Jama|Plus"
  return String(value)
    .split(/[,/|]+/)
    .map(normalize)
    .filter(Boolean);
}

function getInstructionMnemonicList(instruction) {
  return [
    instruction?.Mnemonics,
    instruction?.mnemonics,
    instruction?.Mnemonic,
    instruction?.mnemonic,
    instruction?.InstructionName,
    instruction?.instructionName,
    instruction?.Name,
    instruction?.name,
    instruction?.Aliases,
    instruction?.aliases,
    instruction?.AlternativeMnemonics,
    instruction?.alternativeMnemonics,
  ]
    .flatMap(splitMnemonicValues)
    .filter(Boolean);
}

function getInstructionAction(instruction) {
  return firstDefined(
    instruction?.Action,
    instruction?.action,
    instruction?.Actions,
    instruction?.actions,
    instruction?.InstructionAction,
    instruction?.instructionAction,
    instruction?.MicroOperations,
    instruction?.microOperations,
    instruction?.MicroOperation,
    instruction?.microOperation,
    instruction?.Operation,
    instruction?.operation
  );
}

// -------------------- PROGRAM PARSING --------------------

function stripInlineComment(line) {
  // Do NOT remove # because it can be used for immediate values.
  // Example: SET R1, #5
  return String(line || "")
    .replace(/\/\/.*$/g, "")
    .replace(/;.*/g, "")
    .trim();
}

function removeLabel(line) {
  const value = String(line || "").trim();

  if (!value.includes(":")) return value;

  const parts = value.split(":");

  // Example:
  // LOOP: Jama R1,R2  => Jama R1,R2
  // LOOP:             => empty, ignored later
  return parts.slice(1).join(":").trim();
}

function parseProgram(code) {
  return String(code || "")
    .split("\n")
    .map((rawLine, index) => {
      const withoutComment = stripInlineComment(rawLine);
      const instructionText = removeLabel(withoutComment);
      const mnemonic = normalize(instructionText.split(/\s+/)[0]);

      return {
        lineNumber: index + 1,
        rawLine,
        instructionText,
        mnemonic,
      };
    })
    .filter((line) => {
      if (!line.instructionText || !line.mnemonic) return false;

      // Ignore assembler directives like .data, .text, .global
      if (line.mnemonic.startsWith(".")) return false;

      return true;
    });
}

// -------------------- MATCH MNEMONIC WITH DB INSTRUCTION --------------------

function findInstructionByMnemonic(mnemonic, instructions) {
  return instructions.find((instruction) => {
    const mnemonics = getInstructionMnemonicList(instruction);
    return mnemonics.includes(mnemonic);
  });
}

// -------------------- ACTION / MICRO-OPERATION COUNT --------------------

function getActionSteps(action) {
  if (isEmptyValue(action)) return [];

  // Supports action as array:
  // ["EA <- address", "DR <- M[EA]", "R1 <- R1 + DR"]
  if (Array.isArray(action)) {
    return action
      .map((step) => {
        if (typeof step === "string") return step.trim();

        return String(
          firstDefined(
            step?.Action,
            step?.action,
            step?.MicroOperation,
            step?.microOperation,
            step?.Operation,
            step?.operation,
            step?.Step,
            step?.step
          ) || ""
        ).trim();
      })
      .filter((step) => !isEmptyValue(step));
  }

  const actionText = String(action).trim();

  if (isEmptyValue(actionText)) return [];

  // Supported DB Action formats:
  //
  // "R1 <- R1 + R2"
  //
  // "EA <- address; DR <- M[EA]; R1 <- R1 + DR"
  //
  // "EA <- address
  //  DR <- M[EA]
  //  R1 <- R1 + DR"
  //
  // Each semicolon or new line means one execute micro-operation.
  return actionText
    .split(/[\n;]+/)
    .map((step) => step.trim())
    .filter((step) => !isEmptyValue(step));
}

function getExecuteCyclesFromAction(instruction) {
  const directExecuteCycles = firstDefined(
    instruction?.ExecuteCycles,
    instruction?.executeCycles,
    instruction?.ExecutionCycles,
    instruction?.executionCycles
  );

  // If DB explicitly stores ExecuteCycles, use that.
  if (directExecuteCycles !== undefined) {
    return toNumber(directExecuteCycles, DEFAULT_EXECUTE_CYCLES);
  }

  const action = getInstructionAction(instruction);
  const actionSteps = getActionSteps(action);

  // If action is missing, minimum execute cycle is 1.
  return Math.max(actionSteps.length, DEFAULT_EXECUTE_CYCLES);
}

// -------------------- FETCH / DECODE CYCLE COUNT --------------------

function getFetchCycles(architecture, instruction) {
  return toNumber(
    firstDefined(
      instruction?.FetchCycles,
      instruction?.fetchCycles,
      architecture?.FetchCycles,
      architecture?.fetchCycles,
      architecture?.CycleConfig?.FetchCycles,
      architecture?.cycleConfig?.fetchCycles
    ),
    DEFAULT_FETCH_CYCLES
  );
}

function getDecodeCycles(architecture, instruction) {
  return toNumber(
    firstDefined(
      instruction?.DecodeCycles,
      instruction?.decodeCycles,
      architecture?.DecodeCycles,
      architecture?.decodeCycles,
      architecture?.CycleConfig?.DecodeCycles,
      architecture?.cycleConfig?.decodeCycles
    ),
    DEFAULT_DECODE_CYCLES
  );
}

// -------------------------------------------------------------
// MAIN FUNCTION
// Use this when selectedArchitecture already contains Instructions.
// -------------------------------------------------------------

export function calculateCountCycle(code, selectedArchitecture) {
  const instructions = getArchitectureInstructions(selectedArchitecture);
  const parsedLines = parseProgram(code);

  // First validate all mnemonics.
  // Agar koi mnemonic DB instruction table mein nahi hai,
  // to usko count nahi karna. Error throw karna hai.
  const invalidInstructions = parsedLines
    .map((line) => {
      const instruction = findInstructionByMnemonic(line.mnemonic, instructions);

      if (!instruction) {
        return {
          lineNumber: line.lineNumber,
          instructionText: line.instructionText,
          mnemonic: line.mnemonic,
        };
      }

      return null;
    })
    .filter(Boolean);

  if (invalidInstructions.length > 0) {
    const message = invalidInstructions
      .map(
        (item) =>
          `Line ${item.lineNumber}: "${item.instructionText}" is not defined in this architecture.`
      )
      .join("\n");

    throw new Error(message);
  }

  const steps = parsedLines.map((line) => {
    const instruction = findInstructionByMnemonic(line.mnemonic, instructions);

    const fetchCycles = getFetchCycles(selectedArchitecture, instruction);
    const decodeCycles = getDecodeCycles(selectedArchitecture, instruction);

    const action = getInstructionAction(instruction);
    const actionSteps = getActionSteps(action);

    const executeCycles = getExecuteCyclesFromAction(instruction);

    const totalCycles = fetchCycles + decodeCycles + executeCycles;

    return {
      lineNumber: line.lineNumber,
      originalLine: line.rawLine,
      instructionText: line.instructionText,
      mnemonic: line.mnemonic,

      matched: true,
      action,
      actionSteps,

      fetchCycles,
      decodeCycles,
      executeCycles,
      totalCycles,

      timing: {
        fetch: ["T0: AR <- PC", "T1: IR <- M[AR]"],
        decode: ["T2: Decode opcode, mode and address"],
        execute: actionSteps.map((step, index) => `T${index + 3}: ${step}`),
      },

      reason:
        "Matched user-defined mnemonic from DB and counted Fetch + Decode + Execute action steps",
    };
  });

  const breakdown = steps.reduce(
    (acc, step) => {
      acc.fetch += step.fetchCycles;
      acc.decode += step.decodeCycles;
      acc.execute += step.executeCycles;
      acc.total += step.totalCycles;

      return acc;
    },
    {
      fetch: 0,
      decode: 0,
      execute: 0,
      total: 0,
      unknownInstructions: 0,
    }
  );

  return {
    totalCycles: breakdown.total,
    instructionCount: steps.length,
    mode: "teacher-fetch-decode-execute-action-based",
    breakdown,
    steps,
  };
}
// -------------------------------------------------------------
// ASYNC HELPER
// Use this if EditorScreen only has ArchitectureID,
// and instructions need to be fetched from DB/API.
// -------------------------------------------------------------

export async function calculateCountCycleByArchitectureId({
  code,
  architectureId,
  getInstructionsByArchitectureId,
  architecture = {},
}) {
  if (!architectureId) {
    throw new Error("ArchitectureID is required for cycle count.");
  }

  if (typeof getInstructionsByArchitectureId !== "function") {
    throw new Error("getInstructionsByArchitectureId API function is required.");
  }

  const instructions = await getInstructionsByArchitectureId(architectureId);

  const selectedArchitecture = {
    ...architecture,
    ArchitectureID: architectureId,
    Instructions: Array.isArray(instructions) ? instructions : [],
  };

  return calculateCountCycle(code, selectedArchitecture);
}

// -------------------------------------------------------------
// SUMMARY FUNCTION
// Use this if you only need short summary for UI.
// -------------------------------------------------------------

export function getCycleSummary(code, selectedArchitecture) {
  const result = calculateCountCycle(code, selectedArchitecture);

  return {
    totalCycles: result.totalCycles,
    instructionCount: result.instructionCount,
    fetchCycles: result.breakdown.fetch,
    decodeCycles: result.breakdown.decode,
    executeCycles: result.breakdown.execute,
    unknownInstructions: result.breakdown.unknownInstructions,
    mode: result.mode,
  };
}

export default calculateCountCycle;