import { View, Text, Button } from "react-native"
import React , { useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"
import { FILE_ERROR , openImagePicker  , writeFile } from "../../lib/FileManager"

type Props = NativeStackScreenProps<AppStackParamList, "Profile">




export function ProfileScreen({ navigation }: Props) {
  const [ isSelected ,  setIsSelected ] = useState<boolean>(false); 

  const handleImage = async () => {
    const exitCode : FILE_ERROR = await openImagePicker() ; 
    if(!exitCode) console.log("undef") ; 
    if(exitCode == FILE_ERROR.FILE_SUCCESS){
      console.log("Succesfully selected the file") ; 
      setIsSelected(true) ; 
    }
  }

  const writeFile = async () => {
    const exitCode = await writeFile() ; 
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()} 
      />

      <Button
        title="Select Image"
        onPress={() => handleImage()} 
      />

      { isSelected && <Button
        title="Upload Image"
        onPress={() => handleUpload()} 
      />}
    </View>
  )
}
