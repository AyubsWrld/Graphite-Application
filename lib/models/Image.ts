import FileContainer from "./FileContainer";
import { Dimension } from "../types/FileTypes";
import { FILE_ERROR } from "../types/ErrorTypes";
import { AppDataSource } from "../../utils/database/data-source";  // Corrected import
import { Image as ImageTable } from "../../utils/database/entities/Image";  // Corrected to Image entity

class Image extends FileContainer {
  constructor(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string) {
    super(fileName, fileSize, dimensions, uri, extension);
  }

  getFileType(): string {
    return "image";
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
