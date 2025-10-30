// src/services/signService.ts
import axios from "axios";

export async function signPdfOnServer(
  file: File,
  displayName: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("displayName", displayName);

  const response = await axios.post("http://localhost:4000/sign", formData, {
    responseType: "blob", // Expect PDF as Blob
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data; // Return the signed PDF as a Blob
}
