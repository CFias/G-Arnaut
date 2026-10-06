import imageCompression from "browser-image-compression";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./FirebaseConfig";

export const MAX_IMAGES = 15;

// Mesma configuração que o AddProducts antigo usava.
const COMPRESSION = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(file) {
  try {
    return await imageCompression(file, COMPRESSION);
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    return file;
  }
}

const safeName = (name = "foto") =>
  name
    .normalize("NFD")
    .replace(/[^\w.-]+/g, "_")
    .slice(-60);

export async function uploadProductImage(file) {
  const compressed = await compressImage(file);
  const imageRef = ref(
    storage,
    `products/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${safeName(compressed.name || file.name)}`,
  );
  const snapshot = await uploadBytes(imageRef, compressed);
  return getDownloadURL(snapshot.ref);
}

/** Sobe várias imagens em sequência, avisando o progresso (0–100). */
export async function uploadMany(files, onProgress) {
  const urls = [];
  for (let i = 0; i < files.length; i += 1) {
    urls.push(await uploadProductImage(files[i]));
    onProgress?.(Math.round(((i + 1) / files.length) * 100));
  }
  return urls;
}
