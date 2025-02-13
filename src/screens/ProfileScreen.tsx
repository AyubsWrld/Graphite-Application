import { View, Text, Button } from "react-native"
import React , { useState } from "react"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { AppStackParamList } from "../navigation/AppNavigator"
import { FILE_ERROR , openImagePicker  , writeFile } from "../../lib/FileManager"


const APP_DBG = "APP" ; 

type Props = NativeStackScreenProps<AppStackParamList, "Profile">

export function ProfileScreen({ navigation }: Props) {

  const [ isSelected ,  setIsSelected ] = useState<boolean>(false); 
  const [ file , setFile ] = useState<FileContainer>( null ) // This has to be an array later so we can send multiple files 

  const handleImage = async () => {
    const file : FileContainer = await openImagePicker() ; 
    if(!file) throw new Error( "Failed to parse image" ) ;  
    else{
      console.log("Succesfully selected the file") ; 
      setIsSelected(true) ; 
      setFile(file) ; 
      console.log(`${APP_DBG} : Succesfully set file : ${file}` ) ; 
    }
  }

  const handleUpload = async ( file : FileContainer ) => { 
    console.log(`${APP_DBG} : Attempting to write file : ${file}`) ; 
    const exitCode = await writeFile( file ) ; 
    if(exitCode == FILE_ERROR.FILE_SUCCESS) console.log("Succesfully uploaded file") ; 
    else{ 
      console.warn("Upload Failed") ; 
    }
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

      { isSelected &&
        <View>
          <Button
            title="Upload Image"
            onPress={() => handleUpload(file)} 
          />
        </View>
      }
    </View>
  )
}
