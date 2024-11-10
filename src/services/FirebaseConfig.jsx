// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Importando Firebase Storage

// Sua configuração do Firebase
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

// Função para registrar usuário
export function signup(userName, email, password) {
  return createUserWithEmailAndPassword(auth, userName, email, password);
}

// Função para fazer login
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Função para fazer logout
export function logout() {
  return signOut(auth);
}
