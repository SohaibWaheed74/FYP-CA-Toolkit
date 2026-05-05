import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getArchitectureDetails } from "../api/detailApi";

/* =======================
   DEFAULT FLAG REGISTERS
   Agar user flag create na kare
======================= */
const DEFAULT_FLAG_REGISTERS = [
  { name: "Zero" },
  { name: "Carry" },
  { name: "Sign" },
  { name: "Overflow" },
];

/* =======================
   FLAG HELPERS
======================= */
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

/*
  Backend updated flag order:
  Flags[0] = Carry
  Flags[1] = Overflow
  Flags[2] = Sign
  Flags[3] = Zero

  Display logic:
  - User custom flags hon to custom flags show honge.
  - User flags na hon to default flags show honge.
*/
const getBackendFlagValues = (apiFlags = []) => {
  let zero = 0;
  let carry = 0;
  let sign = 0;
  let overflow = 0;

  if (Array.isArray(apiFlags)) {
    carry = normalizeFlagValue(apiFlags[0]);
    overflow = normalizeFlagValue(apiFlags[1]);
    sign = normalizeFlagValue(apiFlags[2]);
    zero = normalizeFlagValue(apiFlags[3]);
  } else if (apiFlags && typeof apiFlags === "object") {
    carry = normalizeFlagValue(
      apiFlags.Carry ??
        apiFlags.carry ??
        apiFlags.C ??
        apiFlags.c ??
        apiFlags.CF ??
        apiFlags.cf ??
        apiFlags["0"] ??
        0
    );

    overflow = normalizeFlagValue(
      apiFlags.Overflow ??
        apiFlags.overflow ??
        apiFlags.O ??
        apiFlags.o ??
        apiFlags.OF ??
        apiFlags.of ??
        apiFlags["1"] ??
        0
    );

    sign = normalizeFlagValue(
      apiFlags.Sign ??
        apiFlags.sign ??
        apiFlags.Negative ??
        apiFlags.negative ??
        apiFlags.S ??
        apiFlags.s ??
        apiFlags.SF ??
        apiFlags.sf ??
        apiFlags.N ??
        apiFlags.n ??
        apiFlags["2"] ??
        0
    );

    zero = normalizeFlagValue(
      apiFlags.Zero ??
        apiFlags.zero ??
        apiFlags.Z ??
        apiFlags.z ??
        apiFlags.ZF ??
        apiFlags.zf ??
        apiFlags["3"] ??
        0
    );
  }

  return {
    zero,
    carry,
    sign,
    overflow,
  };
};

const getMappedFlagValueByName = (flagName, backendValues, apiFlags, index) => {
  const lowerName = String(flagName || "").toLowerCase();

  if (
    lowerName.includes("zero") ||
    lowerName === "z" ||
    lowerName === "zf"
  ) {
    return backendValues.zero;
  }

  if (
    lowerName.includes("carry") ||
    lowerName === "c" ||
    lowerName === "cf"
  ) {
    return backendValues.carry;
  }

  if (
    lowerName.includes("sign") ||
    lowerName.includes("negative") ||
    lowerName === "s" ||
    lowerName === "sf" ||
    lowerName === "n"
  ) {
    return backendValues.sign;
  }

  if (
    lowerName.includes("overflow") ||
    lowerName === "o" ||
    lowerName === "of"
  ) {
    return backendValues.overflow;
  }

  // Agar user custom unknown flag name rakhe,
  // to fallback ke liye backend array ka same index use kar lo.
  if (Array.isArray(apiFlags)) {
    return normalizeFlagValue(apiFlags[index]);
  }

  return 0;
};

const buildDisplayFlags = (userFlagRegisters = [], apiFlags = []) => {
  const hasUserFlags =
    Array.isArray(userFlagRegisters) && userFlagRegisters.length > 0;

  const flagsSource = hasUserFlags
    ? userFlagRegisters
    : DEFAULT_FLAG_REGISTERS;

  const backendValues = getBackendFlagValues(apiFlags);

  return flagsSource.map((flag, index) => {
    const flagName = getFlagName(flag, index);

    return {
      label: flagName,
      value: getMappedFlagValueByName(flagName, backendValues, apiFlags, index),
    };
  });
};

/* =======================
   REUSABLE REGISTER BOX
======================= */
const RegisterBox = ({ label, value }) => {
  return (
    <View style={styles.boxContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.45}
        >
          {value ?? 0}
        </Text>
      </View>
    </View>
  );
};

