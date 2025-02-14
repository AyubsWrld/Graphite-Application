
import { launchCamera , launchImageLibrary } from "react-native-image-picker" ; 
import { AppDataSource } from "../utils/database/data-source.ts"  ;  
import { Image as ImageTable } from "../utils/database/entities/Image.ts" ; 
import { Video as VideoTable } from "../utils/database/entities/Video.ts" ; 


const FILE_MANAGER_DBG = "FILE_MANAGER" ; 
const ImageRepository = AppDataSource.getRepository(ImageTable) ; 
const VideoRepository = AppDataSource.getRepository(VideoTable) ; 

export enum FILE_ERROR { 
  FILE_SUCCESS = 0 , 
  USER_CANCEL  = 1 , 
  RESP_ERROR   = 2 , 
}

type ErrorMessage = { 
  errorFlag    : FILE_ERROR ;
  errorMessage : string     ;
}

let ERROR_MAP: ErrorMessage[] = [
  { errorFlag: FILE_ERROR.FILE_SUCCESS, errorMessage: "Success" },
  { errorFlag: FILE_ERROR.USER_CANCEL, errorMessage: "User Cancelled" },
];

type Dimension  = { 
  width  : number ; 
  height : number ; 
}

abstract class FileContainer {
  protected fileName   : string    ;
  protected path       : string    ;
  protected fileSize   : number    ;
  protected dimensions : Dimension ;
  protected uri        : string    ;
  protected extension  : string    ;

  constructor(
    fileName   : string    ,
    fileSize   : number    ,
    dimensions : Dimension ,
    uri        : string    ,
    extension  : string    
  ) {
    this.fileName   = fileName   ;
    this.fileSize   = fileSize   ;
    this.dimensions = dimensions ;
    this.uri        = uri        ;
    this.extension  = extension  ;
  }

  abstract getFileType  (): string    ;
  abstract getDimensions(): Dimension ;
  abstract getFileSize  (): number    ;
  abstract setPath      (): FILE_ERROR ;
  abstract saveFile     (): FILE_ERROR ;
}

class Video extends FileContainer {
  protected duration : number ;

  constructor( fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string , duration: number ) {
    super(fileName, fileSize, dimensions, uri, extension);
    this.duration = duration  ; 
  }

  getFileType  (): string {
    return this.extension ; 
  }   

  getDimensions(): Dimension {
    return this.dimensions ; 
  }

  getFileSize() : number {
    return this.fileSize  ; 
  }

  setPath( filepath : string ) : FILE_ERROR { 
    console.warn("setPath() has not been implemented yet") 
    return FILE_ERROR.RESP_ERROR
  }

  getDuration() : number { 
    return this.duration ; 
  }

  async saveFile(): Promise<FILE_ERROR> {
      try {
        const videoRepository = AppDataSource.getRepository(VideoTable);
        
        const videoEntity = new VideoTable();
        videoEntity.filename = this.fileName;
        videoEntity.height = this.dimensions.height;
        videoEntity.width = this.dimensions.width;
        videoEntity.extension = this.extension;
        videoEntity.uri = this.uri;
        videoEntity.duration = this.duration;
        videoEntity.abs_path = `/sdcard/${this.fileName}` ; 

        await videoRepository.save(videoEntity);
        return FILE_ERROR.FILE_SUCCESS;
      } catch (error) {
        console.error('Error saving video:', error);
        return FILE_ERROR.RESP_ERROR;
      }
    }
}

class Image extends FileContainer {
  constructor(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string) {
    super(fileName, fileSize, dimensions, uri, extension);
  }

  getFileType  (): string {
    return this.extension ; 
  }   

  getDimensions(): Dimension {
    return this.dimensions ; 
  }

  getFileSize() : number {
    return this.fileSize  ; 
  }

  setPath( filepath : string ) : FILE_ERROR { 
    console.warn("setPath() has not been implemented yet")  ; 
    return FILE_ERROR.RESP_ERROR ; 
  }

  async saveFile(): Promise<FILE_ERROR> {
    try {
      const imageRepository = AppDataSource.getRepository(ImageTable);
      
      const imageEntity = new ImageTable();
      imageEntity.filename = this.fileName;
      imageEntity.height = this.dimensions.height;
      imageEntity.width = this.dimensions.width;
      imageEntity.extension = this.extension;
      imageEntity.uri = this.uri;
      imageEntity.abs_path = `/sdcard/${this.fileName}` ; 

      await imageRepository.save(imageEntity);
      return FILE_ERROR.FILE_SUCCESS;
    } catch (error) {
      console.error('Error saving image:', error);
      return FILE_ERROR.RESP_ERROR;
    }
  }
}

const createVideo = ( fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string , duration: number ): FileContainer => {
  return new Video( fileName , fileSize , dimensions , uri , extension , duration ) ; 
}

const createImage = ( fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string ): FileContainer => {
  return new Image( fileName , fileSize , dimensions , uri , extension ) ; 
}

const getFileCategory = ( value : string ) : string => {
	return value.split("/")[0] 
}

const createFileObject = ( metadata : any ) => {
	let file : FileContainer ; 
	const fileType = getFileCategory(metadata.type) 
	if(fileType && fileType == "video"){
		file = createVideo(
			metadata.fileName ,
		       	metadata.fileSize ,
			{ width : metadata.width , height : metadata.height } ,
		       	metadata.uri , 
			metadata.type.split("/")[1] , 
			metadata.duration  , 
		) ; 
	}
	else if(fileType && fileType == "image"){
		file = createImage(
			metadata.fileName ,
		       	metadata.fileSize ,
			{ width : metadata.width , height : metadata.height } ,
		       	metadata.uri , 
			metadata.type.split("/")[1] , 
		) ; 
	}
	return file ; 
}

const handleFile = ( metadata : any ) => { 
      const file = createFileObject(metadata) ; 
      return file 
}

export const openImagePicker = async (): Promise<FileContainer> => {
  return new Promise(( resolve , reject ) => {
    const options = {
      mediaType: 'any',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
	   reject(new Error("User Cancelled"))
      } else if (response.error || !response || !response.assets[0]) {
	   reject(new Error("Improper Response return from asset lib"))
      } else {
        const fileContainer = handleFile(response.assets[0]); // Does this also have to be async 
        resolve( fileContainer );
      }
    });
  });
};

export const writeFile = async ( file : FileContainer ) : Promise<FILE_ERROR> => {
  return new Promise((resolve) => {
    file.saveFile() ; 
    console.log(`${FILE_MANAGER_DBG} : Attempting to save file :  ${file}`) ; 
    resolve( FILE_ERROR.FILE_SUCCESS ) 
    reject( new Error( `${FILE_MANAGER_DBG} : Error occured while writing file` ))  ; 
  });
}
