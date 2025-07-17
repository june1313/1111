import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Content from './Content';
import './App.css';

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