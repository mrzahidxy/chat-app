export interface ApiErrorResponse {
  message?: string;
}

export interface UploadImageResponse {
  image?: {
    url: string;
    publicId?: string;
    format?: string;
    bytes?: number;
  };
}
