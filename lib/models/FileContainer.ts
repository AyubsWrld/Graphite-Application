import { UploadProgress, Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes.ts" ; 
import { FileData as File_ } from "../../utils/database/entities/FileData.ts" ; 
import { AppDataSource } from "../../utils/database/data-source" ; 
import TcpSocket from 'react-native-tcp-socket';

class FileContainer {
  private filename_   : string;
  private filetype_   : string;
  private filesize_   : number;
  private dimensions_ : Dimension;
  private uri_ : string;
  private extension_ : string;
  private binaryData?: ArrayBuffer;

  constructor(
    fileName : string,
    fileSize: number,
    dimensions: Dimension,
    fileType : string ,
    uri: string,
    extension: string
  ) {
    this.filename_ = fileName ;
    this.filesize_ = fileSize;
    this.dimensions_ = dimensions;
    this.filetype_ = fileType;
    this.uri_ = uri;
    this.extension_ = extension;
  }

  getFileName(): string 
  {
    return this.filename_ ;
  }
  getFileType(): string 
  {
    return this.filetype_ ;
  }
  getDimensions(): Dimension 
  {
    return this.dimensions_ ;
  }

  getFileSize(): number 
  {
    return this.filesize_ ;
  }

  getUri() : string | null 
  {
    return this.uri_ ? this.uri_ : null ; 
  }
  setPath(filepath: string): FILE_ERROR 
  {
    return FILE_ERROR.FILE_SUCCESS; 
  }
  getExtension() : string {
    return this.extension_ ; 
  }


  async loadBinaryData(): Promise<FILE_ERROR> {
    if ( !this.uri_ ) {
      console.log("could not find uri") ;
    }
    try {
      const response = await fetch( this.uri_ );  
      const buffer = await response.arrayBuffer();  
      console.log("Buffer len" , buffer.byteLength); 
      this.binaryData = buffer;  
      console.log("Successfully loaded binary data, length:");
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
          const client = TcpSocket.createConnection({
              host: serverIP,
              port: serverPort,
              tls: false
          }, () => {
              console.log('Connected to ESP32 server');
              

	      console.log("Attempting to write filenmae : " , this.filename_ ) ; 
              client.write( this.filename_ );
              
              // Set up data handler for all responses
              client.on('data', (data) => {
                  const response = data.toString('utf8');
                  console.log('Response from server:', response);
                  
                  if (response.includes('Filename received successfully')) {
                      console.log('Sending write command to ESP32');
                      client.write('write');
                  } 
                  else if (response === 'OK') {
                      // Send the actual file data throws here 
                      console.log('Sending file data: ' , this.binaryData);
		      console.log("Socket status: " , client.destroyed);
                      const fileBuffer = Buffer.from(this.binaryData);
                      client.write(fileBuffer);
                      
                      // Don't end the connection yet - wait for upload confirmation
                      // We'll add a timeout instead
                  } 
                  else if (response === 'UPLOAD_COMPLETE') {
                      // Only close the connection after success confirmation
                      client.end();
                      resolve({status: FILE_ERROR.FILE_SUCCESS, filename: this.filename_});
                  }
                  else {
                      console.error('Unexpected server response:', response);
                      client.destroy();
                      reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
                  }
              });
          });

          setTimeout(() => {
              if (client.destroyed === false) {
                  console.error('Upload timed out');
                  client.destroy();
                  reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
              }
          }, 30000); 

          client.on('error', (error) => {
              console.error('TCP socket error:', error);
              reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
          });
          
          client.on('close', (hasError) => {
              if (hasError) {
                  console.error('Connection closed with error');
                  reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
              }
          });
      });
  }

  

  async saveFile(): Promise<FILE_ERROR> {
    const FileRepository = AppDataSource.getRepository(File_); 
    const fileInstance = new File_();
    fileInstance.filename = this.filename_;
    fileInstance.filetype = this.filetype_;
    fileInstance.height = this.dimensions_.height;
    fileInstance.width = this.dimensions_.width;
    fileInstance.uri = this.uri_;
    fileInstance.extension = this.extension_;
    fileInstance.abs_path = "sdcard/";
    
    try {
      const res = await FileRepository.save(fileInstance);
      console.log("Saved file successfully");
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.log(`Error occurred while saving file: ${error}`);
      return FILE_ERROR.FILE_WRITE_ERROR;
    }
  }

}


export default FileContainer;

