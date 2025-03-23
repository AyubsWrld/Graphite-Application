import { DocumentPickerResponse } from 'react-native-document-picker';
import * as DocumentPicker from 'react-native-document-picker';
import { UploadProgress, Dimension } from "../../lib/types/FileTypes"; 
import { FILE_ERROR } from "../../lib/types/ErrorTypes"; 
import FileContainer from "../../lib/models/FileContainer"; 
import Image from "../../lib/models/Image"; 
import Video from "../../lib/models/Video"; 
import Document from "../../lib/models/Document";
import { AppDataSource } from "../../utils/database/data-source";
import { Image as ImageTable } from "../../utils/database/entities/Image";
import { Document as DocumentTable } from "../../utils/database/entities/Document";

const ESP32_IP = "192.168.1.83"; 
const ESP32_PORT = 5000;

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
  await initializeDatabase();
  
  try {
    const results = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
      copyTo: 'documentDirectory',
    });
    
    const fileType = getFileCategory(results.type);
    console.log("Results: " , results) ; 
    const extension = getFileExtension(results.name || "", results.type);
    
    let file: FileContainer;
    
    if (fileType === "image") {
      // For images, you might need to get dimensions
      file = createImage(
        results.name || "image",
        results.size || 0,
        { width: 0, height: 0 }, 
        results.fileCopyUri || results.uri,
        extension
      );
      
      if (file instanceof Image) {
        const result = await file.loadBinaryData();
        if (result !== FILE_ERROR.FILE_SUCCESS) {
          throw new Error("Failed to load image binary data");
        }
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

export const writeFile = async (file: FileContainer): Promise<FILE_ERROR> => {
  // Ensure the database is initialized
  await initializeDatabase();
  
  try {
    if (!file.binaryData) {
      const loadResult = await file.loadBinaryData();
      if (loadResult !== FILE_ERROR.FILE_SUCCESS) {
        console.error("Error loading binary data:", loadResult);
        return loadResult;
      }
    }
    
    // For document files, we'll use our TCP implementation to upload to ESP32
    if (file instanceof Document) {
      const uploadResult = await file.uploadFile(ESP32_IP, ESP32_PORT);
      if (uploadResult.status !== FILE_ERROR.FILE_SUCCESS) {
        console.error("Error uploading file to ESP32:", uploadResult.status);
        return uploadResult.status;
      }
    } else {
      // For other file types (images, videos), implement TCP handling as needed
      console.warn("TCP implementation for non-document file types not yet implemented");
      return FILE_ERROR.FILE_NOT_IMPLEMENTED;
    }
    
    // Save metadata to local database
    const saveResult = await file.saveFile();
    if (saveResult !== FILE_ERROR.FILE_SUCCESS) {
      console.error("Error during file metadata save operation:", saveResult);
      return saveResult;
    }
    
    console.log("File saved successfully:", file.fileName);
    return FILE_ERROR.FILE_SUCCESS;
  } catch (error) {
    console.error("Error saving file:", error);
    return FILE_ERROR.RESP_ERROR;
  }
};

// Function to read a file from ESP32
export const readFileFromESP32 = async (fileName: string): Promise<{data: ArrayBuffer | null, error: FILE_ERROR}> => {
  const TcpSocket = require('react-native-tcp-socket');
  
  return new Promise((resolve) => {
    const client = TcpSocket.createConnection({
      host: ESP32_IP,
      port: ESP32_PORT
    }, () => {
      console.log(`Connected to ESP32 server to read file: ${fileName}`);
      
      // Send filename first
      client.write(fileName);
      
      // Wait for server acknowledgment
      let dataBuffer: Buffer[] = [];
      let receivedAck = false;
      let receivedCommandAck = false;
      
      client.on('data', (data) => {
        const response = data.toString('utf8');
        
        if (!receivedAck) {
          console.log('Initial server response:', response);
          receivedAck = true;
          
          // Send read command to ESP32
          client.write('read');
        } else if (!receivedCommandAck) {
          console.log('Command acknowledgment:', response);
          receivedCommandAck = true;
          
          // Now we'll start receiving file data
        } else {
          // Accumulate file data
          dataBuffer.push(data);
        }
      });
      
      client.on('error', (error) => {
        console.error('Error reading from ESP32:', error);
        client.destroy();
        resolve({data: null, error: FILE_ERROR.RESP_ERROR});
      });
      
      client.on('close', () => {
        console.log('Connection closed, processing received data');
        
        if (dataBuffer.length > 0) {
          // Combine all received buffers
          const combinedLength = dataBuffer.reduce((total, buf) => total + buf.length, 0);
          const combinedBuffer = Buffer.concat(dataBuffer, combinedLength);
          
          // Convert Buffer to ArrayBuffer
          const arrayBuffer = combinedBuffer.buffer.slice(
            combinedBuffer.byteOffset, 
            combinedBuffer.byteOffset + combinedBuffer.length
          );
          
          resolve({data: arrayBuffer, error: FILE_ERROR.FILE_SUCCESS});
        } else {
          resolve({data: null, error: FILE_ERROR.RESP_ERROR});
        }
      });
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

// Function to delete a file from ESP32
export const deleteFileFromESP32 = async (fileName: string): Promise<FILE_ERROR> => {
  const TcpSocket = require('react-native-tcp-socket');
  
  return new Promise((resolve) => {
    const client = TcpSocket.createConnection({
      host: ESP32_IP,
      port: ESP32_PORT
    }, () => {
      console.log(`Connected to ESP32 server to delete file: ${fileName}`);
      
      // Send filename first
      client.write(fileName);
      
      // Wait for server acknowledgment
      let receivedAck = false;
      
      client.on('data', (data) => {
        const response = data.toString('utf8');
        
        if (!receivedAck) {
          console.log('Initial server response:', response);
          receivedAck = true;
          
          // Send delete command to ESP32
          client.write('delete');
        } else {
          console.log('Delete response:', response);
          
          if (response === 'OK') {
            client.end();
            resolve(FILE_ERROR.FILE_SUCCESS);
          } else {
            client.end();
            resolve(FILE_ERROR.FILE_NOT_FOUND);
          }
        }
      });
      
      client.on('error', (error) => {
        console.error('Error connecting to ESP32:', error);
        client.destroy();
        resolve(FILE_ERROR.RESP_ERROR);
      });
    });
  });
};

export { initializeDatabase };

