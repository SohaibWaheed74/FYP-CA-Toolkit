import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeTabs from "./screens/HomeTabs";
import InstructionDesign from "./screens/InstructionDesign";
import Compare from "./screens/Compare";
import EditorStack from "./navigation/EditorStack";
import AuthStack from "./navigation/AuthStack";

import { ArchitectureProvider } from "./context/ArchitectureContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ArchitectureProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Main Tabs */}
            <Stack.Screen name="HomeTabs" component={HomeTabs} />

            {/* Global Screens */}
            <Stack.Screen name="EditorStack" component={EditorStack} />
            <Stack.Screen
              name="InstructionDesign"
              component={InstructionDesign}
            />
            <Stack.Screen name="Compare" component={Compare} />
          </Stack.Navigator>
        ) : (
          <AuthStack onLogin={() => setIsLoggedIn(true)} />
        )}
      </NavigationContainer>
    </ArchitectureProvider>
  );
}