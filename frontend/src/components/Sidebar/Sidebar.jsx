// frontend/src/components/Sidebar/Sidebar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar({ activeTool, setActiveTool, onLogout }) {
    const navigate = useNavigate();

    const handleGoToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="sidebar">
            {/* 사이드바 헤더 */}
            <div className="sidebar-header">
                <span className="material-symbols-outlined">design_services</span>
                AI 홈 디자이너
            </div>

            {/* ✨ 여기에 구분선을 추가합니다 ✨ */}
            <div className="sidebar-separator"></div>

            {/* 메뉴 목록 */}
            <ul className="menu-list">
                <li
                    className={`menu-item ${activeTool === 'Interior' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTool('Interior');
                        navigate('/');
                    }}
                >
                    <span className="material-symbols-outlined">weekend</span>
                    인테리어
                </li>
                <li
                    className={`menu-item ${activeTool === 'Exterior' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTool('Exterior');
                        navigate('/');
                    }}
                >
                    <span className="material-symbols-outlined">cottage</span>
                    익스테리어
                </li>
            </ul>

            {/* 사이드바 하단 영역 */}
            <div style={{ marginTop: 'auto', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                {/* "내 프로필" 버튼 */}
                <button
                    onClick={handleGoToProfile}
                    className="generate-button"
                    style={{ width: '100%', marginBottom: '10px' }}
                >
                    <span className="material-symbols-outlined">person</span>
                    내 프로필
                </button>

                {/* "로그아웃" 버튼 */}
                <button
                    onClick={onLogout}
                    className="logout-button-sidebar"
                    style={{ width: '100%' }}
                >
                    <span className="material-symbols-outlined">logout</span>
                    로그아웃
                </button>
            </div>
        </div>
    );
}

export default Sidebar;