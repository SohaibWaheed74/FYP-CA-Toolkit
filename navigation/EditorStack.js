import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Editor from "../screens/Editor";
import Compare from "../screens/Compare";
import RegisterVisualization from "../screens/RegisterVisualization";

const Stack = createNativeStackNavigator();

const EditorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Editor" component={Editor} />
      <Stack.Screen name="Compare" component={Compare} />
      <Stack.Screen name="RegisterVisualization" component={RegisterVisualization} />

    </Stack.Navigator>
  );
};

export default EditorStack;
