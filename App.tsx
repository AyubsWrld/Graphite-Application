import 'react-native-gesture-handler';  
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ImageProvider } from './src/context/ImageContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageProvider>
        <AppNavigator />
      </ImageProvider>
    </GestureHandlerRootView>
  );
}
