import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  getArchitectureDetails,
  updateFullArchitecture,
} from "../api/architectureApi";

const emptyRegister = {
  RegisterID: null,
  Name: "",
  Action: "",
  IsFlagRegister: 0,
};

const emptyAddressing = {
  AddressingModeID: null,
  AddressingModeName: "",
  AddressingModeCode: "",
  AddressingModeSymbol: "",
};

const emptyInstruction = {
  InstructionID: null,
  isInterrupt: false,
  Opcode: "",
  Mnemonics: "",
  NumberOfOperands: 1,
  DestinationOperand: 1,
  InstructionFormat: 0,
  Action: "",
  InterruptSymbol: "",
  InputRegister: "",
  OutputRegister: "",
  _openedDropdown: null,
  operands: [
    {
      name: "Operand 1",
      type: "Register",
      isDestination: true,
    },
  ],
};

const operandTypeOptions = ["Register", "Immediate", "Memory"];
const interruptSymbolOptions = ["1 (Input)", "2 (Output)"];
const addressingModeOptions = [
  "Direct Addressing Mode",
  "Indirect Addressing Mode",
  "Indexed Addressing Mode",
];
const addressingModeCodeOptions = ["00", "01", "10", "11"];

const normalizeRegister = (reg) => ({
  ...emptyRegister,
  ...reg,
  RegisterID: reg?.RegisterID || reg?.registerID || null,
  Name: reg?.Name || reg?.name || "",
  Action: reg?.Action || reg?.action || "",
  IsFlagRegister:
    reg?.IsFlagRegister ??
    reg?.isFlagRegister ??
    reg?.isflagregister ??
    reg?.IsFlag ??
    reg?.isFlag ??
    0,
});

const isFlagRegister = (reg) => {
  const isFlag =
    reg?.IsFlagRegister ??
    reg?.isFlagRegister ??
    reg?.isflagregister ??
    reg?.IsFlag ??
    reg?.isFlag;

  if (isFlag !== undefined && isFlag !== null) {
    return isFlag === true || isFlag === 1 || isFlag === "1";
  }

  const action = String(reg?.Action || reg?.action || "").trim();
  return action.length > 0;
};

const normalizeAddressing = (mode) => ({
  ...emptyAddressing,
  ...mode,
  AddressingModeID: mode?.AddressingModeID || mode?.addressingModeID || null,
  AddressingModeName:
    mode?.AddressingModeName || mode?.addressingModeName || mode?.mode || "",
  AddressingModeCode:
    mode?.AddressingModeCode || mode?.addressingModeCode || mode?.code || "",
  AddressingModeSymbol:
    mode?.AddressingModeSymbol ||
    mode?.addressingModeSymbol ||
    mode?.symbol ||
    "",
});

const normalizeInterruptSymbol = (value) => {
  const symbol = String(value || "").trim();

  if (symbol === "1") return "1 (Input)";
  if (symbol === "2") return "2 (Output)";

  return symbol;
};

