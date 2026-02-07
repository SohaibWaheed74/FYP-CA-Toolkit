import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons"; 
import Dashboard from "./Dashboard";
import CpuDesignStack from "../navigation/CpuDesignStack"; 
import EditorStack from "../navigation/EditorStack";
import AppHeader from "../components/AppHeader";
import RegisterVisualization from "./RegisterVisualization";

const Tab = createBottomTabNavigator();

const DummyScreen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 20 }}>{title} Screen (Coming Soon)</Text>
  </View>
);

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <AppHeader />, 
        tabBarStyle: { height: 65 },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarActiveTintColor: "#1F3C88",
      }}
    >
      {/* ✅ DASHBOARD */}
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🚧 CPU SCREEN */}
      <Tab.Screen
        name="CPU"
        component={CpuDesignStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🚧 PROGRAM EDITOR SCREEN */}
      <Tab.Screen
        name="Editor"
        component={EditorStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 🚧 REGISTER VISUALIZATION SCREEN */}
      <Tab.Screen
        name="Registers viz"
        component={RegisterVisualization}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
          ),
        }}
      />
      

      <Tab.Screen
        name="Memory viz"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <DummyScreen title="Memory" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default HomeTabs;
