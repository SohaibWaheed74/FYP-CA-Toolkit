import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Detailscreen from "../screens/Detailscreen";
import Dashboard from "../screens/Dashboard";

const Stack = createNativeStackNavigator();

const DashboardStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Detailscreen" component={Detailscreen} />

        </Stack.Navigator>
    );
};

export default DashboardStack;
