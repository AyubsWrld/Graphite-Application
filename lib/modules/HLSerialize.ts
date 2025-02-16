import { ffmpeg, fetchFile, loadFFmpeg } from './ffmpegLoader';


enum SERIALIZATION_ERROR {
  SERIALIZATION_SUCCESS = 0 , 
  SERIALIZATION_FAILED  = 1 , 
}

const SERIALIZATION_TAG : string = "SERIALIZATION: " ; 

const serialize = () : SERIALIZATION_ERROR => {
  console.log(SERIALIZATION_SUCCESS , "Attempting to serialize") ; 
  return SERIALIZATION_ERROR.SERIALIZATION_SUCCESS ; 
}

