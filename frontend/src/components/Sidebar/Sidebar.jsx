// frontend/src/components/Sidebar/Sidebar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✨ useNavigate 훅 임포트

// Sidebar 컴포넌트 정의
// activeTool: 현재 활성화된 도구 (예: Interior, Exterior)
// setActiveTool: 활성 도구를 변경하는 함수
// onLogout: App.jsx에서 전달받은 로그아웃 처리 함수
function Sidebar({ activeTool, setActiveTool, onLogout }) {
    const navigate = useNavigate(); // ✨ useNavigate 훅 사용

    // '내 프로필' 버튼 클릭 시 호출될 함수
    const handleGoToProfile = () => {
        navigate('/profile'); // ✨ /profile 경로로 이동
    };

    return (
        <div className="sidebar">
            {/* 사이드바 헤더 */}
            <div className="sidebar-header">
                <span className="material-symbols-outlined">design_services</span>
                AI 홈 디자이너
            </div>

            {/* 메뉴 목록 */}
            <ul className="menu-list">
                <li
                    className={`menu-item ${activeTool === 'Interior' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTool('Interior');
                        navigate('/'); // ✨ 인테리어 클릭 시 메인 페이지로 이동
                    }}
                >
                    <span className="material-symbols-outlined">weekend</span>
                    인테리어
                </li>
                <li
                    className={`menu-item ${activeTool === 'Exterior' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTool('Exterior');
                        navigate('/'); // ✨ 익스테리어 클릭 시 메인 페이지로 이동
                    }}
                >
                    <span className="material-symbols-outlined">cottage</span>
                    익스테리어
                </li>
                {/* ✨ "내 프로필" 메뉴 추가 */}
                <li
                    className="menu-item"
                    onClick={handleGoToProfile} // ✨ 프로필 이동 함수 연결
                >
                    <span className="material-symbols-outlined">person</span>
                    내 프로필
                </li>
            </ul>

            {/* 로그아웃 버튼 */}
            <div style={{ marginTop: 'auto', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={onLogout}
                    className="start-new-button"
                    style={{ width: '100%', marginTop: '10px' }}
                >
                    <span className="material-symbols-outlined">logout</span>
                    로그아웃
                </button>
            </div>
        </div>
    );
}

export default Sidebar;