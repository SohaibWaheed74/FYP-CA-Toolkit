import React, { useEffect, useState } from "react";
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

import { getAllUsers, makeAdmin, deleteUser } from "../api/authApi";

const UserDetails = ({ navigation }) => {
  const [screenState, setScreenState] = useState({
    users: [],
    loading: true,
    actionLoadingId: null,
  });

  const { users, loading, actionLoadingId } = screenState;

  const updateScreenState = (newState) => {
    setScreenState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      updateScreenState({
        loading: true,
      });

      const data = await getAllUsers();

      updateScreenState({
        users: Array.isArray(data) ? data : [],
      });
    } catch (error) {
      console.log("Fetch Users Error:", error?.message || error?.toString());

      Alert.alert(
        "Error",
        error?.message || error?.toString() || "Failed to load users"
      );
    } finally {
      updateScreenState({
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= MAKE ADMIN =================
  const handleMakeAdmin = (item) => {
    const userId = item?.UserID;

    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    if (item?.Role?.toLowerCase() === "admin") {
      Alert.alert("Info", "This user is already Admin");
      return;
    }

    Alert.alert(
      "Make Admin",
      `Are you sure you want to make ${item?.Email} admin?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Make Admin",
          onPress: async () => {
            try {
              updateScreenState({
                actionLoadingId: userId,
              });

              await makeAdmin(userId);

              setScreenState((prev) => ({
                ...prev,
                users: prev.users.map((user) =>
                  user.UserID === userId ? { ...user, Role: "Admin" } : user
                ),
              }));

              Alert.alert("Success", "User is now Admin");
            } catch (error) {
              console.log(
                "Make Admin Error:",
                error?.message || error?.toString()
              );

              Alert.alert(
                "Error",
                error?.message || error?.toString() || "Failed to make admin"
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

  // ================= DELETE USER =================
  const handleDeleteUser = (item) => {
    const userId = item?.UserID;

    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${item?.Email}?`,
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
                actionLoadingId: userId,
              });

              await deleteUser(userId);

              setScreenState((prev) => ({
                ...prev,
                users: prev.users.filter((user) => user.UserID !== userId),
              }));

              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              console.log(
                "Delete User Error:",
                error?.message || error?.toString()
              );

              Alert.alert(
                "Error",
                error?.message || error?.toString() || "Failed to delete user"
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

  // ================= RENDER USER CARD =================
  const renderUser = ({ item }) => {
    const isAdmin = item?.Role?.toLowerCase() === "admin";
    const isLoading = actionLoadingId === item?.UserID;

    return (
      <View style={styles.card}>
        <View style={styles.userTopRow}>
          <View style={styles.userIconBox}>
            <Ionicons
              name={isAdmin ? "shield-checkmark-outline" : "person-outline"}
              size={24}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.email}>{item?.Email || "-"}</Text>

            <View
              style={[
                styles.roleBadge,
                isAdmin ? styles.adminBadge : styles.userBadge,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  isAdmin ? styles.adminRoleText : styles.userRoleText,
                ]}
              >
                {item?.Role || "User"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.makeAdminButton,
              isAdmin && styles.disabledButton,
            ]}
            onPress={() => handleMakeAdmin(item)}
            disabled={isLoading || isAdmin}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="shield-outline"
                  size={15}
                  color={isAdmin ? "#9CA3AF" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.makeAdminText,
                    isAdmin && styles.disabledText,
                  ]}
                >
                  Make Admin
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
                <Text style={styles.deleteText}>Delete</Text>
              </>
            )}
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

  // ================= UI =================
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e40af" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Registered Users</Text>

        <TouchableOpacity onPress={fetchUsers}>
          <Ionicons name="refresh-outline" size={23} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.UserID.toString()}
        contentContainerStyle={{ paddingBottom: 25 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No registered users found</Text>
        }
      />
    </View>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  headerRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 14,
    marginBottom: 13,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  userTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  userIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  email: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  roleBadge: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
  },

  adminBadge: {
    backgroundColor: "#DCFCE7",
  },

  userBadge: {
    backgroundColor: "#E0E7FF",
  },

  roleText: {
    fontSize: 11,
    fontWeight: "800",
  },

  adminRoleText: {
    color: "#15803D",
  },

  userRoleText: {
    color: "#1e40af",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  makeAdminButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
    flexDirection: "row",
  },

  makeAdminText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  deleteButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 7,
    flexDirection: "row",
  },

  deleteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  disabledButton: {
    backgroundColor: "#E5E7EB",
  },

  disabledText: {
    color: "#9CA3AF",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F6FA",
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});