// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo1JkGIX7VpL7iyhA8D7ps7hjTUnZj0IY",
  authDomain: "clickygame-b242f.firebaseapp.com",
  projectId: "clickygame-b242f",
  storageBucket: "clickygame-b242f.firebasestorage.app",
  messagingSenderId: "693404563950",
  appId: "1:693404563950:web:27da13d5d49aa59ccaf6ff"
};

// Initialize Firebase



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);

export async function getPlayer() {
  await auth.authStateReady();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  return result.user;
}