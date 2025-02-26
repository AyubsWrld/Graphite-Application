import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screens/HomeScreen"; // Import default export
import { LoginScreen } from "../screens/LoginScreen"
import { ProfileScreen } from "../screens/ProfileScreen"
import { Debugging } from "../screens/Debugging"

export type AppStackParamList = {
  Home: undefined
  Login: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Debugging" component={Debugging} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

