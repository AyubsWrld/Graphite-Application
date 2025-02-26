import React, { useRef, useCallback } from 'react';
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

type Props = NativeStackScreenProps<AppStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleToggleBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand(); // Open bottom sheet to 60%
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Toggle Bottom Sheet" onPress={handleToggleBottomSheet} />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["60%"]}
        index={-1} // Initially hidden
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
          <Button title="Close" onPress={() => bottomSheetRef.current?.close()} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});