/* =======================
   MAIN SCREEN
======================= */
const RegisterVisualization = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const executionResult = route.params?.executionResult || {
    registers: [],
    flags: [],
    errors: [],
  };

  const architecture = route.params?.architecture;

  const architectureId =
    route.params?.architectureId ||
    architecture?.ArchitectureID ||
    architecture?.architectureID ||
    architecture?.id ||
    architecture?.architectureId;

  const [generalRegisters, setGeneralRegisters] = useState([]);
  const [flagRegisters, setFlagRegisters] = useState([]);

  const registersArray =
    executionResult.registers || executionResult.Registers || [];

  const flagsArray = executionResult.flags || executionResult.Flags || [];

  const errors = executionResult.errors || executionResult.Errors || [];

  useEffect(() => {
    fetchArchitectureDetailsForNames();
  }, [architectureId]);

  const fetchArchitectureDetailsForNames = async () => {
    try {
      if (!architectureId) return;

      const data = await getArchitectureDetails(architectureId);

      setGeneralRegisters(data?.generalRegisters || []);
      setFlagRegisters(data?.flagRegisters || []);

      console.log("REGISTER VISUALIZATION DETAILS:", {
        generalRegisters: data?.generalRegisters || [],
        flagRegisters: data?.flagRegisters || [],
      });
    } catch (err) {
      console.log("Register Visualization Details Fetch Error:", err);
    }
  };

  // =======================
  // DYNAMIC REGISTER / FLAG NAMES FROM DATABASE
  // =======================
  const routeRegisters = route.params?.registers || [];
  const routeFlags = route.params?.flags || [];

  const dbRegisters =
    Array.isArray(generalRegisters) && generalRegisters.length > 0
      ? generalRegisters
      : Array.isArray(routeRegisters) && routeRegisters.length > 0
      ? routeRegisters
      : architecture?.generalRegisters ||
        architecture?.GeneralRegisters ||
        architecture?.Registers ||
        architecture?.registers ||
        architecture?.ArchitectureRegisters ||
        architecture?.architectureRegisters ||
        [];

  const dbFlags =
    Array.isArray(flagRegisters) && flagRegisters.length > 0
      ? flagRegisters
      : Array.isArray(routeFlags) && routeFlags.length > 0
      ? routeFlags
      : architecture?.flagRegisters ||
        architecture?.FlagRegisters ||
        architecture?.Flags ||
        architecture?.flags ||
        architecture?.ArchitectureFlags ||
        architecture?.architectureFlags ||
        architecture?.ArchitectureFlagRegisters ||
        architecture?.architectureFlagRegisters ||
        [];

  const dynamicRegisters =
    Array.isArray(dbRegisters) && dbRegisters.length > 0
      ? dbRegisters.map((reg, index) => ({
          label:
            reg?.name ||
            reg?.Name ||
            reg?.RegisterName ||
            reg?.registerName ||
            `R${index + 1}`,
          value: registersArray[index] ?? 0,
        }))
      : registersArray.map((value, index) => ({
          label: `R${index + 1}`,
          value: value ?? 0,
        }));

  /*
    Updated flags logic:
    - User custom flags hon to custom flags show honge.
    - User flags na hon to default flags show honge.
    - Backend order: Carry, Overflow, Sign, Zero.
  */
  const dynamicFlags = buildDisplayFlags(dbFlags, flagsArray);

  const chunkArray = (array, size) => {
    const chunks = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Register Visualization</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ARCHITECTURE */}
      {architecture && (
        <Text style={{ marginBottom: 8, fontWeight: "600", color: "#1F3C88" }}>
          Using Architecture: {architecture?.Name || architecture?.name}
        </Text>
      )}

      {/* REGISTERS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registers</Text>

        {dynamicRegisters.length > 0 ? (
          chunkArray(dynamicRegisters, 4).map((rowItems, rowIndex) => (
            <View style={styles.row} key={`register-row-${rowIndex}`}>
              {rowItems.map((reg, index) => (
                <RegisterBox
                  key={`register-${rowIndex}-${index}`}
                  label={reg.label}
                  value={reg.value}
                />
              ))}

              {rowItems.length < 4 &&
                Array.from({ length: 4 - rowItems.length }).map(
                  (_, emptyIndex) => (
                    <View
                      key={`empty-register-${rowIndex}-${emptyIndex}`}
                      style={styles.boxContainer}
                    />
                  )
                )}
            </View>
          ))
        ) : (
          <Text style={styles.outputText}>No registers found</Text>
        )}
      </View>

      {/* FLAGS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Flags</Text>

        {dynamicFlags.length > 0 ? (
          chunkArray(dynamicFlags, 4).map((rowItems, rowIndex) => (
            <View style={styles.row} key={`flag-row-${rowIndex}`}>
              {rowItems.map((flag, index) => (
                <RegisterBox
                  key={`flag-${rowIndex}-${index}`}
                  label={flag.label}
                  value={flag.value}
                />
              ))}

              {rowItems.length < 4 &&
                Array.from({ length: 4 - rowItems.length }).map(
                  (_, emptyIndex) => (
                    <View
                      key={`empty-flag-${rowIndex}-${emptyIndex}`}
                      style={styles.boxContainer}
                    />
                  )
                )}
            </View>
          ))
        ) : (
          <Text style={styles.outputText}>No flags found</Text>
        )}
      </View>

      {/* OUTPUT / ERRORS */}
      <Text style={styles.cardTitle}>Output</Text>

      <View style={styles.outputBox}>
        <Text style={styles.outputText}>
          {Array.isArray(errors) && errors.length > 0
            ? errors.join("\n")
            : `Result: ${registersArray[0] ?? 0}`}
        </Text>
      </View>
    </ScrollView>
  );
};

export default RegisterVisualization;

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxContainer: {
    alignItems: "center",
    width: "22%",
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    color: "#555",
  },
  box: {
    width: "100%",
    minWidth: 64,
    height: 40,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
    width: "100%",
  },
  outputBox: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E7F5",
    minHeight: 55,
  },
  outputText: {
    fontSize: 12,
    color: "#64748B",
  },
});