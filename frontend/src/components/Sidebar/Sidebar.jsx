// src/components/Sidebar/Sidebar.jsx (최종 수정본)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../App';

function Sidebar({ onLogout, isSidebarOpen, toggleSidebar }) {
    const navigate = useNavigate();
    const { activeTool, setActiveTool } = useAppContext();

    const handleGoToProfile = () => {
        navigate('/profile');
        if (isSidebarOpen) {
            toggleSidebar();
        }
    };

    const handleMenuClick = (tool, path) => {
        setActiveTool(tool);
        navigate(path);
        window.scrollTo(0, 0);
        if (isSidebarOpen) {
            toggleSidebar();
        }
    };

    return (
        <div className="sidebar">
            {/* ✨ 닫기 버튼을 최상단으로 이동 */}
            <button onClick={toggleSidebar} className="sidebar-close-button">
                <span className="material-symbols-outlined">close</span>
            </button>

            {/* 헤더와 푸터를 제외한 스크롤이 필요한 중앙 영역 */}
            <div className="sidebar-main">
                <div className="sidebar-header">
                    <div className="sidebar-title-group">
                        <span className="material-symbols-outlined">design_services</span>
                        <span>AI 홈 디자이너</span>
                    </div>
                </div>
                <div className="sidebar-separator"></div>
                <ul className="menu-list">
                    <li
                        className={`menu-item ${activeTool === 'Interior' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('Interior', '/')}
                    >
                        <span className="material-symbols-outlined">weekend</span>
                        인테리어
                    </li>
                    <li
                        className={`menu-item ${activeTool === 'Exterior' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('Exterior', '/')}
                    >
                        <span className="material-symbols-outlined">cottage</span>
                        익스테리어
                    </li>
                </ul>
            </div>

            {/* 푸터는 그대로 하단에 위치 */}
            <div className="sidebar-footer">
                <div className="sidebar-info-text">
                    © 2025 Your Company. All Rights Reserved.
                </div>
                <button
                    onClick={handleGoToProfile}
                    className="generate-button"
                    style={{ width: '100%' }}
                >
                    <span className="material-symbols-outlined">person</span>
                    내 프로필
                </button>
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