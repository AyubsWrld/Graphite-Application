import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { TestingScreen } from "../screens/TestingScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import  ConfigScreen  from "../screens/ConfigScreen";
// import { Ionicons } from '@expo/vector-icons';

export type AppStackParamList = {
  Auth: undefined;
  Main: { firstname : string , lastname : string } | undefined;
}


export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
}

export type MainTabParamList = {
  Home: { firstname : string , lastname : string } | undefined;
  Settings: undefined;
}

// For other stack screens that will be accessible from tabs
export type HomeStackParamList = {
  HomeMain: { firstname: string; lastname: string } | undefined;
  Profile: undefined;
  Testing: undefined;
  Details: undefined;
  Debugging: undefined;
  Config: undefined;
}

const Stack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

// Auth Navigator (Login/Register)
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Home Stack (screens accessible from Home tab)
function HomeStackNavigator({ route }: any) {
  // Extract params from route
  const { firstname, lastname } = route.params || {};
  
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        initialParams={{ firstname, lastname }}
      />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Testing" component={TestingScreen} />
      <HomeStack.Screen name="Config" component={ConfigScreen} />
    </HomeStack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator({ route }: any) {
  // Extract params from route
  const { firstname, lastname } = route.params || {};
  
  return (
    <Tab.Navigator

      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          // You can implement custom icon logic here based on route.name
          // For example:
          // let iconName;
          // if (route.name === 'Home') {
          //   iconName = focused ? 'home' : 'home-outline';
          // } else if (route.name === 'Settings') {
          //   iconName = focused ? 'settings' : 'settings-outline';
          // }
          // return <Ionicons name={iconName} size={size} color={color} />;
          
          // For now, returning null as we haven't set up icons
          return null;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator} 
        initialParams={{ firstname, lastname }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
