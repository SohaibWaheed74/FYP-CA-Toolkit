import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Editor from "./Editor";
import Compare from "./Compare";

const Stack = createNativeStackNavigator();

const EditorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Editor" component={Editor} />
      <Stack.Screen name="Compare" component={Compare} />
    </Stack.Navigator>
  );
};

export default EditorStack;
