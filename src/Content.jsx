import React, { useState } from 'react';

function Content({ activeTool }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  // 파일 처리 로직
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

  // API 연동을 위해 수정된 함수
  const handleGenerateClick = async () => {
    if (!imageFile) {
      alert('먼저 이미지를 업로드해주세요.');
      return;
    }
    setIsLoading(true);
    setResultUrl(''); // 이전 결과 이미지 초기화

    // FormData 객체를 사용하여 파일과 텍스트를 함께 보냅니다.
    const formData = new FormData();
    formData.append('imageFile', imageFile); // 'imageFile'은 파이썬에서 받을 때 사용한 키
    formData.append('prompt', currentTool.prompt); // 'prompt' 키로 현재 도구의 프롬프트를 전송

    try {
      const response = await fetch('http://localhost:5000/api/generate-image-from-file', {
        method: 'POST',
        body: formData, // FormData를 body에 담아 전송
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.imageUrl) {
        setResultUrl(data.imageUrl); // 서버에서 받은 이미지 URL로 상태 업데이트
      } else {
        throw new Error(data.error || '이미지 URL을 받지 못했습니다.');
      }

    } catch (error) {
      console.error("이미지 생성 오류:", error);
      alert(`이미지 생성에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 드래그 앤 드롭 핸들러
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