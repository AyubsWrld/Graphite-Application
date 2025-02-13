import { launchCamera , launchImageLibrary } from "react-native-image-picker" ; 


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

/*
 * abstract class File  
 * @purpose         : defines shape for other filetypes 
 * @member_variable 
 * 
*/

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
  getDuration() : number { 
    return this.duration ; 
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
}

interface FileFactory { 
  createFile(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string , duration? : number ) : FileContainer ; 
}

class VideoFactory implements FileFactory { 
  createFile(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string , duration : number ) : FileContainer {
	  return new Video( fileName , fileSize , dimensions , uri , extension , duration ) 
  }
}

class ImageFactory implements FileFactory{
  createFile(fileName: string, fileSize: number, dimensions: Dimension, uri: string, extension: string ) : FileContainer {
	  return new Image( fileName , fileSize , dimensions , uri , extension ) ;
  }
}


/* @signature : getFileCategory( value : string ) : string 
 * @params    : String with file identifier to split 
 * @purpose   : Derive file type from string 
 * @return    : String value of general file type ( Video , Image , Document )  
*/



const getFileCategory = ( value : string ) : string => {
	return value.split("/")[0] 
}

const createFileObject = ( metadata : any ) => {
	let file : FileContainer ; 
	const fileType = getFileCategory(metadata.type) 
	if(fileType && fileType == "video"){
		const factory = new VideoFactory() ; 
		file = factory.createFile(
			metadata.fileName ,
		       	metadata.fileSize ,
			{ width : metadata.width , height : metadata.height } ,
		       	metadata.uri , 
			metadata.type.split("/")[1] , 
			metadata.duration  , 
		) ; 
	}
	else if(fileType && fileType == "image"){
		const factory = new ImageFactory() ; 
		file = factory.createFile(
			metadata.fileName ,
		       	metadata.fileSize ,
			{ width : metadata.width , height : metadata.height } ,
		       	metadata.uri , 
			metadata.type.split("/")[1] , 
		) ; 
	}
	return file ; 
}

/* @signature : handleFile( metadata : object / any ) : FILE_ERROR
 * @params    : object containing file metadata 
 * @purpose   : write file contents to db 
 * @return    : SUCCESS if ok , some FILE_ERROR if something wrong occurs 
*/

const handleFile = ( metadata : any ) => { 
      const file = createFileObject(metadata) ; 
      console.log(file) ; 
}

/*
 * @params  : None 
 * @purpose : Allows user to open and select image of their choice 
 * @return  : FILE_ERROR 
*/

export const openImagePicker = async (): Promise<FILE_ERROR> => {
  return new Promise((resolve) => {
    const options = {
      mediaType: 'any',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        resolve(FILE_ERROR.USER_CANCEL);
      } else if (response.error || !response || !response.assets[0]) {
        resolve(FILE_ERROR.RESP_ERROR);
      } else {
        handleFile(response.assets[0]); // Does this also have to be async 
        resolve(FILE_ERROR.FILE_SUCCESS);
      }
    });
  });
};


export const writeFile = async () : Promise<FILE_ERROR> => {
  return new Promise((resolve) => {
    console.log("IT worked !") ; 
  });
}
