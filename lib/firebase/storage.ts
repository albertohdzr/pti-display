// lib/firebase/storage.ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

import { storage } from "../firebaseClient";

// Helper function para subir archivos
export async function uploadFile(
  file: File,
  path: string,
): Promise<{ url: string; path: string }> {
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, path };
}

export async function uploadEventImage(
  file: File,
  eventId: string,
  type: "logo" | "cover" | "gallery",
) {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const path = `events/${eventId}/${type}/${fileName}`;

    return await uploadFile(file, path);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteEventImage(path: string) {
  try {
    const imageRef = ref(storage, path);

    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export async function uploadEventResource(
  file: File,
  eventId: string,
  type:
    | "document"
    | "video"
    | "code"
    | "BUDGET"
    | "REPORT"
    | "RECEIPT"
    | "CONTRACT"
    | "OTHER",
): Promise<{ url: string; path: string }> {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const path = `events/${eventId}/resources/${type}/${fileName}`;

    return await uploadFile(file, path);
  } catch (error) {
    console.error("Error uploading resource:", error);
    throw error;
  }
}

export async function deleteEventResource(path: string): Promise<void> {
  try {
    const resourceRef = ref(storage, path);

    await deleteObject(resourceRef);
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
}

export async function uploadReceipt(
  file: File,
  sourceType: "event" | "team",
  sourceId: string,
  itemId: string,
) {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const path = `${sourceType}s/${sourceId}/receipts/${itemId}/${fileName}`;

    return await uploadFile(file, path);
  } catch (error) {
    console.error("Error uploading receipt:", error);
    throw error;
  }
}

// Para obtener URLs públicas, usamos getDownloadURL del cliente
export async function getPublicUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);

    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting public URL:", error);
    throw error;
  }
}
