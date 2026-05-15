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
  stackSize: 16,

  memoryBits: [],
  stackValues: [],
  stackPointer: 0,

  instructionDetails: [],
  latestExecutionResult: null,

  initializeMemory: () => {},
  clearMemory: () => {},
  updateMemoryFromSummary: () => {},
  updateMemoryFromExecutionResult: () => {},
});

const DEFAULT_MEMORY_SIZE = 128;
const DEFAULT_STACK_SIZE = 16;
const CODE_SEGMENT_LIMIT = 100;

const createEmptyMemory = (size) => {
  const safeSize = Number(size) > 0 ? Number(size) : DEFAULT_MEMORY_SIZE;

  return Array.from({ length: safeSize }, () =>
    Array.from({ length: 8 }, () => 0)
  );
};

const createEmptyStack = (size) => {
  const safeSize = Number(size) > 0 ? Number(size) : DEFAULT_STACK_SIZE;

  return Array.from({ length: safeSize }, () => "");
};

const numberToBitArray = (value) => {
  const num = Number(value) || 0;

  // Keep value inside 1 byte range: 0 to 255
  const byteValue = ((num % 256) + 256) % 256;

  return Array.from({ length: 8 }, (_, index) => {
    const bitPosition = 7 - index;
    return (byteValue >> bitPosition) & 1;
  });
};

const binaryToTwoBytes = (binaryFormat) => {
  const cleanBinary = String(binaryFormat || "")
    .replace(/\s/g, "")
    .padStart(16, "0")
    .slice(-16);

  const firstByte = cleanBinary.slice(0, 8).split("").map(Number);
  const secondByte = cleanBinary.slice(8, 16).split("").map(Number);

  return {
    firstByte,
    secondByte,
  };
};

