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

  abstract getFileName(): string;
  abstract getFileType(): string;
  abstract getDimensions(): Dimension;
  abstract getFileSize(): number;
  abstract setPath(filepath: string): FILE_ERROR;
  abstract uploadFile( url : string): FILE_ERROR;
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

}

export default FileContainer;

