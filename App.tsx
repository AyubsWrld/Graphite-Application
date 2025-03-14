import 'react-native-gesture-handler';  
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageProvider } from "./src/context/ImageContext.tsx";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageProvider>
        <AppNavigator />
      </ImageProvider>
    </GestureHandlerRootView>
  );
}
