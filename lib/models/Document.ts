import FileContainer from "./FileContainer";
import { Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes";
import { AppDataSource } from "../../utils/database/data-source";
import { Document as DocumentTable } from "../../utils/database/entities/Document";
import TcpSocket from 'react-native-tcp-socket';

class Document extends FileContainer {
  constructor(fileName: string, fileSize: number, uri: string, extension: string) {
    // For documents, we can pass a default dimension since documents don't necessarily have dimensions
    const defaultDimension: Dimension = { width: 0, height: 0 };
    super(fileName, fileSize, defaultDimension, uri, extension);
  }

  getFileName(): string {
    return this.fileName;
  }

  setFileName(name: string): void {
    this.fileName = name;
  }

  getFileType(): string {
    return "document";
  }

  getDimensions(): Dimension {
    return this.dimensions;
  }

  getFileSize(): number {
    return this.fileSize;
  }

  setPath(filepath: string): FILE_ERROR {
    console.warn("setPath() not implemented");
    return FILE_ERROR.RESP_ERROR;
  }

  async loadBinaryData(): Promise<FILE_ERROR> {
    try {
      const response = await fetch(this.uri);
      const buffer = await response.arrayBuffer();
      this.binaryData = buffer;
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error("Error loading binary data:", error);
      return FILE_ERROR.RESP_ERROR;
    }
  }

  async uploadFile(serverIP: string, serverPort: number = 5000): Promise<{status: FILE_ERROR, filename: string}> {
    console.log(`Attempting to upload document to ESP32 at ${serverIP}:${serverPort}`);

    if (!this.binaryData) {
      console.error("No binary data available");
      return {status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""};
    }

    return new Promise((resolve, reject) => {
      // Create TCP socket connection
      const client = TcpSocket.createConnection({
        host: serverIP,
        port: serverPort,
        tls: false
      }, () => {
        console.log('Connected to ESP32 server');
        
        // First send filename to the server
        client.write(this.fileName);
        
        // Set up data handler to receive server responses
        client.on('data', (data) => {
          const response = data.toString('utf8');
          console.log('Response from server:', response);
          
          // If server acknowledges the filename, send the command
          if (response.includes('Filename received successfully')) {
            console.log('Sending write command to ESP32');
            client.write('write');
            
            // Wait for server to acknowledge the command
            client.once('data', (cmdResponse) => {
              const cmdResponseText = cmdResponse.toString('utf8');
              console.log('Command response:', cmdResponseText);
              
              if (cmdResponseText === 'OK') {
                // Send the actual file data
                console.log('Sending file data...');
                
                // Convert ArrayBuffer to Buffer for TCP transmission
                const fileBuffer = Buffer.from(this.binaryData);
                client.write(fileBuffer);
                
                // After sending all data, close the connection
                client.end();
                resolve({status: FILE_ERROR.FILE_SUCCESS, filename: this.fileName});
              } else {
                console.error('Server rejected write command:', cmdResponseText);
                client.destroy();
                reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
              }
            });
          } else {
            console.error('Failed to send filename to server');
            client.destroy();
            reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
          }
        });
      });

      client.on('error', (error) => {
        console.error('TCP socket error:', error);
        reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
      });
    });
  }

  async saveFile(): Promise<FILE_ERROR> {
    try {
      const DocumentRepository = AppDataSource.getRepository(DocumentTable);
      const documentEntity = new DocumentTable();
      
      // Use the current fileName which may have been updated by the server
      documentEntity.filename = this.fileName;
      documentEntity.extension = this.extension;
      documentEntity.uri = this.uri;
      documentEntity.abs_path = `/sdcard/${this.fileName}`;
      documentEntity.size = this.fileSize;

      await DocumentRepository.save(documentEntity);
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error("Error saving document:", error);
      return FILE_ERROR.RESP_ERROR;
    }
  }
}

export default Document;

