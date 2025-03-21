import FileContainer from "./FileContainer";
import { Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes";
import { AppDataSource } from "../../utils/database/data-source";
import { Document as DocumentTable } from "../../utils/database/entities/Document";

class Document extends FileContainer {
  constructor(fileName: string, fileSize: number, uri: string, extension: string) {
    // For documents, we can pass a default dimension since documents don't necessarily have dimensions
    const defaultDimension: Dimension = { width: 0, height: 0 };
    super(fileName, fileSize, defaultDimension, uri, extension);
  }

  /*
  * @signature : getFileName(): string
  * @purpose   : Returns the name of the document file
  * @params    : None
  * @return    : The file name as a string
  */
  getFileName(): string {
    return this.fileName;
  }

  /*
  * @signature : setFileName(name: string): void
  * @purpose   : Sets the name of the document file
  * @params    : name - The new file name
  * @return    : None
  */
  setFileName(name: string): void {
    this.fileName = name;
  }

  /*
  * @signature : getFileType(): string
  * @purpose   : Returns the type of the file
  * @params    : None
  * @return    : The string "document"
  */
  getFileType(): string {
    return "document";
  }

  /*
  * @signature : getDimensions(): Dimension
  * @purpose   : Returns the dimensions of the document (Default values for documents)
  * @params    : None
  * @return    : Dimension object with width and height
  */
  getDimensions(): Dimension {
    return this.dimensions;
  }

  /*
  * @signature : getFileSize(): number
  * @purpose   : Returns the size of the document file in bytes
  * @params    : None
  * @return    : The file size as a number
  */
  getFileSize(): number {
    return this.fileSize;
  }

  /*
  * @signature : setPath(filepath: string): FILE_ERROR
  * @purpose   : Sets the file path for the document (Not implemented)
  * @params    : filepath - The path to set
  * @return    : FILE_ERROR enum value
  */
  setPath(filepath: string): FILE_ERROR {
    console.warn("setPath() not implemented");
    return FILE_ERROR.RESP_ERROR;
  }

  /*
  * @signature : async loadBinaryData(): Promise<FILE_ERROR>
  * @purpose   : Loads the binary data of the document from the URI
  * @params    : None
  * @return    : Promise resolving to a FILE_ERROR enum value
  */
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

  /*
  * @signature : async uploadFile(uploadUrl: string): Promise<{status: FILE_ERROR, filename: string}>
  * @purpose   : Uploads the document to the specified URL
  * @params    : uploadUrl - The URL to upload the document to
  * @return    : Promise resolving to an object with status and filename
  */
  async uploadFile(uploadUrl: string): Promise<{status: FILE_ERROR, filename: string}> {
    console.log("Attempting to upload document as raw binary data");

    if (!this.binaryData) {
      console.error("No binary data available");
      return {status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""};
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);

      // Set appropriate content type based on file extension
      xhr.setRequestHeader("Content-Type", `application/${this.extension}`);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.filename) {
              this.fileName = response.filename.split(".")[0];
              console.log("Received filename:", this.fileName);
              resolve({status: FILE_ERROR.FILE_SUCCESS, filename: this.fileName});
            } else {
              console.error("Response doesn't contain filename", xhr.responseText);
              resolve({status: FILE_ERROR.FILE_SUCCESS, filename: this.fileName});
            }
          } catch (error) {
            console.error("Error parsing response:", error);
            resolve({status: FILE_ERROR.FILE_SUCCESS, filename: this.fileName});
          }
        } else {
          console.error("Error uploading binary data:", xhr.status, xhr.responseText);
          reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
        }
      };

      xhr.onerror = () => {
        console.error("Network error while uploading binary data");
        reject({status: FILE_ERROR.FILE_UPLOAD_FAILED, filename: ""});
      };

      // Send the binary data as the body of the request
      xhr.send(this.binaryData);
    });
  }

  /*
  * @signature : async saveFile(): Promise<FILE_ERROR>
  * @purpose   : Saves the document information to the database
  * @params    : None
  * @return    : Promise resolving to a FILE_ERROR enum value
  */
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
