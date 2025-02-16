import FileContainer from "./FileContainer";
import { FILE_ERROR } from "../types/ErrorTypes.ts";
import { Dimension }  from "../types/FileTypes"
import { AppDataSource } from "../../utils/database/data-source.ts" ; 
import { Video as VideoTable } from "../../utils/database/entities/Video.ts" ; 

const MAX_FILE_SIZE : number = 4200000296 ; 

class Video extends FileContainer {

  private duration: number;

  constructor(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string, duration: number) {
    super(fileName, fileSize, dimensions, uri, extension);
    this.duration = duration;
  }

  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

  getFileType(): string {

    return "video";
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
  * @signature :  uploadFile( url : string )  
  * @purpose   :  uploads file to remote server @ url  . 
  * @params    :  url : string delineated ipv4 address of esp32 ( 192.167.x.x) ;
  * @return    :  SERILALIZATION_ERRROR :  Error code representing whether or not the file was uploaded successfully
  */

  uploadFile( url : string): FILE_ERROR { 
    if (this.fileSize > MAX_FILE_SIZE ) { 
      throw new Error("File size too large") ;
    }
    console.log(`FILE : Attempting to upload ${this.fileName} to ${url} `) ; 
    return FILE_ERROR.FILE_SUCCESS ; 
  }


  /*
  * @signature :  
  * @purpose   :  
  * @params    :  
  * @return    :  
  */

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
