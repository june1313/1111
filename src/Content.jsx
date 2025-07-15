import React, { useState } from 'react';

function Content({ activeTool }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태를 위한 state 추가

  const toolData = {
    'Interior': {
      title: 'Interior AI',
      description: 'Redesign interior spaces by uploading a reference photo.',
      prompt: 'A photorealistic, modern interior redesign of this space'
    },
    'Exterior': {
      title: 'Exterior AI',
      description: 'Redesign the facade of buildings by uploading a reference photo.',
      prompt: 'A photorealistic, modern exterior redesign of this building, change facade'
    }
  };

  const currentTool = toolData[activeTool];

  // 파일 처리 로직을 별도 함수로 분리하여 재사용
  const processFile = (file) => {
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl('');
    }
  };

  const handleImageUpload = (event) => {
    processFile(event.target.files[0]);
  };

  const handleGenerateClick = async () => {
    if (!imageFile) {
      alert('먼저 이미지를 업로드해주세요.');
      return;
    }
    setIsLoading(true);
    console.log(`"${activeTool}" 모드에서 사용할 프롬프트:`, currentTool.prompt);
    setTimeout(() => {
      setResultUrl('https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070');
      setIsLoading(false);
    }, 2000);
  };

  // --- 드래그 앤 드롭 핸들러 추가 ---
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  return (
    <main className="content">
      <div className="content-header">
        <h1>{currentTool.title}</h1>
        <p>{currentTool.description}</p>
      </div>

      {!previewUrl ? (
        // --- className 및 이벤트 핸들러 추가 ---
        <div 
          className={`upload-card ${isDragging ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">🖼️</div>
          <h3>Upload your image</h3>
          <p>Drag and drop your image here</p>
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} />
          <label htmlFor="imageUpload" className="upload-button">
            + Upload your image
          </label>
        </div>
      ) : (
        <div className="result-view">
          <div className="image-box">
            <h3>Original</h3>
            <img src={previewUrl} alt="Original" />
          </div>
          <div className="image-box">
            <h3>AI Result</h3>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : resultUrl ? (
              <img src={resultUrl} alt="AI Result" />
            ) : (
              <div className="placeholder">결과가 여기에 표시됩니다.</div>
            )}
          </div>
        </div>
      )}

      {previewUrl && (
         <button className="generate-button" onClick={handleGenerateClick} disabled={isLoading}>
          {isLoading ? 'Generating...' : '✨ Generate Image with AI'}
        </button>
      )}
    </main>
  );
}

export default Content;