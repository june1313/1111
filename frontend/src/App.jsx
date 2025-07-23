// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Content from './pages/Content'; // 메인 앱 콘텐츠
import Register from './components/Auth/Register';
import Login from './components/Auth/login';
import Profile from './pages/Profile';
import ConversionDetail from './pages/ConversionDetail.jsx'; // ConversionDetail 컴포넌트 임포트
import './styles/App.css';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("로그아웃 성공!");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const AuthRoute = ({ children }) => {
    if (loading) {
      return <div className="app-layout"><div className="loading-spinner"></div></div>;
    }
    return user ? children : <Navigate to="/login" replace />;
  };

  const GuestRoute = ({ children }) => {
    if (loading) {
      return <div className="app-layout"><div className="loading-spinner"></div></div>;
    }
    return user ? <Navigate to="/" replace /> : children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AuthRoute>
            <MainAppLayout onLogout={handleLogout} />
          </AuthRoute>
        } />

        <Route path="/profile" element={
          <AuthRoute>
            <MainAppLayoutWithProfile onLogout={handleLogout} />
          </AuthRoute>
        } />

        {/* ✨ 상세 페이지 라우트: 이 부분이 정확히 있어야 합니다! */}
        <Route path="/profile/:conversionId" element={
          <AuthRoute>
            <MainAppLayoutWithDetail onLogout={handleLogout} />
          </AuthRoute>
        } />

        <Route path="/login" element={
          <GuestRoute>
            <div className="app-layout auth-page">
              <Login />
            </div>
          </GuestRoute>
        } />

        <Route path="/register" element={
          <GuestRoute>
            <div className="app-layout auth-page">
              <Register />
            </div>
          </GuestRoute>
        } />

        <Route path="*" element={<div className="app-layout"><h1>404 Not Found</h1></div>} />

      </Routes>
    </Router>
  );
}

export default App;

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

function MainAppLayoutWithProfile({ onLogout }) {
    const [activeTool, setActiveTool] = useState('');

    return (
        <div className="app-layout">
            <Sidebar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                onLogout={onLogout}
            />
            <Profile />
        </div>
    );
}

function MainAppLayoutWithDetail({ onLogout }) {
    const [activeTool, setActiveTool] = useState('');

    return (
        <div className="app-layout">
            <Sidebar
                activeTool={activeTool}
                setActiveTool={() => {}}
                onLogout={onLogout}
            />
            <ConversionDetail />
        </div>
    );
}