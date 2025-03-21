import { DocumentPickerResponse, DocumentPickerOptions, types } from 'react-native-document-picker';
import * as DocumentPicker from 'react-native-document-picker';
import { UploadProgress, Dimension } from "../../lib/types/FileTypes"; 
import { FILE_ERROR } from "../../lib/types/ErrorTypes"; 
import FileContainer from "../../lib/models/FileContainer"; 
import Image from "../../lib/models/Image"; 
import Video from "../../lib/models/Video"; 
import Document from "../../lib/models/Document"; // You'll need to create this model
import { AppDataSource } from "../../utils/database/data-source";
import { Image as ImageTable } from "../../utils/database/entities/Image";
import { Document as DocumentTable } from "../../utils/database/entities/Document"; // You'll need to create this entity

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

const createDocument = (
  fileName: string,
  fileSize: number,
  uri: string,
  extension: string
): FileContainer => {
  // Assuming Document class extends FileContainer
  return new Document(fileName, fileSize, uri, extension);
};

const getFileCategory = (type: string | null): string => {
  if (!type) return "unknown";
  
  if (type.startsWith("image/")) {
    return "image";
  } else if (type.startsWith("video/")) {
    return "video";
  } else {
    return "document";
  }
};

const getFileExtension = (fileName: string, type: string | null): string => {
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop() || "";
  }
  
  if (type) {
    return type.split('/')[1] || "";
  }
  
  return "";
};

export const openDocumentPicker = async (): Promise<FileContainer> => {
  // Ensure the database is initialized before proceeding
  await initializeDatabase();
  
  try {
    const results = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
      copyTo: 'documentDirectory',
    });
    
    const fileType = getFileCategory(results.type);
    const extension = getFileExtension(results.name || "", results.type);
    
    let file: FileContainer;
    
    if (fileType === "image") {
      // For images, you might need to get dimensions
      file = createImage(
        results.name || "image",
        results.size || 0,
        { width: 0, height: 0 }, // You may need to use a library like react-native-image-size to get actual dimensions
        results.fileCopyUri || results.uri,
        extension
      );
      
      if (file instanceof Image) {
        const result = await file.loadBinaryData();
        if (result !== FILE_ERROR.FILE_SUCCESS) {
          throw new Error("Failed to load image binary data");
        }
        
        // You might want to update dimensions here after loading
      }
    } else if (fileType === "video") {
      file = createVideo(
        results.name || "video",
        results.size || 0,
        { width: 0, height: 0 }, // Would need additional processing to get video dimensions
        results.fileCopyUri || results.uri,
        extension,
        0 // Would need additional processing to get video duration
      );
    } else {
      // For any other document type
      file = createDocument(
        results.name || "document",
        results.size || 0,
        results.fileCopyUri || results.uri,
        extension
      );
    }
    
    return file;
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      throw new Error("User Cancelled");
    } else {
      throw new Error(`Error picking document: ${err.message}`);
    }
  }
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

// Add function to load documents if needed
export const loadDocuments = async (): Promise<DocumentTable[]> => {
  // Ensure the database is initialized
  await initializeDatabase();
  
  try {
    const documentRepository = AppDataSource.getRepository(DocumentTable);
    return await documentRepository.find(); 
  } catch (error) {
    console.error("Error loading documents from database:", error);
    return [];
  }
};

export const clearDB = async () => {
  // Ensure the database is initialized
  await initializeDatabase();
  
  try {
    const imageRepository = AppDataSource.getRepository(ImageTable);
    await imageRepository.clear();
    
    // If you have a document repository
    const documentRepository = AppDataSource.getRepository(DocumentTable);
    await documentRepository.clear();
    
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
