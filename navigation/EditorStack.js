import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Editor from "../screens/Editor";
import Compare from "../screens/Compare";
import RegisterVisualization from "../screens/RegisterVisualization";
import Debugging from "../screens/Debugging";

const Stack = createNativeStackNavigator();

const EditorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Editor" component={Editor} />
      <Stack.Screen name="Compare" component={Compare} />
      <Stack.Screen name="RegisterVisualization" component={RegisterVisualization} />
      <Stack.Screen name="Debugging" component={Debugging} />

    </Stack.Navigator>
  );
};

export default EditorStack;
