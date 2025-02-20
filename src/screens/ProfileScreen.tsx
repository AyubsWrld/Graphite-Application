import { View, Text, Button } from "react-native" ; 
import React, { useState } from "react" ; 
import { NativeStackScreenProps } from "@react-navigation/native-stack" ; 
import { AppStackParamList } from "../navigation/AppNavigator" ; 
import { openImagePicker, writeFile, UploadProgress } from "../../lib/modules/FileManager.ts" ; 
import { SERIALIZATION_ERROR , serialize } from "../../lib/modules/HLSerialize" ; 
import { FILE_ERROR } from "../../lib/types/ErrorTypes" ; 
import type { FileContainer } from "../../lib/models/FileContainer" ; 

const APP_DBG : string = "APP" ;
const UPLOAD_URL = "http://192.168.1.71:3000/upload" ;  // define this outside of the component

type Props = NativeStackScreenProps<AppStackParamList, "Profile">

export function ProfileScreen({ navigation }: Props) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [file, setFile] = useState<FileContainer | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleConnectionTest = ( file : FileContainer ) => {
    file.testConnection( "http://192.168.1.64/" ) ; 
  }
  const handleSelect = async () => {
    try {
      const selectedFile = await openImagePicker();
      if (!selectedFile) {
        throw new Error("Failed to parse image");
      }
      console.log("Successfully selected the file");
      setIsSelected(true);
      setFile(selectedFile);
      console.log(`${APP_DBG} : Successfully set file: ${selectedFile}`);
    } catch (error) {
      console.error(`${APP_DBG} : Error selecting file:`, error);
    }
  }

  const handleUpload = async (fileToUpload: FileContainer) => {
    // Write to database
    try {
      setIsUploading(true);
      const writeError  = await writeFile(fileToUpload); 
      const uploadError = fileToUpload.uploadFile( UPLOAD_URL , setUploadProgress ) ; 
      if ( writeError!= FILE_ERROR.FILE_SUCCESS ) {
        console.error(`${APP_DBG} : File upload failed with error: ${writeError}`);
        console.log( writeError , uploadError ) ; 
      } else {
        console.log(`${APP_DBG} : File wrote & upload successful`);
      }
    } catch (error) {
      console.error(`${APP_DBG} : Error during upload:`, error);
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
      <Button
        title="Select Image"
        onPress={handleSelect}
        disabled={isUploading}
      />
      {isSelected && file && (
        <View>
          <Button
            title={isUploading ? `Uploading... ${uploadProgress.toFixed(1)}%` : "Upload Image"}
            onPress={() => handleUpload(file)}
            disabled={isUploading}
          />
          {isUploading && (
            <Text>Progress: {uploadProgress.toFixed(1)}%</Text>
          )}
        </View>
      )}
    </View>
  )
}
