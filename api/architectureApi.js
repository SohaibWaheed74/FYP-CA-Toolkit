import BASE_URL from "./apiConfig";

// 1️⃣ Create Architecture
export const createArchitecture = async (cpuData) => {
  const response = await fetch(`${BASE_URL}/architecture/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cpuData),
  });

  return response.json();
};

// 2️⃣ Add Registers
export const addRegisters = async (architectureId, registers) => {
  const response = await fetch(
    `${BASE_URL}/architecture/${architectureId}/register/addList`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registers),
    }
  );

  return response.json();
};

// 3️⃣ Add Instructions
export const addInstructions = async (architectureId, instructions) => {
  const response = await fetch(
    `${BASE_URL}/architecture/${architectureId}/instruction/addList`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instructions),
    }
  );

  return response.json();
};

// 4️⃣ Add Addressing Modes
export const addAddressingModes = async (architectureId, modes) => {
  const response = await fetch(
    `${BASE_URL}/architecture/${architectureId}/addressingmode/addlist`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modes),
    }
  );

  return response.json();
};
