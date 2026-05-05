export const DEFAULT_FLAG_REGISTERS = [
  { name: "Zero" },
  { name: "Carry" },
  { name: "Sign" },
  { name: "Overflow" },
];

const normalizeFlagValue = (value) => {
  if (value === true) return 1;
  if (value === false) return 0;
  return value ?? 0;
};

const getFlagName = (flag, index) => {
  return (
    flag?.name ||
    flag?.Name ||
    flag?.FlagName ||
    flag?.flagName ||
    flag?.FlagRegisterName ||
    flag?.flagRegisterName ||
    flag?.RegisterName ||
    flag?.registerName ||
    DEFAULT_FLAG_REGISTERS[index]?.name ||
    `Flag ${index + 1}`
  );
};

export const buildDisplayFlags = (userFlagRegisters = [], apiFlags = []) => {
  const hasUserFlags =
    Array.isArray(userFlagRegisters) && userFlagRegisters.length > 0;

  const flagSource = hasUserFlags
    ? userFlagRegisters
    : DEFAULT_FLAG_REGISTERS;

  return flagSource.map((flag, index) => {
    const name = getFlagName(flag, index);

    let value = 0;

    // Case 1: API flags array me aayein: [0, 1, 0, 0]
    if (Array.isArray(apiFlags)) {
      value = normalizeFlagValue(apiFlags[index]);
    }

    // Case 2: API flags object me aayein: { Zero: 1, Carry: 0 }
    else if (apiFlags && typeof apiFlags === "object") {
      value = normalizeFlagValue(
        apiFlags[name] ??
          apiFlags[name.toLowerCase()] ??
          apiFlags[flag?.symbol] ??
          apiFlags[flag?.Symbol] ??
          apiFlags[index]
      );
    }

    return {
      name,
      value,
    };
  });
};