import { launchCamera , launchImageLibrary } from "react-native-image-picker" ; 


enum FILE_ERROR { 
  FILE_SUCCESS = 0 , 
  USER_CANCEL  = 1 , 
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

/*
 * @params  : None 
 * @purpose : Allows user to open and select image of their choice 
 * @return  : FILE_ERROR 
 * 
 *
*/

export const openImagePicker = () => {
    const options = {
      mediaType: 'any',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
	      const fileType = getFileCategory(response.assets[0].type) ; 
	      if(fileType){
		      if(fileType == "video"){
			      console.log("Handling Video") 
		      }

		      else if(fileType == "image"){
			      console.log("Handling image") 
		      }
	      }
      }
    });
  };