const CustomDropdown = ({
  value,
  placeholder,
  options,
  open,
  onToggle,
  onSelect,
  wrapperStyle,
  boxStyle,
  listStyle,
}) => {
  return (
    <View style={[styles.dropdownWrapper, wrapperStyle]}>
      <TouchableOpacity
        style={[styles.dropdownBox, boxStyle]}
        onPress={onToggle}
      >
        <Text
          style={[
            styles.dropdownText,
            !value ? styles.dropdownPlaceholder : null,
          ]}
        >
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>⌄</Text>
      </TouchableOpacity>

      {open ? (
        <View style={[styles.dropdownList, listStyle]}>
          {options.length === 0 ? (
            <Text style={styles.dropdownItemText}>No data found</Text>
          ) : (
            options.map((item, index) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={styles.dropdownItem}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
};

const CardHeader = ({ title, onPlusPress }) => (
  <>
    <View style={styles.cardTitleRow}>
      <Text style={styles.cardTitle}>{title}</Text>

      {onPlusPress ? (
        <TouchableOpacity style={styles.cardPlusButton} onPress={onPlusPress}>
          <Text style={styles.cardPlusText}>+</Text>
        </TouchableOpacity>
      ) : null}
    </View>
    <View style={styles.divider} />
  </>
);

const SectionHeader = ({ title, onPlusPress }) => (
  <View style={styles.sectionHeaderRow}>
    <Text style={styles.sectionText}>{title}</Text>

    {onPlusPress ? (
      <TouchableOpacity style={styles.sectionPlusButton} onPress={onPlusPress}>
        <Text style={styles.sectionPlusText}>+</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const AllDataModal = ({ visible, fieldName, onOk }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onOk}>
    <View style={styles.modalOverlay}>
      <View style={styles.alertBox}>
        <Text style={styles.alertTitle}>All {fieldName} Data Fetched</Text>
        

        <TouchableOpacity style={styles.alertButton} onPress={onOk}>
          <Text style={styles.alertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const UpdateArchitectureScreen = ({ route, navigation }) => {
  const architectureId =
    route?.params?.architectureId ||
    route?.params?.architectureData?.ArchitectureID ||
    route?.params?.architectureData?.architectureId ||
    route?.params?.architectureData?.id;

  const modalActionRef = useRef(null);
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [architectureData, setArchitectureData] = useState(null);

  const [allDataModal, setAllDataModal] = useState({
    visible: false,
    fieldName: "",
  });

  const [cpuData, setCpuData] = useState({
    ArchitectureID: "",
    Name: "",
    MemorySize: "",
    BusSize: "",
    StackSize: "",
    NumberOfRegisters: "",
    NumberOfInstructions: "",
  });

  const [flagRegisterList, setFlagRegisterList] = useState([]);
  const [flagRegister, setFlagRegister] = useState(emptyRegister);
  const [flagRegIndex, setFlagRegIndex] = useState(0);

  const [registerList, setRegisterList] = useState([]);
  const [addressingModes, setAddressingModes] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const [currentRegister, setCurrentRegister] = useState(emptyRegister);
  const [currentAddressing, setCurrentAddressing] = useState(emptyAddressing);
  const [currentInstruction, setCurrentInstruction] = useState(emptyInstruction);

  const [regIndex, setRegIndex] = useState(0);
  const [addressingIndex, setAddressingIndex] = useState(0);
  const [instIndex, setInstIndex] = useState(0);

  const gpRegisterOptions = registerList
    .map((reg) => reg.Name)
    .filter((name) => String(name || "").trim().length > 0);

  const openedDropdown = currentInstruction?._openedDropdown || null;

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const showAllDataFetchedAlert = (fieldName, onOk) => {
    modalActionRef.current = onOk;
    setAllDataModal({
      visible: true,
      fieldName,
    });
  };

  const closeAllDataModal = () => {
    const action = modalActionRef.current;
    modalActionRef.current = null;

    setAllDataModal({
      visible: false,
      fieldName: "",
    });

    if (typeof action === "function") {
      setTimeout(action, 100);
    }
  };

  const toggleDropdown = (dropdownName) => {
    setCurrentInstruction((prev) => ({
      ...prev,
      _openedDropdown:
        prev._openedDropdown === dropdownName ? null : dropdownName,
    }));
  };

  const normalizeInstruction = (instruction) => {
    const numberOfOperands = Number(
      instruction?.NumberOfOperands || instruction?.numberOfOperands || 0
    );

    const destinationOperand = Number(
      instruction?.DestinationOperand || instruction?.destinationOperand || 0
    );

    const isInterrupt =
      numberOfOperands === 0 ||
      !!instruction?.InterruptSymbol ||
      !!instruction?.interruptSymbol ||
      !!instruction?.InputRegister ||
      !!instruction?.inputRegister ||
      !!instruction?.OutputRegister ||
      !!instruction?.outputRegister;

    const operands =
      numberOfOperands > 0
        ? Array.from({ length: numberOfOperands }, (_, index) => ({
          name: `Operand ${index + 1}`,
          type: instruction?.operands?.[index]?.type || "Register",
          isDestination: destinationOperand === index + 1,
        }))
        : emptyInstruction.operands;

    return {
      ...emptyInstruction,
      ...instruction,
      isInterrupt,
      InstructionID:
        instruction?.InstructionID || instruction?.instructionID || null,
      Opcode: instruction?.Opcode || instruction?.opcode || "",
      Mnemonics:
        instruction?.Mnemonics ||
        instruction?.mnemonics ||
        instruction?.Mnemonic ||
        instruction?.mnemonic ||
        "",
      NumberOfOperands: numberOfOperands,
      DestinationOperand: destinationOperand,
      InstructionFormat:
        instruction?.InstructionFormat || instruction?.instructionFormat || 0,
      Action: instruction?.Action || instruction?.action || "",
      InterruptSymbol: normalizeInterruptSymbol(
        instruction?.InterruptSymbol || instruction?.interruptSymbol || ""
      ),
      InputRegister:
        instruction?.InputRegister || instruction?.inputRegister || "",
      OutputRegister:
        instruction?.OutputRegister || instruction?.outputRegister || "",
      _openedDropdown: null,
      operands,
    };
  };

  const fillFormFromApi = (data) => {
    const architecture =
      data?.Architecture ||
      data?.architecture ||
      data?.data?.Architecture ||
      data?.data?.architecture ||
      {};

    const registersRaw =
      data?.Registers ||
      data?.registers ||
      data?.data?.Registers ||
      data?.data?.registers ||
      [];

    const modesRaw =
      data?.AddressingModes ||
      data?.addressingModes ||
      data?.data?.AddressingModes ||
      data?.data?.addressingModes ||
      [];

    const apiInstructions =
      data?.Instructions ||
      data?.instructions ||
      data?.data?.Instructions ||
      data?.data?.instructions ||
      [];

    const allRegisters = registersRaw.map(normalizeRegister);

    const flagRegisters = allRegisters.filter(isFlagRegister);
    const gpRegisters = allRegisters.filter((reg) => !isFlagRegister(reg));

    const normalizedModes = modesRaw.map(normalizeAddressing);
    const normalizedInstructions = apiInstructions.map(normalizeInstruction);

    setCpuData({
      ArchitectureID: String(architecture.ArchitectureID || architectureId),
      Name: architecture.Name || architecture.name || "",
      MemorySize: String(
        architecture.MemorySize || architecture.memorySize || ""
      ),
      BusSize: String(architecture.BusSize || architecture.busSize || ""),
      StackSize: String(architecture.StackSize || architecture.stackSize || ""),
      NumberOfRegisters: String(
        architecture.NumberOfRegisters ||
        architecture.numberOfRegisters ||
        allRegisters.length ||
        ""
      ),
      NumberOfInstructions: String(
        architecture.NumberOfInstructions ||
        architecture.numberOfInstructions ||
        normalizedInstructions.length ||
        ""
      ),
    });

    setFlagRegisterList(flagRegisters);
    setFlagRegister(flagRegisters[0] || emptyRegister);
    setFlagRegIndex(0);

    setRegisterList(gpRegisters);
    setCurrentRegister(gpRegisters[0] || emptyRegister);
    setRegIndex(0);

    setAddressingModes(normalizedModes);
    setCurrentAddressing(normalizedModes[0] || emptyAddressing);
    setAddressingIndex(0);

    setInstructions(normalizedInstructions);
    setCurrentInstruction(normalizedInstructions[0] || emptyInstruction);
    setInstIndex(0);
  };

  useEffect(() => {
    let isMounted = true;

    const loadArchitecture = async () => {
      try {
        setLoading(true);

        if (!architectureId) {
          Alert.alert("Error", "Architecture ID not found");
          return;
        }

        const data = await getArchitectureDetails(architectureId);

        const architecture =
          data?.Architecture ||
          data?.architecture ||
          data?.data?.Architecture ||
          data?.data?.architecture;

        if (!architecture) {
          console.log("INVALID ARCHITECTURE RESPONSE:", JSON.stringify(data));
          Alert.alert("Error", "Invalid architecture response");
          return;
        }

        if (isMounted) {
          setArchitectureData(data);
          fillFormFromApi(data);
        }
      } catch (error) {
        console.log("UPDATE SCREEN LOAD ERROR:", error);
        Alert.alert("Error", error?.message || "Failed to load architecture");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadArchitecture();

    return () => {
      isMounted = false;
    };
  }, [architectureId]);

  const saveCpuData = () => {
    Alert.alert("Saved");
  };

  const updateCounts = (flags = flagRegisterList, registers = registerList, instructionList = instructions) => {
    setCpuData((prev) => ({
      ...prev,
      NumberOfRegisters: String(flags.length + registers.length),
      NumberOfInstructions: String(instructionList.length),
    }));
  };

  const saveCurrentFlagToList = () => {
    if (!flagRegister?.Name?.trim()) return flagRegisterList;

    const updated = [...flagRegisterList];

    const flagData = {
      ...flagRegister,
      RegisterID: flagRegister.RegisterID || flagRegister.registerID || 0,
      IsFlagRegister: 1,
      Action: flagRegister.Action || "",
    };

    if (updated[flagRegIndex]) {
      updated[flagRegIndex] = flagData;
    } else {
      updated.push(flagData);
    }

    setFlagRegisterList(updated);
    updateCounts(updated, registerList, instructions);
    return updated;
  };

  const nextFlagRegister = () => {
    if (flagRegIndex >= flagRegisterList.length) {
      if (flagRegister?.Name?.trim()) {
        Alert.alert("Info", "New flag register Added");
      } else if (flagRegisterList.length > 0) {
        setFlagRegIndex(0);
        setFlagRegister(flagRegisterList[0]);
      }
      return;
    }

    const savedList = saveCurrentFlagToList();

    if (savedList.length === 0) return;

    if (flagRegIndex === savedList.length - 1) {
      showAllDataFetchedAlert("flag register", () => {
        setFlagRegIndex(0);
        setFlagRegister(savedList[0]);
      });
      return;
    }

    const next = flagRegIndex + 1;
    setFlagRegIndex(next);
    setFlagRegister(savedList[next]);
  };

  const addFlagRegister = () => {
    if (!flagRegister?.Name?.trim()) {
      Alert.alert("Validation", "Please enter flag register name first.");
      return;
    }

    const savedList = saveCurrentFlagToList();

    setFlagRegister(emptyRegister);
    setFlagRegIndex(savedList.length);
    Alert.alert("Saved");
  };

  const openNewFlagRegister = () => {
    setFlagRegister(emptyRegister);
    setFlagRegIndex(flagRegisterList.length);
  };

  const saveCurrentRegisterToList = () => {
    if (!currentRegister?.Name?.trim()) return registerList;

    const updated = [...registerList];

    const gpData = {
      ...currentRegister,
      IsFlagRegister: 0,
      Action: "",
    };

    if (updated[regIndex]) {
      updated[regIndex] = gpData;
    } else {
      updated.push(gpData);
    }

    setRegisterList(updated);
    updateCounts(flagRegisterList, updated, instructions);
    return updated;
  };

  const nextRegister = () => {
    if (regIndex >= registerList.length) {
      if (currentRegister?.Name?.trim()) {
        Alert.alert("Info", "New register Added");
      } else if (registerList.length > 0) {
        setRegIndex(0);
        setCurrentRegister(registerList[0]);
      }
      return;
    }

    const savedList = saveCurrentRegisterToList();

    if (savedList.length === 0) return;

    if (regIndex === savedList.length - 1) {
      showAllDataFetchedAlert("general purpose register", () => {
        setRegIndex(0);
        setCurrentRegister(savedList[0]);
      });
      return;
    }

    const next = regIndex + 1;
    setRegIndex(next);
    setCurrentRegister(savedList[next]);
  };

  const addRegister = () => {
    if (!currentRegister?.Name?.trim()) {
      Alert.alert("Validation", "Please enter register name first.");
      return;
    }

    const savedList = saveCurrentRegisterToList();

    setCurrentRegister(emptyRegister);
    setRegIndex(savedList.length);
    Alert.alert("Saved");
  };

  const openNewRegister = () => {
    setCurrentRegister(emptyRegister);
    setRegIndex(registerList.length);
  };

  const saveCurrentAddressingToList = () => {
    if (!currentAddressing?.AddressingModeName?.trim()) return addressingModes;

    const updated = [...addressingModes];

    if (updated[addressingIndex]) {
      updated[addressingIndex] = currentAddressing;
    } else {
      updated.push(currentAddressing);
    }

    setAddressingModes(updated);
    return updated;
  };

  const nextAddressing = () => {
    if (addressingIndex >= addressingModes.length) {
      if (currentAddressing?.AddressingModeName?.trim()) {
        Alert.alert("Info", "New addressing mode Added");
      } else if (addressingModes.length > 0) {
        setAddressingIndex(0);
        setCurrentAddressing(addressingModes[0]);
      }
      return;
    }

    const savedList = saveCurrentAddressingToList();

    if (savedList.length === 0) return;

    if (addressingIndex === savedList.length - 1) {
      showAllDataFetchedAlert("addressing mode", () => {
        setAddressingIndex(0);
        setCurrentAddressing(savedList[0]);
      });
      return;
    }

    const next = addressingIndex + 1;
    setAddressingIndex(next);
    setCurrentAddressing(savedList[next]);
  };

  const addAddressing = () => {
    if (!currentAddressing?.AddressingModeName?.trim()) {
      Alert.alert("Validation", "Please enter addressing mode name first.");
      return;
    }

    const savedList = saveCurrentAddressingToList();

    setCurrentAddressing(emptyAddressing);
    setAddressingIndex(savedList.length);
    Alert.alert("Saved");
  };

  const openNewAddressing = () => {
    setCurrentAddressing(emptyAddressing);
    setAddressingIndex(addressingModes.length);
  };

  const toggleInterruptInstruction = () => {
    const checked = !currentInstruction.isInterrupt;

    setCurrentInstruction({
      ...currentInstruction,
      _openedDropdown: null,
      isInterrupt: checked,
      NumberOfOperands: checked
        ? 0
        : currentInstruction.operands?.length || 1,
      DestinationOperand: checked ? 0 : 1,
      InterruptSymbol: checked ? currentInstruction.InterruptSymbol || "" : "",
      InputRegister: checked ? currentInstruction.InputRegister || "" : "",
      OutputRegister: checked ? currentInstruction.OutputRegister || "" : "",
      operands:
        currentInstruction.operands?.length > 0
          ? currentInstruction.operands
          : emptyInstruction.operands,
    });
  };

  const updateInstructionOperand = (index, key, value) => {
    const updatedOperands = [...currentInstruction.operands];

    if (key === "isDestination") {
      const resetOperands = updatedOperands.map((item, itemIndex) => ({
        ...item,
        isDestination: itemIndex === index,
      }));

      setCurrentInstruction({
        ...currentInstruction,
        operands: resetOperands,
        DestinationOperand: index + 1,
        _openedDropdown: null,
      });

      return;
    }

    updatedOperands[index] = {
      ...updatedOperands[index],
      [key]: value,
    };

    setCurrentInstruction({
      ...currentInstruction,
      operands: updatedOperands,
      NumberOfOperands: updatedOperands.length,
      _openedDropdown: null,
    });
  };

  const addOperand = () => {
    const updatedOperands = [
      ...currentInstruction.operands,
      {
        name: `Operand ${currentInstruction.operands.length + 1}`,
        type: "Register",
        isDestination: false,
      },
    ];

    setCurrentInstruction({
      ...currentInstruction,
      operands: updatedOperands,
      NumberOfOperands: updatedOperands.length,
      _openedDropdown: null,
    });
  };

  const getFinalCurrentInstruction = () => {
    const isInterrupt = currentInstruction.isInterrupt;

    const destinationIndex = currentInstruction.operands.findIndex(
      (op) => op.isDestination
    );

    return {
      ...currentInstruction,
      ArchitectureID: Number(architectureId),
      NumberOfOperands: isInterrupt ? 0 : currentInstruction.operands.length,
      DestinationOperand: isInterrupt ? 0 : destinationIndex + 1,
      InstructionFormat: currentInstruction.InstructionFormat || 0,
      InterruptSymbol: isInterrupt ? currentInstruction.InterruptSymbol : null,
      InputRegister: isInterrupt ? currentInstruction.InputRegister : null,
      OutputRegister: isInterrupt ? currentInstruction.OutputRegister : null,
      _openedDropdown: null,
    };
  };

  const saveCurrentInstructionToList = () => {
    if (!currentInstruction?.Opcode?.trim()) return instructions;

    const finalInstruction = getFinalCurrentInstruction();
    const updated = [...instructions];

    if (updated[instIndex]) {
      updated[instIndex] = finalInstruction;
    } else {
      updated.push(finalInstruction);
    }

    setInstructions(updated);
    updateCounts(flagRegisterList, registerList, updated);
    return updated;
  };

  const nextInstruction = () => {
    if (instIndex >= instructions.length) {
      if (currentInstruction?.Opcode?.trim()) {
        // Alert.alert("Info", "The new instruction ko list mein save karne ke liye ADD press karein.");
      } else if (instructions.length > 0) {
        setInstIndex(0);
        setCurrentInstruction({
          ...instructions[0],
          _openedDropdown: null,
        });
      }
      return;
    }

    const savedList = saveCurrentInstructionToList();

    if (savedList.length === 0) return;

    if (instIndex === savedList.length - 1) {
      showAllDataFetchedAlert("instruction", () => {
        setInstIndex(0);
        setCurrentInstruction({
          ...savedList[0],
          _openedDropdown: null,
        });
      });
      return;
    }

    const next = instIndex + 1;
    setInstIndex(next);
    setCurrentInstruction({
      ...savedList[next],
      _openedDropdown: null,
    });
  };

  const addInstruction = () => {
    if (!currentInstruction?.Opcode?.trim()) {
      Alert.alert("Validation", "Please enter instruction opcode first.");
      return;
    }

    const savedList = saveCurrentInstructionToList();

    setCurrentInstruction(emptyInstruction);
    setInstIndex(savedList.length);
    Alert.alert("Saved", "Instruction Added.");
  };

  const openNewInstruction = () => {
    setCurrentInstruction(emptyInstruction);
    setInstIndex(instructions.length);
  };

  const handleFinalUpdate = async () => {
    try {
      setSaving(true);

      const latestFlags = saveCurrentFlagToList();
      const latestRegisters = saveCurrentRegisterToList();
      const latestAddressingModes = saveCurrentAddressingToList();
      const latestInstructions = saveCurrentInstructionToList();

      const architecturePayload = {
        ArchitectureID: Number(cpuData.ArchitectureID || architectureId),
        Name: cpuData.Name,
        MemorySize: Number(cpuData.MemorySize),
        StackSize: Number(cpuData.StackSize),
        BusSize: Number(cpuData.BusSize),
        NumberOfRegisters:
          Number(cpuData.NumberOfRegisters) ||
          latestFlags.length + latestRegisters.length,
        NumberOfInstructions:
          Number(cpuData.NumberOfInstructions) || latestInstructions.length,
      };

      const registersPayload = [
        ...latestFlags.map((reg) => ({
          ...reg,
          RegisterID: reg.RegisterID || reg.registerID || 0,
          ArchitectureID: Number(architectureId),
          RegisterSize: Number(cpuData.BusSize),
          Name: reg.Name,
          Action: reg.Action || "",
          IsFlagRegister: 1,
        })),

        ...latestRegisters.map((reg) => ({
          ...reg,
          RegisterID: reg.RegisterID || reg.registerID || 0,
          ArchitectureID: Number(architectureId),
          RegisterSize: Number(cpuData.BusSize),
          Name: reg.Name,
          Action: "",
          IsFlagRegister: 0,
        })),
      ].filter((reg) => reg?.Name?.trim());

      const instructionsPayload = latestInstructions
        .filter((ins) => ins?.Opcode?.trim() && ins?.Mnemonics?.trim())
        .map((ins) => {
          const isInterrupt = ins.isInterrupt;
          const destinationIndex = ins.operands?.findIndex(
            (op) => op.isDestination
          );

          return {
            InstructionID: ins.InstructionID || 0,
            ArchitectureID: Number(architectureId),
            Mnemonics: ins.Mnemonics,
            Opcode: ins.Opcode,
            NumberOfOperands: isInterrupt ? 0 : ins.operands?.length || 0,
            DestinationOperand: isInterrupt ? 0 : destinationIndex + 1,
            Action: ins.Action || "",
            InstructionFormat: ins.InstructionFormat || 0,
            InterruptSymbol: isInterrupt ? ins.InterruptSymbol || null : null,
            InputRegister: isInterrupt ? ins.InputRegister || null : null,
            OutputRegister: isInterrupt ? ins.OutputRegister || null : null,
          };
        });

      const addressingPayload = latestAddressingModes
        .filter((mode) => mode?.AddressingModeName?.trim())
        .map((mode) => ({
          ...mode,
          ArchitectureID: Number(architectureId),
          AddressingModeName: mode.AddressingModeName,
          AddressingModeCode: mode.AddressingModeCode,
          AddressingModeSymbol: mode.AddressingModeSymbol || "",
        }));

      const payload = {
        Architecture: architecturePayload,
        Registers: registersPayload,
        Instructions: instructionsPayload,
        AddressingModes: addressingPayload,
      };

      console.log("FINAL UPDATE PAYLOAD:", JSON.stringify(payload, null, 2));

      await updateFullArchitecture(architectureId, payload);

      Alert.alert("Success", "Architecture Updated Successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (navigation?.goBack) {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error) {
      console.log("FINAL UPDATE ERROR:", error);
      Alert.alert("Error", error?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#233F99" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!architectureData) {
    return (
      <View style={styles.loader}>
        <Text>No architecture data found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
      <AllDataModal
        visible={allDataModal.visible}
        fieldName={allDataModal.fieldName}
        onOk={closeAllDataModal}
      />

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Edit Architecture</Text>

        <View style={styles.headerRightSpace} />
      </View>

      <View style={styles.card}>
        <CardHeader title="CPU Design Configuration" />

        <Text style={styles.label}>Architecture Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter architecture name"
          placeholderTextColor="#8A9AB0"
          value={cpuData.Name}
          onChangeText={(text) => setCpuData({ ...cpuData, Name: text })}
        />

        <Text style={styles.label}>Memory Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 64 B"
          placeholderTextColor="#8A9AB0"
          value={cpuData.MemorySize}
          keyboardType="numeric"
          onChangeText={(text) =>
            setCpuData({ ...cpuData, MemorySize: text })
          }
        />

        <Text style={styles.label}>Bus Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 32-bit"
          placeholderTextColor="#8A9AB0"
          value={cpuData.BusSize}
          keyboardType="numeric"
          onChangeText={(text) => setCpuData({ ...cpuData, BusSize: text })}
        />

        <Text style={styles.label}>Stack Size</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 16 B"
          placeholderTextColor="#8A9AB0"
          value={cpuData.StackSize}
          keyboardType="numeric"
          onChangeText={(text) =>
            setCpuData({ ...cpuData, StackSize: text })
          }
        />

        <Text style={styles.label}>No of Registers</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number"
          placeholderTextColor="#8A9AB0"
          value={cpuData.NumberOfRegisters}
          keyboardType="numeric"
          onChangeText={(text) =>
            setCpuData({ ...cpuData, NumberOfRegisters: text })
          }
        />

        <Text style={styles.label}>No of Instructions</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number"
          placeholderTextColor="#8A9AB0"
          value={cpuData.NumberOfInstructions}
          keyboardType="numeric"
          onChangeText={(text) =>
            setCpuData({ ...cpuData, NumberOfInstructions: text })
          }
        />

        <TouchableOpacity style={styles.fullButton} onPress={saveCpuData}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <CardHeader title="Register Design Configuration" />


        {/* +(Plus Button to add new Falg Register) */}
        <SectionHeader title="Flag Register" />
         {/* <SectionHeader title="Flag Register" onPlusPress={openNewFlagRegister} />  */}

        <Text style={styles.label}>Flag Register Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          placeholderTextColor="#8A9AB0"
          value={flagRegister.Name}
          onChangeText={(text) =>
            setFlagRegister({ ...flagRegister, Name: text })
          }
        />

        <Text style={styles.label}>Flag Register Action</Text>
        <TextInput
          style={styles.textArea}
          placeholder="// Write Java Code Here"
          placeholderTextColor="#8A9AB0"
          value={flagRegister.Action || ""}
          multiline
          textAlignVertical="top"
          onChangeText={(text) =>
            setFlagRegister({ ...flagRegister, Action: text })
          }
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.halfButton} onPress={nextFlagRegister}>
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.halfButton} onPress={addFlagRegister}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerLarge} />
        <SectionHeader title="General Purpose Register" />
        {/* +(Plus Button to add new General Purpose Register) */}

        {/* <SectionHeader title="General Purpose Register" onPlusPress={openNewRegister} /> */}

        <Text style={styles.label}>GP Register Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          placeholderTextColor="#8A9AB0"
          value={currentRegister.Name || ""}
          onChangeText={(text) =>
            setCurrentRegister({ ...currentRegister, Name: text })
          }
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.halfButton} onPress={nextRegister}>
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.halfButton} onPress={addRegister}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        {/* +(Plus Button to add new Addressing Mode) */}
        <SectionHeader title="Addressing Modes" />
        {/* <CardHeader title="Addressing Modes" onPlusPress={openNewAddressing} /> */}

        <Text style={styles.label}>Addressing Mode</Text>
        <CustomDropdown
          placeholder="Select addressing mode"
          value={currentAddressing.AddressingModeName || ""}
          options={addressingModeOptions}
          open={openedDropdown === "addressingMode"}
          onToggle={() => toggleDropdown("addressingMode")}
          onSelect={(value) => {
            setCurrentAddressing({
              ...currentAddressing,
              AddressingModeName: value,
            });

            setCurrentInstruction((prev) => ({
              ...prev,
              _openedDropdown: null,
            }));
          }}
        />

        <Text style={styles.label}>Mode Code</Text>
        <CustomDropdown
          placeholder="Select Code"
          value={currentAddressing.AddressingModeCode || ""}
          options={addressingModeCodeOptions}
          open={openedDropdown === "addressingModeCode"}
          onToggle={() => toggleDropdown("addressingModeCode")}
          onSelect={(value) => {
            setCurrentAddressing({
              ...currentAddressing,
              AddressingModeCode: value,
            });

            setCurrentInstruction((prev) => ({
              ...prev,
              _openedDropdown: null,
            }));
          }}
        />

        <Text style={styles.label}>Symbol</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Symbol"
          placeholderTextColor="#8A9AB0"
          value={currentAddressing.AddressingModeSymbol || ""}
          onChangeText={(text) =>
            setCurrentAddressing({
              ...currentAddressing,
              AddressingModeSymbol: text,
            })
          }
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.halfButton} onPress={nextAddressing}>
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.halfButton} onPress={addAddressing}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>

        {/* +(Plus Button to add new Instruction) */}
        <CardHeader title="Instruction Design Configuration" />
        {/* <CardHeader title="Instruction Design Configuration" onPlusPress={openNewInstruction} /> */}

        <TouchableOpacity
          style={styles.checkboxBox}
          onPress={toggleInterruptInstruction}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.checkbox,
              currentInstruction.isInterrupt && styles.checkboxChecked,
            ]}
          >
            {currentInstruction.isInterrupt ? (
              <Text style={styles.checkText}>✓</Text>
            ) : null}
          </View>

          <Text style={styles.checkboxLabel}>Is Interrupt Instruction?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>OpCode</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 01"
          placeholderTextColor="#8A9AB0"
          value={currentInstruction.Opcode || ""}
          onChangeText={(text) =>
            setCurrentInstruction({ ...currentInstruction, Opcode: text })
          }
        />

        <Text style={styles.label}>Mnemonic</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ADD"
          placeholderTextColor="#8A9AB0"
          value={currentInstruction.Mnemonics || ""}
          onChangeText={(text) =>
            setCurrentInstruction({ ...currentInstruction, Mnemonics: text })
          }
        />

        {currentInstruction.isInterrupt ? (
          <View style={styles.innerCard}>
            <Text style={styles.label}>Interrupt Symbol</Text>
            <CustomDropdown
              placeholder="Select Symbol"
              value={currentInstruction.InterruptSymbol}
              options={interruptSymbolOptions}
              open={openedDropdown === "interruptSymbol"}
              onToggle={() => toggleDropdown("interruptSymbol")}
              onSelect={(value) =>
                setCurrentInstruction({
                  ...currentInstruction,
                  InterruptSymbol: value,
                  _openedDropdown: null,
                })
              }
            />

            <Text style={styles.label}>Input Register</Text>
            <CustomDropdown
              placeholder="Select Register"
              value={currentInstruction.InputRegister}
              options={gpRegisterOptions}
              open={openedDropdown === "inputRegister"}
              onToggle={() => toggleDropdown("inputRegister")}
              onSelect={(value) =>
                setCurrentInstruction({
                  ...currentInstruction,
                  InputRegister: value,
                  _openedDropdown: null,
                })
              }
            />

            <Text style={styles.label}>Output Register</Text>
            <CustomDropdown
              placeholder="Select Register"
              value={currentInstruction.OutputRegister}
              options={gpRegisterOptions}
              open={openedDropdown === "outputRegister"}
              onToggle={() => toggleDropdown("outputRegister")}
              onSelect={(value) =>
                setCurrentInstruction({
                  ...currentInstruction,
                  OutputRegister: value,
                  _openedDropdown: null,
                })
              }
            />
          </View>
        ) : (
          <View style={styles.operandCard}>
            <View style={styles.operandHeader}>
              <Text style={styles.operandTitle}>Operands</Text>
              <Text style={styles.operandTitle}>Destination</Text>
            </View>

            {currentInstruction.operands.map((operand, index) => {
              const operandDropdownName = `operandType-${index}`;

              return (
                <View
                  style={[
                    styles.operandRow,
                    { zIndex: openedDropdown === operandDropdownName ? 999 : 1 },
                  ]}
                  key={index}
                >
                  <Text style={styles.operandLabel}>{operand.name}</Text>

                  <CustomDropdown
                    placeholder="Register"
                    value={operand.type}
                    options={operandTypeOptions}
                    open={openedDropdown === operandDropdownName}
                    onToggle={() => toggleDropdown(operandDropdownName)}
                    onSelect={(value) =>
                      updateInstructionOperand(index, "type", value)
                    }
                    wrapperStyle={styles.operandDropdownWrapper}
                    boxStyle={styles.operandDropdownBox}
                    listStyle={styles.operandDropdownList}
                  />

                  <TouchableOpacity
                    style={styles.radioOuter}
                    onPress={() =>
                      updateInstructionOperand(index, "isDestination", true)
                    }
                  >
                    {operand.isDestination ? (
                      <View style={styles.radioInner} />
                    ) : null}
                  </TouchableOpacity>

                  {index === currentInstruction.operands.length - 1 ? (
                    <TouchableOpacity onPress={addOperand}>
                      <Text style={styles.plusText}>+</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.plusPlaceholder} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.label}>Instruction Action</Text>
        <TextInput
          style={styles.textArea}
          placeholder="// Write Java Code Here"
          placeholderTextColor="#8A9AB0"
          value={currentInstruction.Action || ""}
          multiline
          textAlignVertical="top"
          onFocus={scrollToBottom}
          onChangeText={(text) =>
            setCurrentInstruction({ ...currentInstruction, Action: text })
          }
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.halfButton} onPress={nextInstruction}>
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.halfButton} onPress={addInstruction}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.updateButton, saving && styles.disabledButton]}
        onPress={handleFinalUpdate}
        disabled={saving}
      >
        <Text style={styles.updateButtonText}>
          {saving ? "Updating..." : "Update Architecture"}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UpdateArchitectureScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#1E3A8A",
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 160,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#233F99",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },
  headerRightSpace: {
    width: 34,
    height: 34,
  },
  heading: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E3A8A",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E0E7F0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitleRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
    textAlign: "center",
  },
  cardPlusButton: {
    position: "absolute",
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#233F99",
    justifyContent: "center",
    alignItems: "center",
  },
  cardPlusText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  sectionHeaderRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionPlusButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#233F99",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionPlusText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#D7DEE9",
    marginTop: 8,
    marginBottom: 12,
  },
  dividerLarge: {
    height: 1,
    backgroundColor: "#D7DEE9",
    marginTop: 16,
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  label: {
    fontSize: 12,
    color: "#111827",
    marginTop: 8,
    marginBottom: 5,
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderColor: "#BFD0E5",
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    fontSize: 12,
    color: "#111827",
  },
  textArea: {
    height: 90,
    borderWidth: 1,
    borderColor: "#BFD0E5",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: "#F8FAFC",
    fontSize: 12,
    color: "#111827",
  },
  checkboxBox: {
    height: 42,
    borderWidth: 1,
    borderColor: "#D6E0EF",
    borderRadius: 4,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#BFD0E5",
    borderRadius: 3,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#111827",
  },
  innerCard: {
    borderWidth: 1,
    borderColor: "#D6E0EF",
    borderRadius: 4,
    backgroundColor: "#F8FAFC",
    padding: 10,
    marginTop: 10,
    overflow: "visible",
  },
  operandCard: {
    borderWidth: 1,
    borderColor: "#D6E0EF",
    borderRadius: 4,
    backgroundColor: "#F8FAFC",
    padding: 10,
    marginTop: 10,
    overflow: "visible",
  },
  operandHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  operandTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },
  operandRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    overflow: "visible",
  },
  operandLabel: {
    fontSize: 11,
    color: "#1E3A8A",
    width: 70,
    marginTop: 8,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#1E3A8A",
    borderRadius: 8,
    marginLeft: 12,
    marginTop: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 6,
    height: 6,
    backgroundColor: "#1E3A8A",
    borderRadius: 3,
  },
  plusText: {
    fontSize: 18,
    color: "#1E3A8A",
    marginLeft: 18,
    marginTop: 5,
    fontWeight: "500",
  },
  plusPlaceholder: {
    width: 28,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  halfButton: {
    width: "48%",
    height: 36,
    backgroundColor: "#233F99",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  fullButton: {
    height: 36,
    backgroundColor: "#233F99",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  updateButton: {
    height: 44,
    backgroundColor: "#233F99",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  dropdownWrapper: {
    position: "relative",
    marginBottom: 4,
  },
  dropdownBox: {
    height: 36,
    borderWidth: 1,
    borderColor: "#BFD0E5",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 12,
    color: "#111827",
  },
  dropdownPlaceholder: {
    color: "#8A9AB0",
  },
  dropdownArrow: {
    fontSize: 14,
    color: "#8A9AB0",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#BFD0E5",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginTop: 2,
    maxHeight: 130,
    overflow: "hidden",
    zIndex: 1000,
  },
  dropdownItem: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  dropdownItemText: {
    fontSize: 12,
    color: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  operandDropdownWrapper: {
    width: 90,
    zIndex: 999,
  },
  operandDropdownBox: {
    height: 34,
    paddingHorizontal: 8,
  },
  operandDropdownList: {
    position: "absolute",
    top: 36,
    left: 0,
    right: 0,
    zIndex: 2000,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
    marginBottom: 18,
  },
  alertButton: {
    height: 38,
    backgroundColor: "#233F99",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});