// src/pages/Content.jsx

import React, { useState, useEffect } from 'react';
import ReactCompareImage from 'react-compare-image';
import TiptapEditor from '../components/Editor/TiptapEditor';
import { generateImage } from '../api/imageApi';
import '../styles/App.css';
import { useAppContext } from '../App';
import CustomDropdown from '../components/Editor/CustomDropdown';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// 옵션 정의
const INTERIOR_STYLES = [
  { value: 'Modern', label: '모던' }, { value: 'Minimalist', label: '미니멀' },
  { value: 'Scandinavian', label: '북유럽' }, { value: 'Bohemian', label: '보헤미안' },
  { value: 'Industrial', label: '인더스트리얼' }, { value: 'Coastal', label: '해안' },
];
const ROOM_TYPES = [
  { value: 'living room', label: '거실' }, { value: 'bedroom', label: '침실' },
  { value: 'kitchen', label: '주방' }, { value: 'bathroom', label: '욕실' },
  { value: 'office', label: '사무실' },
];
const EXTERIOR_STYLES = [
  { value: 'Modern Minimalist', label: '모던 미니멀' }, { value: 'Classic Grandeur', label: '클래식' },
  { value: 'Futuristic Concept', label: '미래지향' },
];
const EXTERIOR_TYPES = [
  { value: 'a commercial building', label: '빌딩' }, { value: 'a detached house', label: '단독주택' },
  { value: 'an apartment complex', label: '아파트' }, { value: 'a traditional hanok', 'label': '한옥' },
  { value: 'a modern villa', label: '빌라' },
];

