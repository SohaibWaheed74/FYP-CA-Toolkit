import React, { useContext, useEffect, useState } from "react";
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

import { AuthContext } from "../navigation/AuthStack";
import { getAllUsers, makeAdmin, makeUser, deleteUser } from "../api/authApi";

const UserDetails = ({ navigation }) => {
  const { user: loggedInUser } = useContext(AuthContext);

  const loggedInUserRole = loggedInUser?.Role?.toLowerCase();

  const isLoggedInAdmin = loggedInUserRole === "admin";
  const isLoggedInSuperAdmin = loggedInUserRole === "superadmin";

  const hasAdminAccess = isLoggedInAdmin || isLoggedInSuperAdmin;
  const canDelete = isLoggedInSuperAdmin;

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

  // ================= CHANGE USER ROLE =================
  const handleChangeRole = (item) => {
    if (!hasAdminAccess) {
      Alert.alert(
        "Access Denied",
        "Only Admin or SuperAdmin can change user roles."
      );
      return;
    }

    const userId = item?.UserID;
    const role = item?.Role?.toLowerCase();
    const isAdmin = role === "admin";
    const isSuperAdmin = role === "superadmin";
    const newRole = isAdmin ? "User" : "Admin";

    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    if (isSuperAdmin) {
      Alert.alert("Access Denied", "SuperAdmin role cannot be changed.");
      return;
    }

    Alert.alert(
      "Change Role",
      `Are you sure you want to make ${item?.Email} ${newRole}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: `Make ${newRole}`,
          onPress: async () => {
            try {
              updateScreenState({
                actionLoadingId: userId,
              });

              if (isAdmin) {
                await makeUser(userId);
              } else {
                await makeAdmin(userId);
              }

              setScreenState((prev) => ({
                ...prev,
                users: prev.users.map((user) =>
                  user.UserID === userId ? { ...user, Role: newRole } : user
                ),
              }));

              Alert.alert("Success", `User is now ${newRole}`);
            } catch (error) {
              console.log(
                "Change Role Error:",
                error?.message || error?.toString()
              );

              Alert.alert(
                "Error",
                error?.message || error?.toString() || "Failed to change role"
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
    if (!canDelete) {
      Alert.alert("Access Denied", "Only SuperAdmin can delete users.");
      return;
    }

    const userId = item?.UserID;
    const role = item?.Role?.toLowerCase();
    const isSuperAdmin = role === "superadmin";

    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    if (isSuperAdmin) {
      Alert.alert("Access Denied", "SuperAdmin cannot be deleted.");
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

              await deleteUser(userId, loggedInUser?.UserID);

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
    const role = item?.Role?.toLowerCase();
    const isAdmin = role === "admin";
    const isSuperAdmin = role === "superadmin";
    const isLoading = actionLoadingId === item?.UserID;

    return (
      <View style={styles.card}>
        <View style={styles.userTopRow}>
          <View style={styles.userIconBox}>
            <Ionicons
              name={
                isSuperAdmin || isAdmin
                  ? "shield-checkmark-outline"
                  : "person-outline"
              }
              size={24}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.email}>{item?.Email || "-"}</Text>

            <View
              style={[
                styles.roleBadge,
                isSuperAdmin
                  ? styles.superAdminBadge
                  : isAdmin
                  ? styles.adminBadge
                  : styles.userBadge,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  isSuperAdmin
                    ? styles.superAdminRoleText
                    : isAdmin
                    ? styles.adminRoleText
                    : styles.userRoleText,
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
              isAdmin && styles.makeUserButton,
              isSuperAdmin && styles.disabledButton,
            ]}
            onPress={() => handleChangeRole(item)}
            disabled={isLoading || isSuperAdmin}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name={
                    isSuperAdmin
                      ? "shield-checkmark-outline"
                      : isAdmin
                      ? "person-outline"
                      : "shield-outline"
                  }
                  size={15}
                  color={isSuperAdmin ? "#9CA3AF" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.makeAdminText,
                    isSuperAdmin && styles.disabledText,
                  ]}
                >
                  {isSuperAdmin
                    ? "SuperAdmin"
                    : isAdmin
                    ? "Make User"
                    : "Make Admin"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {canDelete && !isSuperAdmin && (
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
          )}
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

  superAdminBadge: {
    backgroundColor: "#FEF3C7",
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

  superAdminRoleText: {
    color: "#B45309",
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

  makeUserButton: {
    backgroundColor: "#64748B",
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