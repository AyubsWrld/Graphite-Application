export type ErrorMessage = {
  errorFlag: FILE_ERROR;
  errorMessage: string;
};

export type UploadProgress = {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
};

export type Dimension = {
  width: number;
  height: number;
};

// Error map for quick lookups
export const ERROR_MAP: ErrorMessage[] = [
  { errorFlag: FILE_ERROR.FILE_SUCCESS, errorMessage: "Success" },
  { errorFlag: FILE_ERROR.USER_CANCEL, errorMessage: "User Cancelled" },
  { errorFlag: FILE_ERROR.UPLOAD_ERROR, errorMessage: "Upload Failed" },
  { errorFlag: FILE_ERROR.NETWORK_ERROR, errorMessage: "Network Error" },
];
