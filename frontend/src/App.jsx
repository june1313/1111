
import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar'; 
import Content from './pages/Content';           
import './styles/App.css';                     
function App() {
  const [activeTool, setActiveTool] = useState('Interior');

  return (
    <div className="app-layout">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <Content activeTool={activeTool} />
    </div>
  );
}

export default App;