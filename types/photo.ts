// types/photo.ts
export interface PhotoMetadata {
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  timestamp: Date;
  uploadedBy: string;
  angle?: string;
}

export interface PhotoUploadResponse {
  url: string;
  metadata: PhotoMetadata;
}
