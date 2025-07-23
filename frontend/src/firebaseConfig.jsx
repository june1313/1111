// src/firebaseConfig.js (또는 .jsx)

// Firebase SDK에서 필요한 함수들 가져오기
import { initializeApp } from "firebase/app"; // 핵심 Firebase 앱 초기화
import { getAuth } from "firebase/auth";     // Firebase Authentication 서비스
import { getFirestore } from "firebase/firestore"; // Firebase Firestore 서비스

const firebaseConfig = {
  apiKey: "AIzaSyAfrVnTMVyVFxUBMw9ZxYXMEucwuDeyaAg",
  authDomain: "project-1307776871066361164.firebaseapp.com",
  projectId: "project-1307776871066361164",
  storageBucket: "project-1307776871066361164.firebasestorage.app",
  messagingSenderId: "212428131437",
  appId: "1:212428131437:web:5ce779235c56a75767c364",
  measurementId: "G-8DJMZ1TQZV"
};


// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 초기화된 Firebase 앱 인스턴스를 사용하여 각 서비스 인스턴스를 가져옵니다.
const auth = getAuth(app);
const db = getFirestore(app);

// 다른 컴포넌트나 파일에서 사용할 수 있도록 내보냅니다.
export { app, auth, db };