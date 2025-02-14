import { View, Text, Button, TextInput, StyleSheet } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"
import { useState } from "react"
import { AppDataSource } from "../../utils/database/data-source"
import { User } from "../../utils/database/entities/User" // adjust path as needed

type Props = NativeStackScreenProps<AppStackParamList, "Debugging">

export function Debugging({ navigation }: Props) {

  return (
    <View>
      <Button 
        title="Print Table Contents" 
        onPress={ () => console.log("Debugging")} 
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
})
