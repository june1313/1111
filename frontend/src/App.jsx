import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar'; // 경로 확인
import Content from './pages/Content'; // ✨ Content 컴포넌트를 임포트
import './styles/App.css'; 

function App() {
  const [activeTool, setActiveTool] = useState('Interior');

  return (
    <div className="app-layout"> {/* ✨ 클래스명 변경 app-container -> app-layout */}
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
      />
      
      {/* ✨ Content 컴포넌트에 activeTool을 prop으로 전달 */}
      <Content activeTool={activeTool} />
    </div>
  );
}

export default App;