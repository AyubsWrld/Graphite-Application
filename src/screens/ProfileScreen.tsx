import { View, Text, Button } from "react-native" ; 
import React, { useState } from "react" ; 
import { NativeStackScreenProps } from "@react-navigation/native-stack" ; 
import { AppStackParamList } from "../navigation/AppNavigator" ; 
import { openImagePicker, writeFile, uploadFileToServer, UploadProgress } from "../../lib/modules/FileManager.ts" ; 
import { SERIALIZATION_ERROR , serialize } from "../../lib/modules/HLSerialize" ; 
import type { FileContainer } from "../../lib/models/FileContainer" ; 

const APP_DBG : string = "APP" ;
const UPLOAD_URL = "http://192.168.1.82:3000/upload" ; 

type Props = NativeStackScreenProps<AppStackParamList, "Profile">

export function ProfileScreen({ navigation }: Props) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [file, setFile] = useState<FileContainer | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleImage = async () => {
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

  const handleSerialize = ( file : FileContainer ) => { // Return serialization error
    const errorCode = serialize( file ) ; 
  }

  const handleUpload = async (fileToUpload: FileContainer) => {
    try {
      setIsUploading(true);
      console.log(`${APP_DBG} : Attempting to upload file: ${fileToUpload}`);

      const exitCode = await uploadFileToServer(
        fileToUpload,
        UPLOAD_URL,
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
          console.log(`${APP_DBG} : Upload progress: ${progress.percentage}%`);
        }
      );

      if (exitCode === FILE_ERROR.FILE_SUCCESS) {
        console.log(`${APP_DBG} : Successfully uploaded file`);
        // Optionally save to local storage after successful upload
        await writeFile(fileToUpload);
      } else {
        console.warn(`${APP_DBG} : Upload Failed with error code:`, exitCode);
      }
    } catch (error) {
      console.error(`${APP_DBG} : Error during upload:`, error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        onPress={handleImage}
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
      { isSelected && file && file.extension == "mp4" && (
        <Button
          title={"Serialize"}
          onPress={ () => handleSerialize()}
        />

      ) }
    </View>
  )
}
