// src/pages/Content.jsx

import React, { useState, useEffect } from 'react';
import ReactCompareImage from 'react-compare-image';
import TiptapEditor from '../components/Editor/TiptapEditor';
import { generateImage } from '../api/imageApi';
import '../styles/App.css';

// ✨ Firebase 관련 임포트 추가
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // doc, getDoc 대신 addDoc, collection 사용

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
  { value: 'an apartment complex', label: '아파트' }, { value: 'a traditional hanok', label: '한옥' },
  { value: 'a modern villa', label: '빌라' },
];

function Content({ activeTool }) {
    const isInterior = activeTool === 'Interior';
    const currentStyles = isInterior ? INTERIOR_STYLES : EXTERIOR_STYLES;
    const currentTypes = isInterior ? ROOM_TYPES : EXTERIOR_TYPES;
    const typeLabel = isInterior ? "2. 공간 유형 선택" : "2. 건물 유형 선택";

    const [style, setStyle] = useState(currentStyles[0].value);
    const [selectedType, setSelectedType] = useState(currentTypes[0].value);
    const [userPrompt, setUserPrompt] = useState('');

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [resultUrl, setResultUrl] = useState(''); // AI 변환 결과 이미지 URL
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [showCompareSlider, setShowCompareSlider] = useState(false);

    // ✨ 새로 추가된 상태 변수들
    const [convertedImageUrl, setConvertedImageUrl] = useState(null); // Firestore 저장을 위한 최종 이미지 URL
    const [showSaveNotification, setShowSaveNotification] = useState(false); // 저장 알림 표시 여부
    const [currentUser, setCurrentUser] = useState(null); // 현재 로그인된 사용자 정보

    // ✨ 컴포넌트 마운트 시 사용자 인증 상태 감지
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe(); // 클린업 함수
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
            setConvertedImageUrl(null); // 파일 변경 시 저장할 이미지 URL 초기화
            setError(null);
            setShowCompareSlider(false);
            setShowSaveNotification(false); // 파일 변경 시 저장 알림 숨기기
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
        setConvertedImageUrl(null); // 새로운 생성 시 저장할 이미지 URL 초기화
        setError(null);
        setShowCompareSlider(false);
        setShowSaveNotification(false); // 생성 시작 시 저장 알림 숨기기

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
                // ✨ 변환 성공 시, 저장 알림을 위한 URL 설정
                setConvertedImageUrl(data.imageUrl);
                setShowSaveNotification(true); // ✨ 저장 알림 표시
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
        setConvertedImageUrl(null); // 초기화 시 저장할 이미지 URL도 초기화
        setError(null);
        setShowCompareSlider(false);
        setShowSaveNotification(false); // 새로 시작 시 저장 알림 숨기기
        setUserPrompt('');
        const fileInput = document.getElementById('imageUploadInput');
        if(fileInput) fileInput.value = '';
    };

    const toggleCompareSlider = () => setShowCompareSlider(!showCompareSlider);

    // ✨ '저장하기' 버튼 클릭 시 호출될 함수
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

        setShowSaveNotification(false); // 알림 숨기기

        try {
            // Firestore에 변환 결과 정보 저장
            const userConversionsCollectionRef = collection(db, `users/${currentUser.uid}/conversions`);
            await addDoc(userConversionsCollectionRef, {
                imageUrl: convertedImageUrl, // 최종 변환된 이미지 URL
                prompt: userPrompt,          // 사용자가 입력한 프롬프트
                style: style,                // 선택된 스타일
                type: selectedType,          // 선택된 방/건물 유형
                tool: activeTool,            // 사용된 도구 (Interior/Exterior)
                createdAt: serverTimestamp(),// 서버 타임스탬프 (정확한 저장 시간)
            });

            alert('변환 결과가 성공적으로 저장되었습니다!');
            // 저장 후 convertedImageUrl은 그대로 두어 사용자가 계속 볼 수 있도록 하거나, 초기화할 수 있습니다.
            // 여기서는 일단 그대로 둡니다.
            // setConvertedImageUrl(null);
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
                    <div className="form-group">
                        <label>1. 스타일 선택</label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)}>
                            {currentStyles.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{typeLabel}</label>
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                            {currentTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
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

            {/* ✨ 저장 알림 모달/팝업 (조건부 렌더링) */}
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