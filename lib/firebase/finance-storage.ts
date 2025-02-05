// lib/firebase/finance-storage.ts
import { ref, deleteObject } from "firebase/storage";

import { storage } from "../firebaseClient";

import { uploadFile } from "./storage";

import { Receipt } from "@/types/finance";

export async function uploadFinanceReceipt(
  file: File,
  teamId: string,
  transactionId: string,
): Promise<Receipt> {
  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${file.name}`;
    const path = `teams/${teamId}/finance/receipts/${transactionId}/${fileName}`;

    const { url, path: storagePath } = await uploadFile(file, path);

    const receipt: Receipt = {
      id: path,
      fileUrl: url,
      fileType: file.type.includes("pdf") ? "PDF" : "IMAGE",
      fileName: file.name,
      uploadedAt: new Date(),
      uploadedBy: "", // Se actualizará en el controller
      metadata: {
        size: file.size,
        mimeType: file.type,
      },
    };

    return receipt;
  } catch (error) {
    console.error("Error uploading receipt:", error);
    throw error;
  }
}

export async function deleteFinanceReceipt(
  teamId: string,
  transactionId: string,
  receiptId: string,
) {
  try {
    const path = `teams/${teamId}/finance/receipts/${transactionId}/${receiptId}`;
    const fileRef = ref(storage, path);

    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw error;
  }
}
