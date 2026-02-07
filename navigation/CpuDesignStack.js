import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CpuDesign from "../screens/CpuDesign";
import RegisterDesign from "../screens/RegisterDesign";
import InstructionDesign from "../screens/InstructionDesign";
import Testing from "../screens/Testing";

const Stack = createNativeStackNavigator();

const CpuDesignStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CpuDesign" component={CpuDesign} />
      <Stack.Screen name="RegisterDesign" component={RegisterDesign}/>
      <Stack.Screen name="InstructionDesign" component={InstructionDesign}/>
      <Stack.Screen name="Testing" component={Testing}/>
    </Stack.Navigator>
  );
};

export default CpuDesignStack;
