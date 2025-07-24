// src/App.jsx (최종 수정본)

import React, { useState, useEffect, createContext, useContext } from 'react'; // ✨ createContext, useContext 추가
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

// 컴포넌트 임포트
import Sidebar from './components/Sidebar/Sidebar';
import Content from './pages/Content';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './pages/Profile';
import ConversionDetail from './pages/ConversionDetail.jsx';
import './styles/App.css';

// ✨ 1. AppContext 생성
const AppContext = createContext(null);
export const useAppContext = () => useContext(AppContext); // 다른 파일에서 context를 쉽게 사용하기 위한 custom hook

// src/App.jsx 파일의 MainLayout 함수

function MainLayout({ children, onLogout }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeTool, setActiveTool] = useState('Interior');
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <AppContext.Provider value={{ activeTool, setActiveTool }}>
            <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <Sidebar onLogout={onLogout} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                
                {/* ✨ 이 부분이 유일한 원인이자 해결책입니다! */}
                {/* ✨ 사이드바가 열렸을 때(isSidebarOpen이 true일 때)만 overlay가 화면에 존재하도록 합니다. */}
                {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
                
                <div className="main-content-wrapper">
                    <div className="mobile-header">
                        <button onClick={toggleSidebar} className="hamburger-button">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="mobile-header-title">AI 홈 디자이너</div>
                    </div>
                    {children}
                </div>
            </div>
        </AppContext.Provider>
    );
}

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
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    if (loading) {
        return (
            <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }
    
    return (
        <Router>
            <Routes>
                {user ? (
                    <Route path="/*" element={
                        <MainLayout onLogout={handleLogout}>
                            <Routes>
                                <Route path="/" element={<Content />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/profile/:conversionId" element={<ConversionDetail />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </MainLayout>
                    } />
                ) : (
                    <>
                        <Route path="/login" element={<div className="app-layout auth-page"><Login /></div>} />
                        <Route path="/register" element={<div className="app-layout auth-page"><Register /></div>} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;