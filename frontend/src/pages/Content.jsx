// src/Content.jsx

import React, { useState } from 'react';
import ReactCompareImage from 'react-compare-image';
import AdvancedInput from '../components/Editor/AdvancedInput'; 
import '../styles/App.css';                                 
const STYLES = ["모던", "미니멀리스트", "스칸디나비아", "보헤미안", "인더스트리얼", "코스탈"];
const ROOM_TYPES = ["거실", "침실", "주방", "화장실", "다이닝 룸", "홈 오피스", "파티오"];

function Content({ activeTool }) {
    const [style, setStyle] = useState('모던');
    const [roomType, setRoomType] = useState('거실');
    const [userPrompt, setUserPrompt] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [showCompareSlider, setShowCompareSlider] = useState(false);

    const handleMainImageChange = (file) => {
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl('');
            setError(null);
            setShowCompareSlider(false);
        }
    };

    const handleImageUpload = (event) => {
        handleMainImageChange(event.target.files?.[0]);
    };

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
        handleMainImageChange(event.dataTransfer?.files?.[0]);
    };

    const handleGenerateClick = async () => {
        if (!imageFile) {
            alert('이미지를 업로드 해주세요.');
            return;
        }
        setIsLoading(true);
        setResultUrl('');
        setError(null);
        setShowCompareSlider(false);

        const formData = new FormData();
        formData.append('imageFile', imageFile);
        formData.append('style', style);
        formData.append('room_type', roomType);
        formData.append('prompt', userPrompt);

        try {
            const response = await fetch('http://localhost:5000/api/generate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.imageUrl) {
                setResultUrl(data.imageUrl);
            } else {
                throw new Error(data.error || 'Image URL not found in response.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartNew = () => {
        setImageFile(null);
        setPreviewUrl('');
        setResultUrl('');
        setError(null);
        setShowCompareSlider(false);
        setUserPrompt('');
    };

    const toggleCompareSlider = () => {
        setShowCompareSlider(!showCompareSlider);
    };

    return (
        <main className="content">
            <div className="content-header">
                <h1>{activeTool === 'Interior' ? "인테리어 AI 디자이너" : "익스테리어 AI 디자이너"}</h1>
                <p>사진 한 장으로 몇 초 만에 공간을 바꿔보세요. AI의 힘이 당신 손끝에 있습니다.</p>
            </div>

            <div className="main-layout">
                <div className="controls-panel">
                    <h3>
                        <span className="material-symbols-outlined">tune</span>
                        디자인 설정
                    </h3>
                    <div className="form-group">
                        <label>1. 스타일 선택</label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)}>
                            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>2. 공간 유형 선택</label>
                        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                            {ROOM_TYPES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>3. 추가 정보 입력 (선택 사항)</label>
                        <AdvancedInput
                            userPrompt={userPrompt}
                            setUserPrompt={setUserPrompt}
                        />
                    </div>
                    <div className="action-buttons-vertical">
                        <button className="generate-button" onClick={handleGenerateClick} disabled={isLoading || !imageFile}>
                            <span className="material-symbols-outlined">auto_awesome</span>
                            {isLoading ? "생성 중..." : "생성하기"}
                        </button>
                        {previewUrl && (
                            <button className="start-new-button" onClick={handleStartNew}>
                                <span className="material-symbols-outlined">add_circle</span>
                                새로 만들기
                            </button>
                        )}
                    </div>
                </div>

                <div className="image-panel">
                    {!previewUrl ? (
                        <div
                            className={`upload-card ${isDragging ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('imageUploadInput').click()}
                        >
                            <span className="material-symbols-outlined upload-icon">add_photo_alternate</span>
                            <h4>사진 업로드</h4>
                            <p>드래그 앤 드롭 또는 클릭하여 업로드</p>
                            <input type="file" id="imageUploadInput" accept="image/*" onChange={handleImageUpload} hidden />
                        </div>
                    ) : (
                        <div className="result-container">
                            {showCompareSlider && resultUrl ? (
                                <div className="comparison-slider-wrapper">
                                    <h4>바를 움직여보세요</h4>
                                    <div className="comparison-slider-container">
                                        <ReactCompareImage leftImage={previewUrl} rightImage={resultUrl} leftImageLabel="전" rightImageLabel="후"/>
                                    </div>
                                </div>
                            ) : (
                                <div className="result-view">
                                    <div className="image-box">
                                        <div className="image-box-header"><h3>원본</h3></div>
                                        <div className="image-content-wrapper"><img src={previewUrl} alt="Original" /></div>
                                    </div>
                                    <div className="image-box">
                                        <div className="image-box-header">
                                            <h3>AI 이미지</h3>
                                            {resultUrl && !isLoading && (
                                                <button className="compare-button" onClick={toggleCompareSlider}>
                                                    <span className="material-symbols-outlined">compare_arrows</span>
                                                    비교하기
                                                </button>
                                            )}
                                        </div>
                                        <div className="image-content-wrapper">
                                            {isLoading && <div className="loading-spinner"></div>}
                                            {error && <div className="error-message">{error}</div>}
                                            {resultUrl && !isLoading && <img src={resultUrl} alt="AI Result" />}
                                            {!resultUrl && !isLoading && !error && <div className="placeholder">생성하기 버튼을 클릭하세요.</div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Content;