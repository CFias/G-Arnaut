import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  deleteDoc,
  addDoc,
} from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyAjrMdHv0FWvOeXLopn6WQqXwbS1L8tIiM",
  authDomain: "garnaut-7bc48.firebaseapp.com",
  projectId: "garnaut-7bc48",
  storageBucket: "garnaut-7bc48.appspot.com",
  messagingSenderId: "595219975927",
  appId: "1:595219975927:web:151702a9cac677854c0df2",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Inicializa e exporta o Firestore
export const storage = getStorage(app); // Inicializa e exporta o Firebase Storage

export function signup(userName, email, password) {
  return createUserWithEmailAndPassword(auth, userName, email, password);
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export async function getProductCount() {
  const productsCollection = collection(db, "products");
  const productSnapshot = await getDocs(productsCollection);
  return productSnapshot.size;
}

export async function getPostCount() {
  const postsCollection = collection(db, "posts");
  const postSnapshot = await getDocs(postsCollection);
  return postSnapshot.size;
}

export async function deleteProduct(productId) {
  try {
    const productDoc = doc(db, "products", productId); // Cria a referência ao documento
    await deleteDoc(productDoc); // Exclui o documento
    console.log("Produto deletado com sucesso!");
  } catch (error) {
    console.error("Erro ao deletar o produto:", error);
  }
}

export const addVideoToFirestore = async (videoUrl) => {
  try {
    const docRef = await addDoc(collection(db, "videos"), {
      videoUrl: videoUrl,
      createdAt: new Date(),
    });
    console.log("Vídeo adicionado com sucesso, ID:", docRef.id);
  } catch (e) {
    console.error("Erro ao adicionar vídeo: ", e);
    throw new Error("Erro ao adicionar vídeo");
  }
};

