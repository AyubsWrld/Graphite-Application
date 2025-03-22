import FileContainer from "./FileContainer";
import { Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes";
import { AppDataSource } from "../../utils/database/data-source";  // Corrected import
import { Image as ImageTable } from "../../utils/database/entities/Image";  // Corrected to Image entity
import TcpSocket from 'react-native-tcp-socket';

class Image extends FileContainer {
  constructor(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string) {
    super(fileName, fileSize, dimensions, uri, extension);
  }

  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */


  getFileName(): string {
    return this.fileName ; 
  }

  setFileName(name: string) {
    this.fileName = name; // Use this.fileName instead of this.filename
  }
  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  getFileType(): string {
    return "image";
  }

  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  getDimensions(): Dimension { return this.dimensions;
  }

  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  getFileSize(): number {
    return this.fileSize;
  }


  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  setPath(filepath: string): FILE_ERROR {
    console.warn("setPath() not implemented");
    return FILE_ERROR.RESP_ERROR;
  }

  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  // async uploadFile( 
  //   uploadUrl : string , 
  //   onProgress? : ( progess : UploadProgress )  => void 
  // ): Promise<FILE_ERROR> { 
  //   console.log(`FILE : Attempting to upload ${this.fileName} to ${url} `) ; 
  //   return FILE_ERROR.FILE_SUCCESS ; 
  // }

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
              
              // First send filename to the server
	  
	      var fname ; 
	      if( this.fileName.length >= 10 ){ fname = this.fileName.substring(0 , 10) + "." + this.extension ; }else{fname = this.fileName} 
	      console.log("Attempting to write filenmae : " , fname ) ; 
	      console.log("Spliced : " , this.fileName.substring( 0 , 10 )); 
	      console.log("Length : " , this.fileName.length) ; 
              client.write( fname );
              
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
                      resolve({status: FILE_ERROR.FILE_SUCCESS, filename: this.fileName});
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

  async loadBinaryData(): Promise<FILE_ERROR> {
    try {
      const response = await fetch(this.uri);  
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

  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */


  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  async saveFile(): Promise<FILE_ERROR> {
    try {
      const ImageRepository = AppDataSource.getRepository(ImageTable);
      const imageEntity = new ImageTable();
      
      // Use the current fileName which may have been updated by the server
      imageEntity.filename = this.fileName;
      imageEntity.height = this.dimensions.height;
      imageEntity.width = this.dimensions.width;
      imageEntity.extension = this.extension;
      imageEntity.uri = this.uri;
      imageEntity.abs_path = `/sdcard/${this.fileName}`;

      await ImageRepository.save(imageEntity);  
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error("Error saving image:", error);
      return FILE_ERROR.RESP_ERROR;
    }
  }
  }

export default Image;
