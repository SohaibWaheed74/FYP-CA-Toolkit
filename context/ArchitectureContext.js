// showing only 8 bit memory values if values increased then showing full memory values like 12 bit values

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
  stackValues: [],

  initializeMemory: () => {},
  clearMemory: () => {},
  updateMemoryFromSummary: () => {},
  updateMemoryFromExecutionResult: () => {},
});

const DEFAULT_STACK_SIZE = 16;

const createEmptyMemory = (size) => {
  const safeSize = Number(size) > 0 ? Number(size) : 0;

  return Array.from({ length: safeSize }, () =>
    Array.from({ length: 8 }, () => 0)
  );
};

const createEmptyStack = (size = DEFAULT_STACK_SIZE) => {
  const safeSize = Number(size) > 0 ? Number(size) : DEFAULT_STACK_SIZE;

  return Array.from({ length: safeSize }, () => "");
};

// If value is 8-bit or less, show 8 bits.
// If value exceeds 8-bit, show full binary.
const numberToBitArray = (value) => {
  const num = Number(value) || 0;

  // Negative values ko simple 8-bit signed style me handle karega
  // Example: -1 => 11111111
  if (num < 0) {
    const byteValue = ((num % 256) + 256) % 256;

    return Array.from({ length: 8 }, (_, index) => {
      const bitPosition = 7 - index;
      return (byteValue >> bitPosition) & 1;
    });
  }

  const binary = num.toString(2);

  // Example: 45 => 00101101
  if (binary.length <= 8) {
    return binary.padStart(8, "0").split("").map(Number);
  }

  // Example: 3000 => 101110111000
  return binary.split("").map(Number);
};

