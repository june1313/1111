import React from 'react';

function Sidebar({ activeTool, setActiveTool }) {
  const menuItems = [
    { id: 'Interior', name: '인테리어', icon: 'cottage' }, // 🏠
    { id: 'Exterior', name: '익스테리어', icon: 'villa' }, // 🏛️
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="material-symbols-outlined">auto_awesome_mosaic</span>
        <h2>도구</h2>
      </div>
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`menu-item ${item.id === activeTool ? 'active' : ''}`}
            onClick={() => setActiveTool(item.id)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;