// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Content from './pages/Content'; // 메인 앱 콘텐츠
import Register from './components/Auth/Register';
import Login from './components/Auth/login';
import Profile from './pages/Profile'; // ✨ Profile 컴포넌트 임포트
import './styles/App.css';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Firebase Auth 상태 로딩 중

  // Firebase 로그인 상태 변화를 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("로그아웃 성공!");
      // 로그인 화면으로 자동 리다이렉트될 것입니다.
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // AuthRoute: 로그인 상태에 따라 접근을 제한하는 헬퍼 컴포넌트
  const AuthRoute = ({ children }) => {
    if (loading) {
      return <div className="app-layout"><div className="loading-spinner"></div></div>; // 로딩 중 스피너
    }
    return user ? children : <Navigate to="/login" replace />; // 로그인되어 있으면 자식 컴포넌트, 아니면 로그인 페이지로
  };

  // GuestRoute: 로그인 상태일 때는 접근을 제한하는 헬퍼 컴포넌트 (로그인/회원가입 페이지용)
  const GuestRoute = ({ children }) => {
    if (loading) {
      return <div className="app-layout"><div className="loading-spinner"></div></div>;
    }
    return user ? <Navigate to="/" replace /> : children; // 로그인되어 있으면 메인 페이지로, 아니면 자식 컴포넌트
  };


  return (
    <Router>
      <Routes>
        {/* 메인 앱 라우트 (로그인 필요) */}
        <Route path="/" element={
          <AuthRoute>
            <MainAppLayout onLogout={handleLogout} />
          </AuthRoute>
        } />

        {/* 프로필 페이지 (로그인 필요) */}
        <Route path="/profile" element={ // ✨ /profile 경로 추가
          <AuthRoute>
            <MainAppLayoutWithProfile onLogout={handleLogout} /> {/* ✨ Profile 컴포넌트를 포함하는 레이아웃 추가 */}
          </AuthRoute>
        } />

        {/* 로그인 페이지 (로그인 되어있으면 메인으로 리다이렉트) */}
        <Route path="/login" element={
          <GuestRoute>
            <div className="app-layout auth-page">
              <Login />
            </div>
          </GuestRoute>
        } />

        {/* 회원가입 페이지 (로그인 되어있으면 메인으로 리다이렉트) */}
        <Route path="/register" element={
          <GuestRoute>
            <div className="app-layout auth-page">
              <Register />
            </div>
          </GuestRoute>
        } />

        {/* 기타 페이지 (예: 404 Not Found) */}
        <Route path="*" element={<div className="app-layout"><h1>404 Not Found</h1></div>} />

      </Routes>
    </Router>
  );
}

export default App;

// MainAppLayout 컴포넌트: Sidebar와 Content를 포함하는 레이아웃
function MainAppLayout({ onLogout }) {
    const [activeTool, setActiveTool] = useState('Interior');

    return (
        <div className="app-layout">
            <Sidebar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                onLogout={onLogout}
            />
            <Content activeTool={activeTool} />
        </div>
    );
}

// ✨ MainAppLayoutWithProfile 컴포넌트: Sidebar와 Profile을 포함하는 레이아웃
// Profile 페이지도 Sidebar를 사용하고 싶을 경우 이렇게 별도 레이아웃을 만들 수 있습니다.
function MainAppLayoutWithProfile({ onLogout }) {
    const [activeTool, setActiveTool] = useState(''); // Profile 페이지는 activeTool이 필요 없을 수 있습니다.

    return (
        <div className="app-layout">
            <Sidebar
                activeTool={activeTool}
                setActiveTool={() => {}} // Profile 페이지에서는 setActiveTool이 작동하지 않도록 빈 함수 전달
                onLogout={onLogout}
            />
            <Profile /> {/* ✨ Profile 컴포넌트 렌더링 */}
        </div>
    );
}