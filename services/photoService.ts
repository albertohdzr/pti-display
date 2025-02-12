// services/photoService.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { PhotoMetadata, PhotoUploadResponse } from "@/types/photo";
import { storage } from "@/lib/firebaseClient";

export class PhotoService {
  static async uploadInspectionPhoto(
    teamId: string,
    checklistResultId: string,
    itemId: string,
    file: File,
    angle?: string,
  ): Promise<PhotoUploadResponse> {
    const timestamp = new Date();
    const fileName = `${timestamp.getTime()}-${file.name}`;
    const path = `teams/${teamId}/inspections/${checklistResultId}/${itemId}/${fileName}`;
    const photoRef = ref(storage, path);

    await uploadBytes(photoRef, file);
    const url = await getDownloadURL(photoRef);

    const metadata: PhotoMetadata = {
      fileName,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      timestamp,
      uploadedBy: "current-user-id", // Deberías obtener esto del contexto de autenticación
      angle,
    };

    return { url, metadata };
  }

  static async deletePhoto(url: string): Promise<void> {
    const photoRef = ref(storage, url);

    await photoRef.delete();
  }
}
