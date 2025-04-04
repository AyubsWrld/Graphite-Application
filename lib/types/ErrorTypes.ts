export enum FILE_ERROR {
  FILE_SUCCESS = 0,
  USER_CANCEL = 1,
  RESP_ERROR = 2,
  UPLOAD_ERROR = 3,
  NETWORK_ERROR = 4,
  FILE_NOT_FOUND = 5 , 
  DB_ERROR = 6 , 
  TIMEOUT_ERROR = 7,
}

export enum SERIALIZATION_ERROR { 
  SERIALIZATION_SUCCESS  = 0 , // Exit success
  SERIALIZATION_TIMEOUT  = 1 , // Occurs when file takes too long to serialize 
  SERIALIZATION_SIZE_ERR = 2 , // Occurs when selected file size is too large
  SERIALIZATION_TIMEOUT  = 3 , // File took " too long " to upload to server
}

