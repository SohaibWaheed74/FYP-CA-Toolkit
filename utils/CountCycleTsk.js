// CountCycle.js
// Formula: Fetch 2 + Decode 1 + Execute Action Steps

const FETCH = 2;
const DECODE = 1;

const clean = (v) => String(v || "").trim().toUpperCase();

const getLines = (code) =>
  String(code || "")
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/g, "").replace(/;.*/g, "").trim())
    .filter(Boolean);

const getMnemonic = (line) => clean(line.split(/\s+/)[0]);

const getDbMnemonic = (ins) =>
  clean(
    ins?.Mnemonics ||
      ins?.mnemonics ||
      ins?.Mnemonic ||
      ins?.mnemonic ||
      ins?.Name ||
      ins?.name
  );

const getAction = (ins) => ins?.Action || ins?.action || "";

const countExecuteCycles = (action) => {
  const steps = String(action || "")
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return steps.length || 1;
};

export const calculateCountCycle = (code, architecture) => {
  const instructions = architecture?.Instructions || architecture?.instructions || [];
  const programLines = getLines(code);

  let totalCycles = 0;
  const steps = [];

  programLines.forEach((line, index) => {
    const mnemonic = getMnemonic(line);

    const instruction = instructions.find(
      (ins) => getDbMnemonic(ins) === mnemonic
    );

    if (!instruction) {
      throw new Error(`Line ${index + 1}: ${mnemonic} not found in DB.`);
    }

    const action = getAction(instruction);
    const execute = countExecuteCycles(action);
    const cycles = FETCH + DECODE + execute;

    totalCycles += cycles;

    steps.push({
      lineNumber: index + 1,
      instruction: line,
      mnemonic,
      action,
      fetchCycles: FETCH,
      decodeCycles: DECODE,
      executeCycles: execute,
      totalCycles: cycles,
    });
  });

  return {
    totalCycles,
    instructionCount: programLines.length,
    steps,
  };
};

export const calculateCountCycleByArchitectureId = async ({
  code,
  architectureId,
  getInstructionsByArchitectureId,
  architecture = {},
}) => {
  const instructions = await getInstructionsByArchitectureId(architectureId);

  return calculateCountCycle(code, {
    ...architecture,
    ArchitectureID: architectureId,
    Instructions: instructions || [],
  });
};

export default calculateCountCycle;


// //Sir, I used a simple formula:
// Each instruction has Fetch = 2 cycles and Decode = 1 cycle.
// Execute cycles depend on the instruction Action saved in DB.
// If action has 1 line, execute = 1.
// If action has multiple lines or semicolon-separated micro-operations, execute = number of steps.
// Then I add cycles of all program lines.