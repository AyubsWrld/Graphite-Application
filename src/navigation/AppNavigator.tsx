import React from "react" ;
import { NavigationContainer } from "@react-navigation/native" ;
import { createNativeStackNavigator } from "@react-navigation/native-stack" ;
import HomeScreen from "../screens/HomeScreen"; // Import default export ;
import { LoginScreen } from "../screens/LoginScreen" ;
import { RegisterScreen } from "../screens/RegisterScreen" ;
import { ProfileScreen } from "../screens/ProfileScreen" ;
import { TestingScreen } from "../screens/TestingScreen.tsx" ;


// What does this do ? 

export type AppStackParamList = {
  Home: undefined
  Login: undefined
  Profile: undefined
  Register: undefined
  Testing : undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Testing" component={ TestingScreen } />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

