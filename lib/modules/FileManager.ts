import { launchImageLibrary } from "react-native-image-picker";
import { UploadProgress, Dimension } from "../../lib/types/FileTypes"; 
import { FILE_ERROR } from "../../lib/types/ErrorTypes"; 
import FileContainer from "../../lib/models/FileContainer"; 
import Image from "../../lib/models/Image"; 
import Video from "../../lib/models/Video"; 
import { AppDataSource } from "../../utils/database/data-source";
import { Image as ImageTable } from "../../utils/database/entities/Image";  

const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
  }
};

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
  // Ensure the database is initialized before proceeding
  await initializeDatabase();
  
  return new Promise((resolve, reject) => {
    const options = { mediaType: "any", includeBase64: false, maxHeight: 2000, maxWidth: 2000 };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        reject(new Error("User Cancelled"));
      } else if (response.error || !response || !response.assets?.[0]) {
        reject(new Error("Invalid response from asset library"));
      } else {
        const metadata = response.assets[0];
        const fileType = getFileCategory(metadata.type || ""); 

        let file: FileContainer;

        if (fileType === "video") {
          file = createVideo(
            metadata.fileName || "video",
            metadata.fileSize || 0,
            { width: metadata.width || 0, height: metadata.height || 0 },
            metadata.uri || "",
            (metadata.type || "").split("/")[1] || "mp4",
            metadata.duration || 0
          );
        } else {
          file = createImage(
            metadata.fileName || "image",
            metadata.fileSize || 0,
            { width: metadata.width || 0, height: metadata.height || 0 },
            metadata.uri || "",
            (metadata.type || "").split("/")[1] || "jpg"
          );
        }

        if (file instanceof Image) {
          const result = await file.loadBinaryData();
          if (result !== FILE_ERROR.FILE_SUCCESS) {
            reject(new Error("Failed to load image binary data"));
            return;
          }
        }

        resolve(file);
      }
    });
  });
};

export const loadImages = async (): Promise<ImageTable[]> => {
  // Ensure the database is initialized
  await initializeDatabase();
  
  try {
    const imageRepository = AppDataSource.getRepository(ImageTable);
    return await imageRepository.find(); 
  } catch (error) {
    console.error("Error loading images from database:", error);
    return [];
  }
};

export const clearDB = async () => {
  // Ensure the database is initialized
  await initializeDatabase();
  
  try {
    const imageRepository = AppDataSource.getRepository(ImageTable);
    await imageRepository.clear();
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

export const writeFile = async (file: FileContainer): Promise<FILE_ERROR> => {
  // Ensure the database is initialized
  await initializeDatabase();
  
  try {
    const saveResult = await file.saveFile();
    
    if (saveResult !== FILE_ERROR.FILE_SUCCESS) {
      console.error("Error during file save operation:", saveResult);
      return saveResult;
    }
    
    console.log("File saved successfully:", file.fileName);
    return FILE_ERROR.FILE_SUCCESS;
  } catch (error) {
    console.error("Error saving file:", error);
    return FILE_ERROR.RESP_ERROR;
  }
};

// Export the initialization function to be called at app startup
export { initializeDatabase };
