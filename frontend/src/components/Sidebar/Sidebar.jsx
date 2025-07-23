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
            <div className="sidebar-header">
                <span className="material-symbols-outlined">design_services</span>
                AI 홈 디자이너
            </div>

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
                <li
                    className="menu-item"
                    onClick={handleGoToProfile}
                >
                    <span className="material-symbols-outlined">person</span>
                    내 프로필
                </li>
            </ul>

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