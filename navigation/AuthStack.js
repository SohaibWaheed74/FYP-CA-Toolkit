import React, { createContext, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/Login";
import Signup from "../screens/Signup";
import HomeTabs from "../screens/HomeTabs";

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
  });

  const login = (loggedInUser) => {
    setAuthState({
      isLoggedIn: true,
      user: loggedInUser || null,
    });
  };

  const logout = () => {
    setAuthState({
      isLoggedIn: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        user: authState.user,
        login,
        logout,
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.isLoggedIn ? (
          <Stack.Screen name="HomeTabs" component={HomeTabs} />
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} onLogin={login} />}
            </Stack.Screen>

            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </AuthContext.Provider>
  );
};

export default AuthStack;