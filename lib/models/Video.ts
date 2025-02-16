import FileContainer from "./FileContainer";
import { FILE_ERROR, Dimension } from "../types/FileTypes";
import { AppDataSource } from "../../utils/database/data-source.ts" ; 
import { Video as VideoTable } from "../../utils/database/entities/Video.ts" ; 

class Video extends FileContainer {
  private duration: number;

  constructor(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string, duration: number) {
    super(fileName, fileSize, dimensions, uri, extension);
    this.duration = duration;
  }
  getFileType(): string {

    return "video";
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
      const VideoRepository = AppDataSource.getRepository(VideoTable) ; 
      const videoEntity = new VideoTable();
      videoEntity.filename = this.fileName;
      videoEntity.height = this.dimensions.height;
      videoEntity.width = this.dimensions.width;
      videoEntity.extension = this.extension;
      videoEntity.uri = this.uri;
      videoEntity.duration = this.duration;
      videoEntity.abs_path = `/sdcard/${this.fileName}`;

      await VideoRepository.save(videoEntity);
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error("Error saving video:", error);
      return FILE_ERROR.RESP_ERROR;
    }
  }
}

export default Video ;
