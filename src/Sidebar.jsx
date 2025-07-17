import React from 'react';

function Sidebar({ activeTool, setActiveTool }) {
  const menuItems = [
    { id: 'Interior', name: 'Interior AI', icon: 'cottage' }, // 🏠
    { id: 'Exterior', name: 'Exterior AI', icon: 'villa' }, // 🏛️
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <span className="material-symbols-outlined">auto_awesome_mosaic</span>
        <h2>All Tools</h2>
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