import { launchImageLibrary } from "react-native-image-picker";
import { UploadProgress, Dimension } from "../../lib/types/FileTypes" ; 
import { FILE_ERROR } from "../../lib/types/ErrorTypes" ; 
import FileContainer from "../../lib/models/FileContainer" ; 
import Image from "../../lib/models/Image" ; 
import Video from "../../lib/models/Video" ; 


/*
 * @signature :  createVideo( @params ) 
 * @purpose   :  uploads file to remote server @ url  . 
 * @params    :  fileName  : Name of file . 
 * @params    :  fileSize  : Size of file in bytes . 
 * @params    :  dimension : tuple object containing ( height : width ) . 
 * @params    :  uri       : uri of video on local device . 
 * @params    :  extension : file extension of the selected video  . 
 * @params    :  duration  : Duration of video in seconds . 
 * @return    :  FileContainer :  Video concrete class 
*/

const createVideo = (
  fileName: string,
  fileSize: number,
  dimensions: Dimension,
  uri: string,
  extension: string,
  duration: number
): FileContainer => {
  return new Video(fileName, fileSize, dimensions, uri, extension, duration);
};


/*
 * @purpose   :  createVideo( @params ) 
 * @signature :  Creates a new Image object container . 
 * @params    :  fileName  : Name of file . 
 * @params    :  fileSize  : Size of file in bytes . 
 * @params    :  dimension : tuple object containing ( height : width ) . 
 * @params    :  uri       : uri of video on local device . 
 * @params    :  extension : file extension of the selected video  . 
 * @return    :  FileContainer :  Image concrete class 
*/

const createImage = (
  fileName: string,
  fileSize: number,
  dimensions: Dimension,
  uri: string,
  extension: string
): FileContainer => {
  return new Image(fileName, fileSize, dimensions, uri, extension);
};

/*
 * @signature :  getFileCategory( value ) .
 * @purpose   :  Derives the media type of a file given the string return from openImagePicker ( "image" , "video" ) .
 * @params    :  value : unparsed string returned from openImagePicker object ( "image/jpg" )  .
 * @return    :  String representing the media type  .
*/

const getFileCategory = (value: string): string => {
  return value.split("/")[0];
};


/*
 * @signature :  openImagePicker() 
 * @purpose   :  utilizes react-native-image-picker to select a media source from the users camera and parses it as a class object . 
 * @return    :  FILE_ERROR :  Error code representing whether or not the file parsing was successful . 
*/

export const openImagePicker = async (): Promise<FileContainer> => {
  return new Promise((resolve, reject) => {
    const options = { mediaType: "any", includeBase64: false, maxHeight: 2000, maxWidth: 2000 };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        reject(new Error("User Cancelled"));
      } else if (response.error || !response || !response.assets?.[0]) {
        reject(new Error("Invalid response from asset library"));
      } else {
        const metadata = response.assets[0];
        const fileType = getFileCategory(metadata.type); // Determine file category

        let file: FileContainer;

        if (fileType === "video") {
          file = createVideo(
            metadata.fileName,
            metadata.fileSize,
            { width: metadata.width, height: metadata.height },
            metadata.uri,
            metadata.type.split("/")[1],
            metadata.duration
          );
        } else {
          file = createImage(
            metadata.fileName,
            metadata.fileSize,
            { width: metadata.width, height: metadata.height },
            metadata.uri,
            metadata.type.split("/")[1]
          );
        }

        resolve(file); 
      }
    });
  });
};

/*
 * @signature :  writeFile( file : FileContainer ) 
 * @purpose   :  Writes file details to local sql db utiilzing the FileContainer objects member variables passed in as a parameter . 
 * @param     :  FileContainer object . 
 * @return    :  FILE_ERROR :  Error code representing whether or not the file writing was successful or not . 
*/

export const writeFile = async (file: FileContainer): Promise<FILE_ERROR> => {
  try {
    const saveResult = await file.saveFile();
    if (saveResult !== FILE_ERROR.FILE_SUCCESS) {
      return saveResult; // If saving failed, return the error code
    }
    console.log("File saved successfully:", file.fileName);
    return FILE_ERROR.FILE_SUCCESS;
  } catch (error) {
    console.error("Error saving file:", error);
    return FILE_ERROR.RESP_ERROR;
  }
};


