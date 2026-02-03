import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeTabs from "./screens/HomeTabs";
import InstructionDesign from "./screens/InstructionDesign";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Bottom tab navigator */}
        <Stack.Screen name="HomeTabs" component={HomeTabs} />

        {/* InstructionDesign screen is outside tabs */}
        <Stack.Screen name="InstructionDesign" component={InstructionDesign} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
