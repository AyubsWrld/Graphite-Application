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


  async uploadFile(uploadUrl: string, onProgress?: (progress: UploadProgress) => void): Promise<FILE_ERROR> {
    try {
      const formData = this.getFormData();
      formData.append("file", { uri: this.uri, type: `${this.getFileType()}/${this.extension}`, name: this.fileName });

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              onProgress({ bytesUploaded: event.loaded, totalBytes: event.total, percentage: (event.loaded / event.total) * 100 });
            }
          };
        }

        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(FILE_ERROR.FILE_SUCCESS) : resolve(FILE_ERROR.UPLOAD_ERROR));
        xhr.onerror = () => resolve(FILE_ERROR.NETWORK_ERROR);
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return FILE_ERROR.UPLOAD_ERROR;
    }
  }

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
