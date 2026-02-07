import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CpuDesign from "../screens/CpuDesign";
import RegisterDesign from "../screens/RegisterDesign";
import InstructionDesign from "../screens/InstructionDesign";

const Stack = createNativeStackNavigator();

const CpuDesignStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CpuDesign" component={CpuDesign} />
      <Stack.Screen name="RegisterDesign" component={RegisterDesign}/>
      <Stack.Screen name="InstructionDesign" component={InstructionDesign}
      />
    </Stack.Navigator>
  );
};

export default CpuDesignStack;
