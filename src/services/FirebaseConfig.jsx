import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjrMdHv0FWvOeXLopn6WQqXwbS1L8tIiM",
  authDomain: "garnaut-7bc48.firebaseapp.com",
  projectId: "garnaut-7bc48",
  storageBucket: "garnaut-7bc48.appspot.com",
  messagingSenderId: "595219975927",
  appId: "1:595219975927:web:151702a9cac677854c0df2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Antes recebia (userName, email, password) e repassava os três para o
// Firebase, que só aceita (auth, email, password). Funcionava por acaso.
export function signup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export async function getPostCount() {
  const snap = await getDocs(collection(db, "posts"));
  return snap.size;
}

// Usado pela página ImportVideo
export const addVideoToFirestore = async (videoUrl) => {
  try {
    await addDoc(collection(db, "videos"), { videoUrl, createdAt: new Date() });
  } catch (e) {
    console.error("Erro ao adicionar vídeo: ", e);
    throw new Error("Erro ao adicionar vídeo");
  }
};

// Exclusão e leitura de imóveis ficam em services/products.js
export async function getProductCount() {
  const snap = await getDocs(collection(db, "products"));
  return snap.size;
}
