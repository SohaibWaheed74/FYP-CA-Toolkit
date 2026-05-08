import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Detailscreen from "../screens/Detailscreen";
import Dashboard from "../screens/Dashboard";
import Edit from "../screens/Edit";
import Editor from "../screens/Editor";
import Compare from "../screens/Compare";
import Debugging from "../screens/Debugging";
import UpdateArchitectureScreen from "../screens/UpdateScreen";
import UserDetails from "../screens/UserDetails";

const Stack = createNativeStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={Dashboard} />
      <Stack.Screen name="Detailscreen" component={Detailscreen} />
      <Stack.Screen name="Edit" component={Edit} />
      <Stack.Screen name="Editor" component={Editor} />
      <Stack.Screen name="Compare" component={Compare} />
      <Stack.Screen name="Debugging" component={Debugging} />
      <Stack.Screen name="UpdateScreen" component={UpdateArchitectureScreen} />
      <Stack.Screen name="UsersScreen" component={UserDetails} />
    </Stack.Navigator>
  );
};

export default DashboardStack;