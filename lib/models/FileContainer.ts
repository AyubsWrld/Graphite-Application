import { UploadProgress, Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes.ts" ; 

abstract class FileContainer {
  protected fileName: string;
  protected fileSize: number;
  protected dimensions: Dimension;
  protected uri: string;
  protected extension: string;

  constructor(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string) {
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.dimensions = dimensions;
    this.uri = uri;
    this.extension = extension;
  }

  abstract getFileType(): string;
  abstract getDimensions(): Dimension;
  abstract getFileSize(): number;
  abstract setPath(filepath: string): FILE_ERROR;
  abstract saveFile(): Promise<FILE_ERROR>;

  protected getFormData(): FormData {
    const formData = new FormData();
    formData.append("fileName", this.fileName);
    formData.append("fileSize", this.fileSize.toString());
    formData.append("width", this.dimensions.width.toString());
    formData.append("height", this.dimensions.height.toString());
    formData.append("extension", this.extension);
    return formData;
  }

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
}

export default FileContainer;

