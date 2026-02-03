import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// ✅ REAL SCREEN (already created)
import Dashboard from "./Dashboard";
import CPUDesign from "./CpuDesign";
import CpuDesignStack from "./CpuDesignStack"; 
import Editor from "./Editor";

// 🚧 FUTURE SCREENS (will be added later)
// import InstructionDesign from "./InstructionDesign";
// import ProgramEditor from "./ProgramEditor";
// import RegisterVisualization from "./RegisterVisualization";
// import ViewMemory from "./ViewMemory";
// import Details from "./Details";
// import Search from "./Search";

// ✅ COMMON HEADER
import AppHeader from "../components/AppHeader";

const Tab = createBottomTabNavigator();

/*
  🔹 Temporary Dummy Screen
  Used ONLY until real screens are created.
  Replace this later with actual screen components.
*/
const DummyScreen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 20 }}>{title} Screen (Coming Soon)</Text>
  </View>
);

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <AppHeader />, // 🔥 COMMON HEADER FOR ALL TABS
        tabBarStyle: { height: 65 },
        tabBarLabelStyle: { fontSize: 11 },
         tabBarActiveTintColor: "#1F3C88",
      }}
    >
      {/* ✅ DASHBOARD (REAL SCREEN) */}
      <Tab.Screen name="Dashboard" component={Dashboard} />

      {/* 🚧 CPU SCREEN
          Replace DummyScreen with:
          component={CPUDesign}
      */}
      {/* <Tab.Screen name="CPU" component={CPUDesign} /> */}
      <Tab.Screen name="CPU" component={CpuDesignStack} />


      {/* 🚧 PROGRAM EDITOR SCREEN */}
      <Tab.Screen name="Editor" component={Editor}/>
       

      {/* 🚧 REGISTER VISUALIZATION SCREEN */}
      <Tab.Screen name="Registers viz">
        {() => <DummyScreen title="Registers" />}
      </Tab.Screen>
      <Tab.Screen name="Memory viz">
        {() => <DummyScreen title="Memory" />}
      </Tab.Screen>
      
    </Tab.Navigator>
  );
};

export default HomeTabs;
