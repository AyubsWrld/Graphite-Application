import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppDataSource } from "../../utils/database/data-source";
import { User } from "../../utils/database/entities/User";

type Props = NativeStackScreenProps<AppStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {

  return (
    <View style={styles.container}>
      <Button 
        title="Go to Home" 
        onPress={() => navigation.replace("Home")} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