function Content() {
    const { activeTool } = useAppContext();
    const isInterior = activeTool === 'Interior';
    const currentStyles = isInterior ? INTERIOR_STYLES : EXTERIOR_STYLES;
    const currentTypes = isInterior ? ROOM_TYPES : EXTERIOR_TYPES;
    const typeLabel = isInterior ? "2. 공간 유형 선택" : "2. 건물 유형 선택";

    const [style, setStyle] = useState(currentStyles[0].value);
    const [selectedType, setSelectedType] = useState(currentTypes[0].value);
    const [userPrompt, setUserPrompt] = useState('');

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [showCompareSlider, setShowCompareSlider] = useState(false);

    const [convertedImageUrl, setConvertedImageUrl] = useState(null);
    const [showSaveNotification, setShowSaveNotification] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [generatedInfo, setGeneratedInfo] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        handleStartNew();
        setStyle(currentStyles[0].value);
        setSelectedType(currentTypes[0].value);
    }, [activeTool, currentStyles, currentTypes]);

    const handleMainImageChange = (file) => {
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl('');
            setConvertedImageUrl(null);
            setGeneratedInfo('');
            setError(null);
            setShowCompareSlider(false);
            setShowSaveNotification(false);
        }
    };

    const handleImageUpload = (event) => handleMainImageChange(event.target.files?.[0]);
    const handleDragOver = (event) => { event.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (event) => { event.preventDefault(); setIsDragging(false); };
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
        setConvertedImageUrl(null);
        setGeneratedInfo('');
        setError(null);
        setShowCompareSlider(false);
        setShowSaveNotification(false);

        const formData = new FormData();
        formData.append('imageFile', imageFile);
        formData.append('prompt', userPrompt);
        formData.append('style', style);
        formData.append('tool', activeTool);
        if (isInterior) {
            formData.append('room_type', selectedType);
        } else {
            formData.append('exterior_type', selectedType);
        }

        try {
            const data = await generateImage(formData);

            if (data.imageUrl) {
                setResultUrl(data.imageUrl);
                setConvertedImageUrl(data.imageUrl);
                setGeneratedInfo(data.infoData);
                setShowSaveNotification(true);
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
        setConvertedImageUrl(null);
        setGeneratedInfo('');
        setError(null);
        setShowCompareSlider(false);
        setShowSaveNotification(false);
        setUserPrompt('');
        const fileInput = document.getElementById('imageUploadInput');
        if(fileInput) fileInput.value = '';
    };

    const toggleCompareSlider = () => setShowCompareSlider(!showCompareSlider);

    const handleSaveConvertedImage = async () => {
        if (!currentUser) {
            alert('로그인이 필요합니다. 먼저 로그인해주세요.');
            setShowSaveNotification(false);
            return;
        }
        if (!convertedImageUrl) {
            alert('저장할 이미지가 없습니다. 이미지를 먼저 생성해주세요.');
            setShowSaveNotification(false);
            return;
        }

        setShowSaveNotification(false);

        try {
            const userConversionsCollectionRef = collection(db, `users/${currentUser.uid}/conversions`);
            await addDoc(userConversionsCollectionRef, {
                // originalImageUrl: previewUrl, // ReactCompareImage를 사용하지 않으므로 이 줄은 제거됨
                imageUrl: convertedImageUrl,
                prompt: userPrompt,
                style: style,
                type: selectedType,
                tool: activeTool,
                info: generatedInfo || null, // ✨ 이 부분을 수정합니다. generatedInfo가 undefined면 null을 저장
                // 또는 info: generatedInfo || '', // generatedInfo가 undefined면 빈 문자열을 저장
                createdAt: serverTimestamp(),
            });

            alert('변환 결과가 성공적으로 저장되었습니다!');
        } catch (error) {
            console.error("변환 결과 저장 실패:", error);
            alert('변환 결과 저장에 실패했습니다: ' + error.message);
        }
    };


    return (
        <main className="content">
            <div className="content-header">
                <h1>{isInterior ? "인테리어 AI 디자이너" : "익스테리어 AI 디자이너"}</h1>
                <p>사진 한 장으로 몇 초 만에 공간을 바꿔보세요. AI의 힘이 당신 손끝에 있습니다.</p>
            </div>

            <div className="main-layout">
    <div className="controls-panel">
        <h3>
            <span className="material-symbols-outlined">tune</span>
            디자인 설정
        </h3>

        {/* ✨ 1. 스타일 선택 드롭다운 교체 */}
        <div className="form-group">
            <label>1. 스타일 선택</label>
            <CustomDropdown
                value={style}
                options={currentStyles}
                onChange={(value) => setStyle(value)}
                renderButtonContent={selectedOption => <span>{selectedOption ? selectedOption.label : '선택...'}</span>}
            />
        </div>

        {/* ✨ 2. 공간 유형 선택 드롭다운 교체 */}
        <div className="form-group">
            <label>{typeLabel}</label>
            <CustomDropdown
                value={selectedType}
                options={currentTypes}
                onChange={(value) => setSelectedType(value)}
                renderButtonContent={selectedOption => <span>{selectedOption ? selectedOption.label : '선택...'}</span>}
            />
        </div>

        <div className="form-group">
            <label>3. 추가 정보 입력 (선택 사항)</label>
            <TiptapEditor userPrompt={userPrompt} setUserPrompt={setUserPrompt} />
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
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
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
                                    <button className="start-new-button" style={{marginTop: '24px'}} onClick={toggleCompareSlider}>결과 보기로 돌아가기</button>
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
                                                <button className="compare-button" onClick={toggleCompareSlider} title="비교하기">
                                                    <span className="material-symbols-outlined">compare_arrows</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="image-content-wrapper">
                                            {isLoading && <div className="loading-spinner"></div>}
                                            {error && <div className="error-message">{error}</div>}
                                            {resultUrl && !isLoading && <img src={resultUrl} alt="AI Result" />}
                                            {!resultUrl && !isLoading && !error && <div className="placeholder">AI 이미지가 여기에 표시됩니다.</div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showSaveNotification && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    zIndex: 1000, textAlign: 'center', maxWidth: '300px'
                }}>
                    <p style={{ fontSize: '1.1em', marginBottom: '20px' }}>변환이 완료되었습니다. 이 결과를 저장하시겠습니까?</p>
                    <button
                        onClick={handleSaveConvertedImage}
                        style={{
                            marginRight: '15px', padding: '10px 20px', borderRadius: '5px', border: 'none',
                            backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '1em'
                        }}
                    >
                        확인
                    </button>
                    <button
                        onClick={() => setShowSaveNotification(false)}
                        style={{
                            padding: '10px 20px', borderRadius: '5px', border: '1px solid #ddd',
                            backgroundColor: '#f8f9fa', color: '#333', cursor: 'pointer', fontSize: '1em'
                        }}
                    >
                        취소
                    </button>
                </div>
            )}
        </main>
    );
}

export default Content;