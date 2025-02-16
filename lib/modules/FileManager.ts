import { launchImageLibrary } from "react-native-image-picker";
import { UploadProgress, Dimension } from "../../lib/types/FileTypes" ; 
import { FILE_ERROR } from "../../lib/types/ErrorTypes" ; 
import FileContainer from "../../lib/models/FileContainer" ; 
import Image from "../../lib/models/Image" ; 
import Video from "../../lib/models/Video" ; 

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

const createImage = (
  fileName: string,
  fileSize: number,
  dimensions: Dimension,
  uri: string,
  extension: string
): FileContainer => {
  return new Image(fileName, fileSize, dimensions, uri, extension);
};

const getFileCategory = (value: string): string => {
  return value.split("/")[0];
};

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

        resolve(file); // Return the created file object
      }
    });
  });
};

export const writeFile = async (file: FileContainer): Promise<FILE_ERROR> => {
  try {
    // Attempt to save the file locally
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

export const uploadFileToServer = async (
  file: FileContainer,
  uploadUrl: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<FILE_ERROR> => {
  try {
    // First save the file locally
    const saveResult = await writeFile(file);
    if (saveResult !== FILE_ERROR.FILE_SUCCESS) {
      return saveResult; // If save failed, return the error code
    }

    console.log("File saved locally, now uploading...");

    // Then upload the file
    return await file.uploadFile(uploadUrl, onProgress);
  } catch (error) {
    console.error("Error during upload:", error);
    return FILE_ERROR.UPLOAD_ERROR;
  }
};
