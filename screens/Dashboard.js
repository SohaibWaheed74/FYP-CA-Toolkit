import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { ArchitectureContext } from "../context/ArchitectureContext";
import { AuthContext } from "../navigation/AuthStack";
import {
  getArchitectureDetails,
  getAllArchitectures,
  deleteArchitecture,
} from "../api/detailApi";
import { useArchitectureForExecution } from "../api/executionApi";

const DashBoard = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);

  const userRole = user?.Role?.toLowerCase();

  const isAdmin = userRole === "admin";
  const isSuperAdmin = userRole === "superadmin";

  const hasAdminAccess = isAdmin || isSuperAdmin;
  const canDelete = isSuperAdmin;

  const { setSelectedArchitecture, initializeMemory, clearMemory } =
    useContext(ArchitectureContext);

  const [screenState, setScreenState] = useState({
    architectures: [],
    searchText: "",
    loading: true,
    actionLoadingId: null,
    error: null,
  });

  const { architectures, searchText, loading, actionLoadingId, error } =
    screenState;

  const updateScreenState = (newState) => {
    setScreenState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  // ================= SEARCH FILTER =================
  const filteredArchitectures = architectures.filter((item) =>
    item?.Name?.toLowerCase().includes(searchText.toLowerCase())
  );

  // ================= FETCH ARCHITECTURES =================
  const fetchArchitectures = async () => {
    try {
      updateScreenState({
        loading: true,
        error: null,
      });

      const data = await getAllArchitectures();

      updateScreenState({
        architectures: Array.isArray(data) ? data : [],
      });
    } catch (err) {
      console.log("Dashboard Fetch Error:", err);

      updateScreenState({
        error:
          err?.message || err?.toString() || "Failed to load architectures",
      });
    } finally {
      updateScreenState({
        loading: false,
      });
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchArchitectures();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchArchitectures();
    });

    return unsubscribe;
  }, [navigation]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    setSelectedArchitecture(null);

    if (clearMemory) {
      clearMemory();
    }

    logout();
  };

  // ================= DETAILS =================
  const handleDetail = (id) => {
    navigation.navigate("Detailscreen", { architectureId: id });
  };

  // ================= USERS SCREEN =================
  const handleUsers = () => {
    navigation.navigate("UsersScreen");
  };

  // ================= USE ARCHITECTURE =================
  const handleUse = async (item) => {
    try {
      const id = item?.ArchitectureID;

      if (!id) {
        Alert.alert("Error", "Architecture ID not found");
        return;
      }

      updateScreenState({
        actionLoadingId: id,
      });

      const architectureData = await getArchitectureDetails(id);

      await useArchitectureForExecution(id);

      const architectureInfo = architectureData?.Architecture || {};

      const fullArchitecture = {
        ...architectureInfo,
        Instructions: architectureData?.Instructions || [],
        Registers: architectureData?.Registers || [],
        AddressingModes: architectureData?.AddressingModes || [],
        ArchitectureID: id,
      };

      setSelectedArchitecture(fullArchitecture);

      const memorySize =
        Number(architectureInfo?.MemorySize) || Number(item?.MemorySize) || 0;

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
      updateScreenState({
        actionLoadingId: null,
      });
    }
  };

  // ================= UPDATE =================
  const handleUpdate = (id) => {
    if (!hasAdminAccess) {
      Alert.alert(
        "Access Denied",
        "Only Admin or SuperAdmin can update architecture."
      );
      return;
    }

    if (!id) {
      Alert.alert("Error", "Architecture ID not found");
      return;
    }

    navigation.navigate("UpdateScreen", {
      architectureId: id,
    });
  };

  // ================= DELETE ARCHITECTURE =================
  const handleDelete = (item) => {
    if (!canDelete) {
      Alert.alert(
        "Access Denied",
        "Only SuperAdmin can delete architecture."
      );
      return;
    }

    const id = item?.ArchitectureID;

    if (!id) {
      Alert.alert("Error", "Architecture ID not found");
      return;
    }

    Alert.alert(
      "Delete Architecture",
      `Are you sure you want to delete ${item?.Name || "this architecture"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              updateScreenState({
                actionLoadingId: id,
              });

              await deleteArchitecture(id);

              setScreenState((prev) => ({
                ...prev,
                architectures: prev.architectures.filter(
                  (arch) => arch.ArchitectureID !== id
                ),
              }));

              Alert.alert("Success", "Architecture deleted successfully");
            } catch (error) {
              console.log("Delete Error:", error?.message || error?.toString());

              Alert.alert(
                "Error",
                error?.message ||
                  error?.toString() ||
                  "Failed to delete architecture"
              );
            } finally {
              updateScreenState({
                actionLoadingId: null,
              });
            }
          },
        },
      ]
    );
  };

  // ================= CARD ITEM =================
  const renderItem = ({ item }) => {
    const isLoading = actionLoadingId === item.ArchitectureID;

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="hardware-chip-outline" size={20} color="#333" />
            <Text style={styles.cardTitle}>{item.Name}</Text>
          </View>

          {/* Delete Button - SuperAdmin only */}
          {canDelete && (
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => handleDelete(item)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.cardText}>Memory: {item.MemorySize} Bytes</Text>
        <Text style={styles.cardText}>Bus: {item.BusSize} bits</Text>

        <View style={styles.cardButtons}>
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => handleUse(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.useText}>Use</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.updateButton,
              !hasAdminAccess && styles.disabledUpdateButton,
            ]}
            onPress={() => handleUpdate(item.ArchitectureID)}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.buttonText,
                !hasAdminAccess && styles.disabledUpdateText,
              ]}
            >
              Update
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleDetail(item.ArchitectureID)}
            disabled={isLoading}
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
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={fetchArchitectures}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= UI =================
  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.titleWrapper}>
          <Text style={styles.header}>My Architectures</Text>
          <Text style={styles.subHeader}>
            Manage and explore your computer architecture designs
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={14} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Field */}
      {/* <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#64748B" />

        <TextInput
          value={searchText}
          onChangeText={(text) =>
            updateScreenState({
              searchText: text,
            })
          }
          placeholder="Search architecture by name..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              updateScreenState({
                searchText: "",
              })
            }
          >
            <Ionicons name="close-circle" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View> */}

      <FlatList
        data={filteredArchitectures}
        renderItem={renderItem}
        keyExtractor={(item) => item.ArchitectureID.toString()}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptySearchText}>No architecture found</Text>
        }
      />

      {/* Floating Users Button - Admin and SuperAdmin */}
      {hasAdminAccess && (
        <TouchableOpacity style={styles.floatingUsersButton} onPress={handleUsers}>
          <Ionicons name="people-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  titleWrapper: {
    flex: 1,
    paddingRight: 10,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#111827",
  },

  subHeader: {
    fontSize: 13,
    color: "#555",
  },

  logoutButton: {
    backgroundColor: "#af1e1e",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 7,
    marginTop: 2,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  searchContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8DEE9",
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingHorizontal: 8,
  },

  emptySearchText: {
    textAlign: "center",
    marginTop: 30,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
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

  deleteIconButton: {
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

  updateButton: {
    flex: 1,
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },

  disabledUpdateButton: {
    backgroundColor: "#E5E7EB",
    borderColor: "#CBD5E1",
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

  disabledUpdateText: {
    color: "#9CA3AF",
  },

  useText: {
    color: "white",
    fontWeight: "bold",
  },

  floatingUsersButton: {
    position: "absolute",
    right: 22,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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