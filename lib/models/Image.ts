import FileContainer from "./FileContainer";
import { Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes";
import { AppDataSource } from "../../utils/database/data-source";  // Corrected import
import { Image as ImageTable } from "../../utils/database/entities/Image";  // Corrected to Image entity

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

  getDimensions(): Dimension {
    return this.dimensions;
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


  async uploadBinary( bytes : number  , uploadUrl : string )  : Promise<FILE_ERROR>{ 

    // Create new xhr object 
  
    const rawData : number = 1234 ; 
    const xhr = new XMLHttpRequest() ; 

    return new Promise((resolve , reject) => {

      xhr.open( "POST" , uploadUrl ) ; 
      xhr.setRequestHeader("Content-Type" ,`image/${this.extension}`) ; 
      xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300){
          console.log("Success , response : " , xhr.responseText) ; 
          resolve(FILE_ERROR.FILE_SUCCESS) ; 
        }
        else{
          console.error("Reject, response : " , xhr.responseText) ; 
          reject(FILE_ERROR.FILE_UPLOAD_FAILED) ; 
        }
      };

      xhr.onerror = () => {
        console.error("Network error , response : " , xhr.responseText) ; 
        reject(FILE_ERROR.FILE_UPLOAD_FAILED) ; 
      } ; 
      xhr.send(rawData) ; 
    });
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

async uploadFile(uploadUrl: string): Promise<FILE_ERROR> {
  console.log("Attempting to upload image as raw binary data");

  if (!this.binaryData) {
    console.error("No binary data available");
    return FILE_ERROR.FILE_UPLOAD_FAILED;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    // Set the appropriate content type (for your image)
    xhr.setRequestHeader("Content-Type", `image/${this.extension}`);

    // Handle the response
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("Upload success:", xhr.responseText);
        resolve(FILE_ERROR.FILE_SUCCESS);
      } else {
        console.error("Error uploading binary data:", xhr.status, xhr.responseText);
        reject(FILE_ERROR.FILE_UPLOAD_FAILED);
      }
    };

    xhr.onerror = () => {
      console.error("Network error while uploading binary data");
      reject(FILE_ERROR.FILE_UPLOAD_FAILED);
    };

    // Send the binary data as the body of the request
    xhr.send(this.binaryData);
  });
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
      imageEntity.filename = this.fileName;
      imageEntity.height = this.dimensions.height;
      imageEntity.width = this.dimensions.width;
      imageEntity.extension = this.extension;
      imageEntity.uri = this.uri;
      imageEntity.abs_path = `/sdcard/${this.fileName}`;

      await ImageRepository.save(imageEntity);  // Save the image entity to the database
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error("Error saving image:", error);
      return FILE_ERROR.RESP_ERROR;
    }
  }
}

export default Image;