export const ArchitectureProvider = ({ children }) => {
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);

  const [memorySize, setMemorySize] = useState(0);
  const [stackSize, setStackSize] = useState(DEFAULT_STACK_SIZE);

  const [memoryBits, setMemoryBits] = useState([]);
  const [stackValues, setStackValues] = useState(
    createEmptyStack(DEFAULT_STACK_SIZE)
  );

  const [stackPointer, setStackPointer] = useState(0);
  const [instructionDetails, setInstructionDetails] = useState([]);
  const [latestExecutionResult, setLatestExecutionResult] = useState(null);

  const initializeMemory = useCallback((size, stackSizeFromDb) => {
    const safeMemorySize =
      Number(size) > 0 ? Number(size) : DEFAULT_MEMORY_SIZE;

    const safeStackSize =
      Number(stackSizeFromDb) > 0
        ? Number(stackSizeFromDb)
        : DEFAULT_STACK_SIZE;

    setMemorySize(safeMemorySize);
    setStackSize(safeStackSize);

    setMemoryBits(createEmptyMemory(safeMemorySize));
    setStackValues(createEmptyStack(safeStackSize));

    setStackPointer(0);
    setInstructionDetails([]);
    setLatestExecutionResult(null);
  }, []);

  const clearMemory = useCallback(() => {
    setSelectedArchitecture(null);

    setMemorySize(0);
    setStackSize(DEFAULT_STACK_SIZE);

    setMemoryBits([]);
    setStackValues(createEmptyStack(DEFAULT_STACK_SIZE));

    setStackPointer(0);
    setInstructionDetails([]);
    setLatestExecutionResult(null);
  }, []);

  const updateInstructionDetailsInMemory = useCallback((details) => {
    if (!Array.isArray(details)) return;

    setInstructionDetails(details);

    setMemoryBits((prevMemory) => {
      const updatedMemory =
        Array.isArray(prevMemory) && prevMemory.length > 0
          ? prevMemory.map((row) => [...row])
          : createEmptyMemory(DEFAULT_MEMORY_SIZE);

      details.forEach((instruction, index) => {
        /*
          First 100 addresses are for instruction format.
          1 instruction = 16 bits = 2 memory addresses.
          So 50 instructions fit in first 100 addresses.
        */
        if (index >= 50) return;

        const binaryFormat =
          instruction.BinaryFormat ||
          instruction.binaryFormat ||
          "";

        const { firstByte, secondByte } = binaryToTwoBytes(binaryFormat);

        const firstAddress = index * 2;
        const secondAddress = firstAddress + 1;

        if (
          firstAddress >= 0 &&
          firstAddress < CODE_SEGMENT_LIMIT &&
          firstAddress < updatedMemory.length
        ) {
          updatedMemory[firstAddress] = firstByte;
        }

        if (
          secondAddress >= 0 &&
          secondAddress < CODE_SEGMENT_LIMIT &&
          secondAddress < updatedMemory.length
        ) {
          updatedMemory[secondAddress] = secondByte;
        }
      });

      return updatedMemory;
    });
  }, []);

  const updateMemoryFromSummary = useCallback((memorySummary) => {
    if (!memorySummary) return;

    setMemoryBits((prevMemory) => {
      const updatedMemory =
        Array.isArray(prevMemory) && prevMemory.length > 0
          ? prevMemory.map((row) => [...row])
          : createEmptyMemory(DEFAULT_MEMORY_SIZE);

      Object.entries(memorySummary).forEach(([address, value]) => {
        const rowIndex = Number(address);

        /*
          Data memory should start from address 100.
          Address 0-99 is reserved for instruction format.
        */
        if (
          rowIndex >= CODE_SEGMENT_LIMIT &&
          rowIndex < updatedMemory.length
        ) {
          updatedMemory[rowIndex] = numberToBitArray(value);
        }
      });

      return updatedMemory;
    });
  }, []);

  const updateMemoryFromMatrix = useCallback((memoryMatrix) => {
    if (!Array.isArray(memoryMatrix)) return;

    setMemoryBits((prevMemory) => {
      const updatedMemory =
        Array.isArray(prevMemory) && prevMemory.length > 0
          ? prevMemory.map((row) => [...row])
          : createEmptyMemory(DEFAULT_MEMORY_SIZE);

      let flatAddress = 0;

      memoryMatrix.forEach((row) => {
        if (Array.isArray(row)) {
          row.forEach((value) => {
            if (
              flatAddress >= CODE_SEGMENT_LIMIT &&
              flatAddress < updatedMemory.length
            ) {
              updatedMemory[flatAddress] = numberToBitArray(value);
            }

            flatAddress++;
          });
        }
      });

      return updatedMemory;
    });
  }, []);

  const updateStackFromSummary = useCallback(
    (stackSummary, apiStackPointer) => {
      const pointer = Number(apiStackPointer) || 0;
      const safeStackSize =
        Number(stackSize) > 0 ? Number(stackSize) : DEFAULT_STACK_SIZE;

      const updatedStack = createEmptyStack(safeStackSize);

      if (stackSummary) {
        Object.entries(stackSummary).forEach(([index, value]) => {
          const stackIndex = Number(index);

          /*
            Backend StackPointer points to next empty position.
            Active values are indexes less than StackPointer.
            This hides old popped values.
          */
          if (
            stackIndex >= 0 &&
            stackIndex < updatedStack.length &&
            stackIndex < pointer
          ) {
            updatedStack[stackIndex] = String(value);
          }
        });
      }

      setStackValues(updatedStack);
    },
    [stackSize]
  );

  const updateStackFromArray = useCallback(
    (stackArray, apiStackPointer) => {
      if (!Array.isArray(stackArray)) return;

      const pointer = Number(apiStackPointer) || 0;
      const safeStackSize =
        Number(stackSize) > 0 ? Number(stackSize) : DEFAULT_STACK_SIZE;

      const updatedStack = createEmptyStack(safeStackSize);

      stackArray.forEach((value, index) => {
        if (
          index >= 0 &&
          index < updatedStack.length &&
          index < pointer &&
          Number(value) !== 0
        ) {
          updatedStack[index] = String(value);
        }
      });

      setStackValues(updatedStack);
    },
    [stackSize]
  );

  const updateMemoryFromExecutionResult = useCallback(
    (executionResult) => {
      if (!executionResult) return;

      setLatestExecutionResult(executionResult);

      const details =
        executionResult.InstructionDetails ||
        executionResult.instructionDetails ||
        [];

      updateInstructionDetailsInMemory(details);

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

      const apiStackPointer =
        executionResult.StackPointer ??
        executionResult.stackPointer ??
        0;

      setStackPointer(Number(apiStackPointer) || 0);

      const stackSummary =
        executionResult.StackSummary ||
        executionResult.stackSummary ||
        null;

      const stackArray =
        executionResult.Stack ||
        executionResult.stack ||
        executionResult.stackArray ||
        null;

      if (stackSummary) {
        updateStackFromSummary(stackSummary, apiStackPointer);
      } else if (stackArray) {
        updateStackFromArray(stackArray, apiStackPointer);
      } else {
        updateStackFromSummary(null, apiStackPointer);
      }
    },
    [
      updateInstructionDetailsInMemory,
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
      stackSize,

      memoryBits,
      stackValues,
      stackPointer,

      instructionDetails,
      latestExecutionResult,

      initializeMemory,
      clearMemory,
      updateMemoryFromSummary,
      updateMemoryFromExecutionResult,
    }),
    [
      selectedArchitecture,
      memorySize,
      stackSize,
      memoryBits,
      stackValues,
      stackPointer,
      instructionDetails,
      latestExecutionResult,
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