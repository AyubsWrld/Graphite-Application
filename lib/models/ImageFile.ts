import FileContainer from "./FileContainer";
import RNFS from 'react-native-fs';
import { Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes";
import { AppDataSource } from "../../utils/database/data-source";  // Corrected import
import { Image as ImageTable } from "../../utils/database/entities/Image";  // Corrected to Image entity

class ImageFile extends FileContainer {
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
  
async uploadFile(uploadUrl: string, onProgress?: (progress: UploadProgress) => void): Promise<FILE_ERROR> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create FormData to send with XMLHttpRequest
      const formData = new FormData();
      
      // File metadata
      const metadata = {
        fileName: this.fileName,
        fileSize: this.fileSize,
        height: this.dimensions.height,
        width: this.dimensions.width,
        extension: this.extension,
      };

      // Read the file as raw binary data (not base64)
      const filePath = this.uri; // Local URI of the file
      const rawBytes = await RNFS.readFile(filePath, 'base64'); // Read as base64

      // Convert the base64 string to raw binary data
      const binaryData = Buffer.from(rawBytes, 'base64'); // Convert from base64 to raw binary

      // Append the metadata and binary data to FormData
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('file', {
        uri: filePath,
        type: `image/${this.extension}`, // Adjust to the file type (e.g., 'image/png', 'video/mp4', etc.)
        name: this.fileName,
        data: binaryData, // Raw binary data
      });

      // Create XMLHttpRequest to send the FormData with raw binary
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      // Progress tracking (optional)
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress({ progress });
          }
        };
      }

      // Handle the response from the server
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('File uploaded successfully:', xhr.responseText);
          resolve(FILE_ERROR.FILE_SUCCESS); // Success
        } else {
          console.error('Error uploading file:', xhr.status, xhr.responseText);
          reject(FILE_ERROR.FILE_UPLOAD_FAILED); // Failure
        }
      };

      // Handle network error
      xhr.onerror = () => {
        console.error('Network error while uploading file');
        reject(FILE_ERROR.FILE_UPLOAD_FAILED);
      };

      // Send the FormData with raw binary data
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      reject(FILE_ERROR.FILE_UPLOAD_FAILED);
    }
  });
}

  // async uploadFile(uploadUrl: string, onProgress?: (progress: UploadProgress) => void): Promise<FILE_ERROR> {
  //     return new Promise((resolve, reject) => {
  //         const formData = new FormData();
  //
  //         const metadata = {
  //             fileName: this.fileName,
  //             fileSize: this.fileSize,
  //             height: this.dimensions.height,
  //             width: this.dimensions.width,
  //             extension: this.extension
  //         };
  //
  //         // Add the metadata and file to FormData
  //         formData.append('metadata', JSON.stringify(metadata));
  //         formData.append('file', this.file); 
  //
  //         const xhr = new XMLHttpRequest();
  //         xhr.open("POST", uploadUrl);
  //
  //         // Progress tracking
  //         if (onProgress) {
  //             xhr.upload.onprogress = (event) => {
  //                 if (event.lengthComputable) {
  //                     const progress = Math.round((event.loaded / event.total) * 100);
  //                     onProgress({ progress });
  //                 }
  //             };
  //         }
  //
  //         xhr.onload = () => {
  //             if (xhr.status >= 200 && xhr.status < 300) {
  //                 console.log(`File uploaded successfully: ${xhr.responseText}`);
  //                 resolve(FILE_ERROR.FILE_SUCCESS);
  //             } else {
  //                 console.error("Error uploading file:", xhr.status, xhr.responseText);
  //                 reject(FILE_ERROR.FILE_UPLOAD_FAILED);
  //             }
  //         };
  //
  //         xhr.onerror = () => {
  //             console.error("Network error while uploading file");
  //             reject(FILE_ERROR.FILE_UPLOAD_FAILED);
  //         };
  //
  //         xhr.send(formData);
  //     });
  // }

  // async uploadFile(uploadUrl: string, onProgress?: (progress: UploadProgress) => void): Promise<FILE_ERROR> {
  //   console.log("Attempting to send file size");
  //   const obj = {
  //   fileName  : this.fileName ,
  //   fileSize  : this.fileSize ,
  //   height    : this.dimensions.height,
  //   width     : this.dimensions.width,
  //   extension : this.extension
  //   }
  //
  //   return new Promise((resolve, reject) => {
  //       const xhr = new XMLHttpRequest();
  //
  //       xhr.open("POST", uploadUrl);  // POST request to upload URL
  //
  //       xhr.setRequestHeader("Content-Type", "application/json");
  //
  //       // Progress tracking (optional)
  //       if (onProgress) {
  //           xhr.upload.onprogress = (event) => {
  //               if (event.lengthComputable) {
  //                   const progress = Math.round((event.loaded / event.total) * 100);
  //                   onProgress({ progress });
  //               }
  //           };
  //       }
  //
  //       // Handle the response
  //       xhr.onload = () => {
  //           if (xhr.status >= 200 && xhr.status < 300) {
  //               console.log(`File size uploaded: ${xhr.responseText}`);
  //               resolve(FILE_ERROR.FILE_SUCCESS);  // Success
  //           } else {
  //               console.error("Error uploading file size:", xhr.status, xhr.responseText);
  //               reject(FILE_ERROR.FILE_UPLOAD_FAILED);  // Failure
  //           }
  //       };
  //
  //       xhr.onerror = () => {
  //           console.error("Network error while uploading file size");
  //           reject(FILE_ERROR.FILE_UPLOAD_FAILED);
  //       };
  //
  //       xhr.send(JSON.stringify(obj));
  //   });
  // }

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

export default ImageFile;
