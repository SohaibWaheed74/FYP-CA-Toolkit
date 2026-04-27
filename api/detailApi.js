// const BASE_URL = "http://192.168.1.8/ComputerArchitectureToolkitAPI/api";
const BASE_URL = "http://192.168.18.108/ComputerArchitectureToolkitAPI/api";

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

    console.log("RAW ARCHITECTURE DETAILS API DATA:", JSON.stringify(data, null, 2));

    // ===== Architecture Info =====
    const architecture = {
      name: data?.Architecture?.Name || "-",
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
    const generalRegisters = (data?.Registers || [])
      .filter((r) => !r.Action || r.Action === "")
      .map((r) => ({
        id: r.RegisterID,
        name: r.Name,
        size: `${r.RegisterSize}-bit`,
        role: "General Purpose",
      }));

    const flagRegisters = (data?.Registers || [])
      .filter((r) => r.Action && r.Action !== "")
      .map((r) => ({
        id: r.RegisterID,
        name: r.Name,
        size: `${r.RegisterSize}-bit`,
      }));

    // ===== Instructions =====
    const instructions = (data?.Instructions || []).map((i) => ({
      id: i.InstructionID,
      mnemonic: i.Mnemonics,
      opcode: i.Opcode,
      set: i.Action || "-",

      // ✅ IMPORTANT: interrupt data yahan pass karna zaroori hai
      interruptSymbol:
        i.InterruptSymbol && i.InterruptSymbol !== "NULL"
          ? i.InterruptSymbol
          : "",
      outputRegister:
        i.OutputRegister && i.OutputRegister !== "NULL"
          ? i.OutputRegister
          : "",
      inputRegister:
        i.InputRegister && i.InputRegister !== "NULL"
          ? i.InputRegister
          : "",
    }));

    const actions = (data?.Instructions || []).map((i) => ({
      id: i.InstructionID,
      mnemonic: i.Mnemonics,
      action: i.Action || "-",
    }));

    // ===== Addressing Modes =====
    const addressingModes = (data?.AddressingModes || []).map((m) => ({
      id: m.AddressingModeID,
      name: m.AddressingModeName || "-",
      code: m.AddressingModeCode || "-",
      symbol: m.AddressingModeSymbol || "-",
    }));

    return {
      architecture,
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