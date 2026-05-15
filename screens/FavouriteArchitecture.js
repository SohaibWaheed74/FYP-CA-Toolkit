import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { ArchitectureContext } from "../context/ArchitectureContext";
import { AuthContext } from "../navigation/AuthStack";
import {
  getArchitectureDetails,
  getFavouriteArchitectures,
  updateArchitectureFavourite,
} from "../api/detailApi";
import { useArchitectureForExecution } from "../api/executionApi";

const FavouriteArchitecture = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const { setSelectedArchitecture, initializeMemory } =
    useContext(ArchitectureContext);

  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [favouriteLoadingId, setFavouriteLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const getUserId = () => {
    return user?.UserID || user?.userID || user?.UserId || user?.id || 0;
  };

  // ================= FETCH FAVOURITES =================
  const fetchFavouriteArchitectures = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();

      if (!userId) {
        setArchitectures([]);
        setError("User ID not found. Please login again.");
        return;
      }

      const data = await getFavouriteArchitectures(userId);

      setArchitectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Favourite Architecture Fetch Error:", err);

      setError(
        err?.message ||
          err?.toString() ||
          "Failed to load favourite architectures"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchFavouriteArchitectures();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchFavouriteArchitectures();
    });

    return unsubscribe;
  }, [navigation, user]);

  // ================= DETAILS =================
  const handleDetail = (id) => {
    navigation.navigate("Detailscreen", { architectureId: id });
  };

  // ================= USE ARCHITECTURE =================
  const handleUse = async (item) => {
    try {
      const id = item?.ArchitectureID;

      if (!id) {
        Alert.alert("Error", "Architecture ID not found");
        return;
      }

      setActionLoadingId(id);

      const architectureData = await getArchitectureDetails(id);

      await useArchitectureForExecution(id);

      const architectureInfo =
        architectureData?.Architecture || architectureData?.architecture || {};

      const fullArchitecture = {
        ...architectureInfo,

        Instructions:
          architectureData?.Instructions || architectureData?.instructions || [],

        Registers:
          architectureData?.Registers || architectureData?.registers || [],

        AddressingModes:
          architectureData?.AddressingModes ||
          architectureData?.addressingModes ||
          [],

        ArchitectureID: id,
      };

      setSelectedArchitecture(fullArchitecture);

      const memorySize =
        Number(architectureInfo?.MemorySize) ||
        Number(item?.MemorySize) ||
        Number(
          String(architectureInfo?.memorySize || "")
            .replace(" Bytes", "")
            .trim()
        ) ||
        0;

      initializeMemory(memorySize);

      navigation.navigate("Editor", {
        architecture: fullArchitecture,
      });
    } catch (error) {
      console.log("Use Error:", error?.message || error?.toString());

      Alert.alert(
        "Error",
        error?.message || error?.toString() || "Failed to use architecture"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // ================= REMOVE FAVOURITE =================
  const handleRemoveFavourite = async (item) => {
    const userId = getUserId();
    const id = item?.ArchitectureID;

    if (!userId) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }

    if (!id) {
      Alert.alert("Error", "Architecture ID not found");
      return;
    }

    try {
      setFavouriteLoadingId(id);

      await updateArchitectureFavourite(id, userId, false);

      setArchitectures((prev) =>
        prev.filter((arch) => arch.ArchitectureID !== id)
      );
    } catch (error) {
      console.log("Remove Favourite Error:", error?.message || error?.toString());

      Alert.alert(
        "Error",
        error?.message ||
          error?.toString() ||
          "Failed to remove favourite architecture"
      );
    } finally {
      setFavouriteLoadingId(null);
    }
  };

  // ================= CARD ITEM =================
  const renderItem = ({ item }) => {
    const isLoading = actionLoadingId === item.ArchitectureID;
    const isFavouriteLoading = favouriteLoadingId === item.ArchitectureID;

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="hardware-chip-outline" size={20} color="#333" />
            <Text style={styles.cardTitle}>{item.Name}</Text>
          </View>

          <TouchableOpacity
            style={styles.favouriteIconButton}
            onPress={() => handleRemoveFavourite(item)}
            disabled={isLoading || isFavouriteLoading}
          >
            {isFavouriteLoading ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Ionicons name="heart" size={20} color="#DC2626" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.cardText}>Memory: {item.MemorySize} Bytes</Text>
        <Text style={styles.cardText}>Bus: {item.BusSize} bits</Text>

        <View style={styles.cardButtons}>
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => handleUse(item)}
            disabled={isLoading || isFavouriteLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.useText}>Use</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleDetail(item.ArchitectureID)}
            disabled={isLoading || isFavouriteLoading}
          >
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  // ================= ERROR =================
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchFavouriteArchitectures}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= UI =================
  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.header}>Favourite Architectures</Text>
          <Text style={styles.subHeader}>
            Your saved favourite architecture designs
          </Text>
        </View>
      </View>

      <FlatList
        data={architectures}
        renderItem={renderItem}
        keyExtractor={(item) => item.ArchitectureID.toString()}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Ionicons name="heart-outline" size={45} color="#94A3B8" />
            <Text style={styles.emptyText}>No favourite architecture found</Text>
          </View>
        }
      />
    </View>
  );
};

export default FavouriteArchitecture;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  titleWrapper: {
    flex: 1,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  subHeader: {
    fontSize: 13,
    color: "#555",
    marginTop: 3,
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

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
    color: "#111827",
  },

  favouriteIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
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

  detailsButton: {
    flex: 1,
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
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

  errorText: {
    color: "red",
    textAlign: "center",
  },

  emptyWrapper: {
    alignItems: "center",
    marginTop: 70,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});