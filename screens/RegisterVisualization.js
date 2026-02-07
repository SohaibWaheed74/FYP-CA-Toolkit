import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

/* =======================
   REUSABLE REGISTER BOX
======================= */
const RegisterBox = ({ label, value }) => {
  return (
    <View style={styles.boxContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Text style={styles.value}>{value ?? "-"}</Text>
      </View>
    </View>
  );
};

/* =======================
   MAIN SCREEN
======================= */
const RegisterVisualization = () => {
  const navigation = useNavigation();

  const [registers, setRegisters] = useState({});
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegisterData();
  }, []);

  /* =======================
     API CALL (DUMMY FOR NOW)
  ======================= */
  const fetchRegisterData = async () => {
    try {
      // 🔹 Replace with real API later
      const data = {
        registers: {
          R1: 0,
          R2: 9,
          R3: 5,
          R4: 9,
          R5: 0,
          PC: 6,
          SP: 0,
          IR: 6,
        },
        flags: {
          Carry: 0,
          Overflow: 0,
          Sign: 0,
          Zero: 0,
        },
      };

      setRegisters(data.registers);
      setFlags(data.flags);
    } catch (error) {
      console.log("Error fetching register data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1F3C88" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Visualization</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Register Display */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Register Display</Text>

        <View style={styles.row}>
          <RegisterBox label="R1" value={registers.R1} />
          <RegisterBox label="R2" value={registers.R2} />
          <RegisterBox label="R3" value={registers.R3} />
          <RegisterBox label="R4" value={registers.R4} />
        </View>

        <View style={styles.row}>
          <RegisterBox label="R5" value={registers.R5} />
          <RegisterBox label="PC" value={registers.PC} />
          <RegisterBox label="SP" value={registers.SP} />
          <RegisterBox label="IR" value={registers.IR} />
        </View>
      </View>

      {/* Flag Registers */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Flag Registers</Text>

        <View style={styles.row}>
          <RegisterBox label="Carry" value={flags.Carry} />
          <RegisterBox label="Overflow" value={flags.Overflow} />
          <RegisterBox label="Sign" value={flags.Sign} />
          <RegisterBox label="Zero" value={flags.Zero} />
        </View>
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
    height: 40,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
