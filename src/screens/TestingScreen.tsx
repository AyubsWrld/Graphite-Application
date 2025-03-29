import React , { useState , useRef } from "react";
import { Text , Button , TouchableOpacity , StyleSheet , View } from "react-native";
import TestFile from "../assets/icons/add.png";
import * as DocumentPicker from 'react-native-document-picker' ; 
import FileViewer from 'react-native-file-viewer' ; 
import { testReading } from '../../lib/modules/FileManager.ts' ; 

type Props = NativeStackScreenProps<AppStackParamList, "Testing">

export function TestingScreen( { params , navigation } : Props ) { 

  const static_filename = 'hellowolrd' ; 
  var RNFS = require( 'react-native-fs' ) ; 

  const getFileDirectory = async () => {
    console.log("Fetching directory") ;
    console.log("Finished fetching") ;

    try {
      const { uri } = await DocumentPicker.pickDirectory({ requestLongTermAccess: false, }) ;
      console.log(uri) ;
      const path =  `${RNFS.DocumentDirectoryPath}/test.txt` ; 
      await RNFS.writeFile(path , 'Hello world' , 'utf8');
      console.log('Wrote file at', path) ;
      await FileViewer.open(path) ;
      console.log('Opened file') ;
    } catch (error) {
      console.log('error occured while fetching directory' , error ) ;
    }
  }

  const viewFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles]
      }); 
      console.log(res) ;
      await FileViewer.open(res.uri) ; 
    } catch (e) {
      console.log('Error occured while referrencing value' , e) ;
    }
  }

  const writeFile = async ( filename : string ) : void => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${filename}`
      await RNFS.writeFile(path , 'Hello world' , 'utf8');
    } catch (e) {
      console.log(e) ;
    }

  }



  const readFile = async ( filename : string = 'test.png')  =>
  {
    try {
      const res = await testReading( filename ) ;
      console.log('Bytes recieved: ', res.data.byteLength) ;
    } catch (e) {
      console.log(e) ;
    }
  }

  return(
    <>
      <View style={ styles.container }>
        <Button
          title="Press"
          onPress={ () => readFile()}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1 ,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

