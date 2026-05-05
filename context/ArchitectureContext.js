import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

export const ArchitectureContext = createContext({
  selectedArchitecture: null,
  setSelectedArchitecture: () => {},

  memorySize: 0,
  memoryBits: [],
  initializeMemory: () => {},
  clearMemory: () => {},
  updateMemoryFromSummary: () => {},
  updateMemoryFromExecutionResult: () => {},
});

const createEmptyMemory = (size) => {
  const safeSize = Number(size) > 0 ? Number(size) : 0;

  return Array.from({ length: safeSize }, () =>
    Array.from({ length: 8 }, () => 0)
  );
};

const numberTo8BitArray = (value) => {
  const num = Number(value) || 0;

  // Negative values ko bhi 8-bit byte me convert karega
  const byteValue = ((num % 256) + 256) % 256;

  return Array.from({ length: 8 }, (_, index) => {
    const bitPosition = 7 - index;
    return (byteValue >> bitPosition) & 1;
  });
};

export const ArchitectureProvider = ({ children }) => {
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);

  const [memorySize, setMemorySize] = useState(0);
  const [memoryBits, setMemoryBits] = useState([]);

  // Use button press hone par DB ke MemorySize se empty memory create hogi
  const initializeMemory = useCallback((size) => {
    const safeSize = Number(size) > 0 ? Number(size) : 0;

    setMemorySize(safeSize);
    setMemoryBits(createEmptyMemory(safeSize));
  }, []);

  // Agar architecture change ho ya memory reset karni ho
  const clearMemory = useCallback(() => {
    setMemorySize(0);
    setMemoryBits([]);
  }, []);

  // Backend MemorySummary se memory update hogi
  // Example: MemorySummary = { "0": 5, "1": 10 }
  const updateMemoryFromSummary = useCallback((memorySummary) => {
    if (!memorySummary) return;

    setMemoryBits((prevMemory) => {
      const updatedMemory = prevMemory.map((row) => [...row]);

      Object.entries(memorySummary).forEach(([address, value]) => {
        const rowIndex = Number(address);

        if (rowIndex >= 0 && rowIndex < updatedMemory.length) {
          updatedMemory[rowIndex] = numberTo8BitArray(value);
        }
      });

      return updatedMemory;
    });
  }, []);

  // Agar backend full Memory matrix bheje to ye handle karega
  const updateMemoryFromMatrix = useCallback((memoryMatrix) => {
    if (!Array.isArray(memoryMatrix)) return;

    setMemoryBits((prevMemory) => {
      const updatedMemory = prevMemory.map((row) => [...row]);

      let flatAddress = 0;

      memoryMatrix.forEach((row) => {
        if (Array.isArray(row)) {
          row.forEach((value) => {
            if (flatAddress < updatedMemory.length) {
              updatedMemory[flatAddress] = numberTo8BitArray(value);
            }

            flatAddress++;
          });
        }
      });

      return updatedMemory;
    });
  }, []);

  // EditorScreen / DebuggingScreen me run ke baad ye function call hoga
  const updateMemoryFromExecutionResult = useCallback(
    (executionResult) => {
      if (!executionResult) return;

      const memorySummary =
        executionResult.MemorySummary ||
        executionResult.memorySummary ||
        null;

      const memoryMatrix =
        executionResult.Memory ||
        executionResult.memory ||
        null;

      if (memorySummary) {
        updateMemoryFromSummary(memorySummary);
        return;
      }

      if (memoryMatrix) {
        updateMemoryFromMatrix(memoryMatrix);
      }
    },
    [updateMemoryFromSummary, updateMemoryFromMatrix]
  );

  const contextValue = useMemo(
    () => ({
      selectedArchitecture,
      setSelectedArchitecture,

      memorySize,
      memoryBits,
      initializeMemory,
      clearMemory,
      updateMemoryFromSummary,
      updateMemoryFromExecutionResult,
    }),
    [
      selectedArchitecture,
      memorySize,
      memoryBits,
      initializeMemory,
      clearMemory,
      updateMemoryFromSummary,
      updateMemoryFromExecutionResult,
    ]
  );

  return (
    <ArchitectureContext.Provider value={contextValue}>
      {children}
    </ArchitectureContext.Provider>
  );
};