export const ArchitectureProvider = ({ children }) => {
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);

  const [memorySize, setMemorySize] = useState(0);
  const [memoryBits, setMemoryBits] = useState([]);
  const [stackValues, setStackValues] = useState(() =>
    createEmptyStack(DEFAULT_STACK_SIZE)
  );

  // Use button press hone par DB ke MemorySize se empty memory create hogi
  const initializeMemory = useCallback((size, stackSize = DEFAULT_STACK_SIZE) => {
    const safeSize = Number(size) > 0 ? Number(size) : 0;
    const safeStackSize =
      Number(stackSize) > 0 ? Number(stackSize) : DEFAULT_STACK_SIZE;

    setMemorySize(safeSize);
    setMemoryBits(createEmptyMemory(safeSize));
    setStackValues(createEmptyStack(safeStackSize));
  }, []);

  // Agar architecture change ho ya memory reset karni ho
  const clearMemory = useCallback(() => {
    setSelectedArchitecture(null);
    setMemorySize(0);
    setMemoryBits([]);
    setStackValues(createEmptyStack(DEFAULT_STACK_SIZE));
  }, []);

  // Backend MemorySummary se memory update hogi
  // Example: MemorySummary = { "0": 45, "2": 3000 }
  const updateMemoryFromSummary = useCallback((memorySummary) => {
    if (!memorySummary) return;

    setMemoryBits((prevMemory) => {
      const updatedMemory = prevMemory.map((row) => [...row]);

      Object.entries(memorySummary).forEach(([address, value]) => {
        const rowIndex = Number(address);

        if (rowIndex >= 0 && rowIndex < updatedMemory.length) {
          updatedMemory[rowIndex] = numberToBitArray(value);
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
              updatedMemory[flatAddress] = numberToBitArray(value);
            }

            flatAddress++;
          });
        }
      });

      return updatedMemory;
    });
  }, []);

  // Backend StackSummary se stack update hogi
  // Example: StackSummary = { "0": 45, "1": 300 }
  const updateStackFromSummary = useCallback((stackSummary) => {
    setStackValues((prevStack) => {
      const updatedStack = createEmptyStack(prevStack.length || DEFAULT_STACK_SIZE);

      if (!stackSummary) {
        return updatedStack;
      }

      Object.entries(stackSummary).forEach(([index, value]) => {
        const stackIndex = Number(index);

        if (stackIndex >= 0 && stackIndex < updatedStack.length) {
          updatedStack[stackIndex] = String(value);
        }
      });

      return updatedStack;
    });
  }, []);

  // Agar backend full Stack array bheje to ye handle karega
  const updateStackFromArray = useCallback((stackArray) => {
    if (!Array.isArray(stackArray)) return;

    setStackValues(() => {
      const updatedStack = createEmptyStack(
        stackArray.length || DEFAULT_STACK_SIZE
      );

      stackArray.forEach((value, index) => {
        if (Number(value) !== 0) {
          updatedStack[index] = String(value);
        }
      });

      return updatedStack;
    });
  }, []);

  // EditorScreen / DebuggingScreen me run ke baad ye function call hoga
  const updateMemoryFromExecutionResult = useCallback(
    (executionResult) => {
      if (!executionResult) return;

      // ================= MEMORY UPDATE =================

      if (Array.isArray(executionResult.memoryBits)) {
        setMemoryBits(executionResult.memoryBits);
      } else {
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
        } else if (memoryMatrix) {
          updateMemoryFromMatrix(memoryMatrix);
        }
      }

      // ================= STACK UPDATE =================

      const stackSummary =
        executionResult.StackSummary ||
        executionResult.stackSummary ||
        executionResult.stack ||
        null;

      const stackArray =
        executionResult.Stack ||
        executionResult.stackArray ||
        null;

      if (stackSummary) {
        updateStackFromSummary(stackSummary);
      } else if (stackArray) {
        updateStackFromArray(stackArray);
      } else {
        updateStackFromSummary(null);
      }
    },
    [
      updateMemoryFromSummary,
      updateMemoryFromMatrix,
      updateStackFromSummary,
      updateStackFromArray,
    ]
  );

  const contextValue = useMemo(
    () => ({
      selectedArchitecture,
      setSelectedArchitecture,

      memorySize,
      memoryBits,
      stackValues,

      initializeMemory,
      clearMemory,
      updateMemoryFromSummary,
      updateMemoryFromExecutionResult,
    }),
    [
      selectedArchitecture,
      memorySize,
      memoryBits,
      stackValues,
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


//Show only 8 bit memory values if values increaedd then still showing 8 bit

// import React, {
//   createContext,
//   useCallback,
//   useMemo,
//   useState,
// } from "react";

// export const ArchitectureContext = createContext({
//   selectedArchitecture: null,
//   setSelectedArchitecture: () => {},

//   memorySize: 0,
//   memoryBits: [],
//   initializeMemory: () => {},
//   clearMemory: () => {},
//   updateMemoryFromSummary: () => {},
//   updateMemoryFromExecutionResult: () => {},
// });

// const createEmptyMemory = (size) => {
//   const safeSize = Number(size) > 0 ? Number(size) : 0;

//   return Array.from({ length: safeSize }, () =>
//     Array.from({ length: 8 }, () => 0)
//   );
// };

// const numberTo8BitArray = (value) => {
//   const num = Number(value) || 0;

//   // Negative values ko bhi 8-bit byte me convert karega
//   const byteValue = ((num % 256) + 256) % 256;

//   return Array.from({ length: 8 }, (_, index) => {
//     const bitPosition = 7 - index;
//     return (byteValue >> bitPosition) & 1;
//   });
// };

// export const ArchitectureProvider = ({ children }) => {
//   const [selectedArchitecture, setSelectedArchitecture] = useState(null);

//   const [memorySize, setMemorySize] = useState(0);
//   const [memoryBits, setMemoryBits] = useState([]);

//   // Use button press hone par DB ke MemorySize se empty memory create hogi
//   const initializeMemory = useCallback((size) => {
//     const safeSize = Number(size) > 0 ? Number(size) : 0;

//     setMemorySize(safeSize);
//     setMemoryBits(createEmptyMemory(safeSize));
//   }, []);

//   // Agar architecture change ho ya memory reset karni ho
//   const clearMemory = useCallback(() => {
//     setMemorySize(0);
//     setMemoryBits([]);
//   }, []);

//   // Backend MemorySummary se memory update hogi
//   // Example: MemorySummary = { "0": 5, "1": 10 }
//   const updateMemoryFromSummary = useCallback((memorySummary) => {
//     if (!memorySummary) return;

//     setMemoryBits((prevMemory) => {
//       const updatedMemory = prevMemory.map((row) => [...row]);

//       Object.entries(memorySummary).forEach(([address, value]) => {
//         const rowIndex = Number(address);

//         if (rowIndex >= 0 && rowIndex < updatedMemory.length) {
//           updatedMemory[rowIndex] = numberTo8BitArray(value);
//         }
//       });

//       return updatedMemory;
//     });
//   }, []);

//   // Agar backend full Memory matrix bheje to ye handle karega
//   const updateMemoryFromMatrix = useCallback((memoryMatrix) => {
//     if (!Array.isArray(memoryMatrix)) return;

//     setMemoryBits((prevMemory) => {
//       const updatedMemory = prevMemory.map((row) => [...row]);

//       let flatAddress = 0;

//       memoryMatrix.forEach((row) => {
//         if (Array.isArray(row)) {
//           row.forEach((value) => {
//             if (flatAddress < updatedMemory.length) {
//               updatedMemory[flatAddress] = numberTo8BitArray(value);
//             }

//             flatAddress++;
//           });
//         }
//       });

//       return updatedMemory;
//     });
//   }, []);

//   // EditorScreen / DebuggingScreen me run ke baad ye function call hoga
//   const updateMemoryFromExecutionResult = useCallback(
//     (executionResult) => {
//       if (!executionResult) return;

//       const memorySummary =
//         executionResult.MemorySummary ||
//         executionResult.memorySummary ||
//         null;

//       const memoryMatrix =
//         executionResult.Memory ||
//         executionResult.memory ||
//         null;

//       if (memorySummary) {
//         updateMemoryFromSummary(memorySummary);
//         return;
//       }

//       if (memoryMatrix) {
//         updateMemoryFromMatrix(memoryMatrix);
//       }
//     },
//     [updateMemoryFromSummary, updateMemoryFromMatrix]
//   );

//   const contextValue = useMemo(
//     () => ({
//       selectedArchitecture,
//       setSelectedArchitecture,

//       memorySize,
//       memoryBits,
//       initializeMemory,
//       clearMemory,
//       updateMemoryFromSummary,
//       updateMemoryFromExecutionResult,
//     }),
//     [
//       selectedArchitecture,
//       memorySize,
//       memoryBits,
//       initializeMemory,
//       clearMemory,
//       updateMemoryFromSummary,
//       updateMemoryFromExecutionResult,
//     ]
//   );

//   return (
//     <ArchitectureContext.Provider value={contextValue}>
//       {children}
//     </ArchitectureContext.Provider>
//   );
// };