import React, { useContext } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CpuDesignStack from "../navigation/CpuDesignStack";
import EditorStack from "../navigation/EditorStack";
import AppHeader from "../components/AppHeader";
import RegisterVisualization from "./RegisterVisualization";
import DashboardStack from "../navigation/DashboardStack";
import MemoryVisualization from "./MemoryVisualization";
import { AuthContext } from "../navigation/AuthStack";

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  const insets = useSafeAreaInsets();

  const { user } = useContext(AuthContext);

  const userRole = user?.Role?.toLowerCase();

  const isAdmin = userRole === "admin";
  const isSuperAdmin = userRole === "superadmin";

  const hasAdminAccess = isAdmin || isSuperAdmin;

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <AppHeader />,

        tabBarStyle: {
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },

        tabBarActiveTintColor: "#1F3C88",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="desktop-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="CPUTab"
        component={CpuDesignStack}
        options={{
          title: "CPU",
          tabBarLabel: "CPU",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="hardware-chip-outline"
              size={size}
              color={hasAdminAccess ? color : "#9CA3AF"}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={hasAdminAccess ? 0.7 : 1}
              onPress={() => {
                if (!hasAdminAccess) {
                  Alert.alert(
                    "Access Denied",
                    "Only Admin or SuperAdmin can create architecture."
                  );
                  return;
                }

                props.onPress();
              }}
              style={[props.style, !hasAdminAccess && { opacity: 0.45 }]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="EditorTab"
        component={EditorStack}
        options={{
          title: "Editor",
          tabBarLabel: "Editor",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            const tabState = navigation.getState();

            const editorTabRoute = tabState.routes.find(
              (route) => route.name === "EditorTab"
            );

            const editorStackKey = editorTabRoute?.state?.key;
            const editorStackIndex = editorTabRoute?.state?.index || 0;

            // Agar EditorStack ke andar Debugging/Compare open hai,
            // to sirf EditorStack ko first screen par lao.
            // Default tab switching ko prevent nahi karna,
            // warna Editor remount ho sakta hai aur code clear ho sakta hai.
            if (editorStackKey && editorStackIndex > 0) {
              navigation.dispatch({
                ...StackActions.popToTop(),
                target: editorStackKey,
              });
            }
          },
        })}
      />

      <Tab.Screen
        name="RegistersVizTab"
        component={RegisterVisualization}
        options={{
          title: "Registers viz",
          tabBarLabel: "Registers viz",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="eye" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MemoryVizTab"
        component={MemoryVisualization}
        options={{
          title: "Memory viz",
          tabBarLabel: "Memory viz",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;