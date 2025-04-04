// import 'react-native-gesture-handler';  
// import React from 'react';
// import { AppNavigator } from './src/navigation/AppNavigator';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { FileProvider } from "./src/context/FileContext.tsx";
//
// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <FileProvider>
//         <AppNavigator />
//       </FileProvider>
//     </GestureHandlerRootView>
//   );
// }

import 'react-native-gesture-handler';  
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FileProvider } from "./src/context/FileContext.tsx";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FileProvider>
        <AppNavigator />
      </FileProvider>
    </GestureHandlerRootView>
  );
}
