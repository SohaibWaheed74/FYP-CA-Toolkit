import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { ArchitectureContext } from "../context/ArchitectureContext";
import { getArchitectureDetails, getAllArchitectures } from "../api/detailApi";

const DashBoard = () => {
  const navigation = useNavigation();

  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const { setSelectedArchitecture } = useContext(ArchitectureContext);

  useEffect(() => {
    fetchArchitectures();
  }, []);

  const fetchArchitectures = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllArchitectures();
      setArchitectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Dashboard Fetch Error:", err);
      setError(err.message || "Failed to load architectures");
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (id) => {
    navigation.navigate("Detailscreen", { architectureId: id });
  };

  // =========================
  // FIXED USE FUNCTION
  // =========================
  const handleUse = async (id) => {
    try {
      console.log("USE CLICKED:", id);

      setActionLoadingId(id);

      const architectureData = await getArchitectureDetails(id);

      const fullArchitecture = {
        ...(architectureData?.Architecture || {}),
        Instructions: architectureData?.Instructions || [],
        Registers: architectureData?.Registers || [],
        AddressingModes: architectureData?.AddressingModes || [],
        ArchitectureID: id,
      };

      console.log("SETTING CONTEXT:", fullArchitecture);

      setSelectedArchitecture(fullArchitecture);

      // ✅ FIXED NAVIGATION (IMPORTANT)
      // navigation.navigate("EditorStack", {
      //   screen: "Editor",
      //   params: {
      //     architecture: fullArchitecture,
      //   },
      // });
      navigation.navigate("Editor", {
        architecture: fullArchitecture,
      });

    } catch (error) {
      console.log("Use Error:", error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================
  // UPDATE (UNCHANGED LOGIC)
  // =========================
  const handleUpdate = async (id) => {
    try {
      setActionLoadingId(id);

      const data = await getArchitectureDetails(id);

      if (!data?.Architecture) {
        throw new Error("Invalid architecture response");
      }

      const fullArchitecture = {
        cpu: data.Architecture,
        registers: data.Registers || [],
        addressingModes: data.AddressingModes || [],
        instructions: data.Instructions || [],
        architectureId: id,
      };

      navigation.navigate("UpdateScreen", {
        architectureData: fullArchitecture,
      });

    } catch (error) {
      console.log("Update Load Error:", error.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="hardware-chip-outline" size={20} color="#333" />
        <Text style={styles.cardTitle}>{item.Name}</Text>
      </View>

      <Text style={styles.cardText}>Memory: {item.MemorySize} Bytes</Text>
      <Text style={styles.cardText}>Bus: {item.BusSize} bits</Text>

      <View style={styles.cardButtons}>

        <TouchableOpacity
          style={styles.useButton}
          onPress={() => handleUse(item.ArchitectureID)}
          disabled={actionLoadingId === item.ArchitectureID}
        >
          {actionLoadingId === item.ArchitectureID ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.useText}>Use</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleUpdate(item.ArchitectureID)}
          disabled={actionLoadingId === item.ArchitectureID}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleDetail(item.ArchitectureID)}
        >
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchArchitectures}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Architectures</Text>
      <Text style={styles.subHeader}>
        Manage and explore your computer architecture designs
      </Text>

      <FlatList
        data={architectures}
        renderItem={renderItem}
        keyExtractor={(item) => item.ArchitectureID.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default DashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  useButton: {
    flex: 1,
    backgroundColor: "#1e40af",
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  updateButton: {
    flex: 1,
    backgroundColor: "white",
    borderColor: "#1e40af",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "white",
    borderColor: "#1e40af",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#1e40af",
    fontWeight: "bold",
  },
  useText: {
    color: "white",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#1e40af",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },

  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});