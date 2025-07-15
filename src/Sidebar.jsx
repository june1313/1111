import React from 'react';

// 부모로부터 activeTool과 setActiveTool을 props로 받습니다.
function Sidebar({ activeTool, setActiveTool }) {
  
  // 메뉴 아이템을 수정했습니다.
  const menuItems = [
    { icon: '🏠', name: 'Interior' },
    { icon: '🏛️', name: 'Exterior' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>All Tools</h2>
      </div>
      <ul>
        {menuItems.map((item) => (
          <li 
            key={item.name} 
            // 부모가 알려준 activeTool과 이름이 같으면 active 클래스를 적용합니다.
            className={item.name === activeTool ? 'active' : ''}
            // 메뉴 클릭 시 부모의 상태를 변경하는 함수를 호출합니다.
            onClick={() => setActiveTool(item.name)}
          >
            <a href="#">
              <span className="icon">{item.icon}</span>
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;