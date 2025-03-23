import { UploadProgress, Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes.ts" ; 

import { File as File_ } from "../../utils/database/entities/File" ; 
import { AppDataSource } from "../../utils/database/data-source" ; 

abstract class FileContainer {
  private filename_   : string;
  private filetype_   : string;
  private filesize_   : number;
  private dimensions_ : Dimension;
  private duration_   : number | null ;
  private uri_ : string;
  private extension_ : string;

  constructor(filename_: string, fileSize: number, dimensions: Dimension, uri: string, extension: string) {
    this.filename_ = fileName;
    this.fileSize = fileSize;
    this.dimensions = dimensions;
    this.uri = uri;
    this.extension = extension;
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

  setPath(filepath: string): FILE_ERROR 
  {

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
              
	  
	      var fname ; 
	      if( this.filename_.length >= 10 ){ fname = this.filename_.substring(0 , 10) + "." + this.extension ; }else{fname = this.fileName} 
	      console.log("Attempting to write filenmae : " , fname ) ; 
	      console.log("Spliced : " , this.filename_.substring( 0 , 10 )); 
	      console.log("Length : " , this.filename_.length) ; 
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

  async saveFile():FILE_ERROR ; 
  {
    const FileRepository = AppDataSource.getRepository( File_ ) ; 
    const fileInstance = new File_() ; 
    fileInstance.filename = this.filename_                         ; 
    fileInstance.filetype = this.filetype_                         ; 
    fileInstance.height   = this.dimensions_.height                ; 
    fileInstance.width    = this.dimensions_.width                 ; 
    fileInstance.duration = this.duration_ ? this.duration_ : null ; 
    fileInstance.uri      = this.uri_                              ; 
    try {
      const res = await
    } catch (error) {
        console.log(`Error occrued while saving file: ${error}`) ;
    }
  }
}

export default FileContainer;

