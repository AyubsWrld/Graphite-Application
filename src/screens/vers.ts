import { View, Text, Button, TextInput, StyleSheet } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"
import { useState } from "react"
import { AppDataSource } from "../../utils/database/data-source"
import { User } from "../../utils/database/entities/User" // adjust path as needed

type Props = NativeStackScreenProps<AppStackParamList, "Home">

export function HomeScreen({ navigation }: Props) {

  return (
    <View style={styles.container}>
      <Button 
        title="Go to Profile" 
        onPress={() => navigation.navigate("Profile")} 
      />
      <Button 
        title="Go to Debugging" 
        onPress={() => navigation.navigate("Debugging")} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center" ,
    justifyContent : "center"
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  searchContainer: {
    width: "100%",
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%"
  },
  userInfo: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    marginBottom: 20
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5
  },
  value: {
    marginBottom: 15
  },
  error: {
    color: "red",
    marginBottom: 20
  }
});


