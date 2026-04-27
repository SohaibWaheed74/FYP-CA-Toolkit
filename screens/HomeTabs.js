import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CpuDesignStack from "../navigation/CpuDesignStack";
import EditorStack from "../navigation/EditorStack";
import AppHeader from "../components/AppHeader";
import RegisterVisualization from "./RegisterVisualization";
import DashboardStack from "../navigation/DashboardStack";
import MemoryVisualization from "./MemoryVisualization";

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  const insets = useSafeAreaInsets();

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
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
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