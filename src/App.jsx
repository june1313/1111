import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Content from './Content';
import './App.css';

function App() {
  // 'activeTool' 이라는 상태를 만들어 현재 선택된 메뉴를 기억합니다.
  // 기본값으로 'Interior'를 설정합니다.
  const [activeTool, setActiveTool] = useState('Interior');

  return (
    <div className="app-layout">
      {/* Sidebar에는 상태와 상태를 변경하는 함수를 넘겨줍니다. */}
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      
      {/* Content에는 현재 어떤 상태인지만 알려줍니다. */}
      <Content activeTool={activeTool} />
    </div>
  );
}

export default App;