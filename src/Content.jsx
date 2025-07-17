import React, { useState } from 'react';
import ReactCompareImage from 'react-compare-image';
import './App.css'; // Ensure App.css is imported


const STYLES = ["Modern", "Minimalist", "Scandinavian", "Bohemian", "Industrial", "Coastal"];
const ROOM_TYPES = ["living room", "bedroom", "kitchen", "bathroom", "dining room", "home office", "patio"];


function Content({ activeTool }) {
    const [style, setStyle] = useState('Modern');
    const [roomType, setRoomType] = useState('living room');
    const [userPrompt, setUserPrompt] = useState('');

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [showCompareSlider, setShowCompareSlider] = useState(false);

    const handleImageChange = (file) => {
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResultUrl('');
            setError(null);
            setShowCompareSlider(false); // New image, hide slider
        }
    };

    const handleImageUpload = (event) => {
        handleImageChange(event.target.files?.[0]);
    };

    const handleGenerateClick = async () => {
        if (!imageFile) {
            alert('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setResultUrl('');
        setError(null);
        setShowCompareSlider(false); // Generating new, hide slider

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
            console.error("Image generation error:", err);
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
        handleImageChange(event.dataTransfer?.files?.[0]);
    };

    const toggleCompareSlider = () => {
        setShowCompareSlider(!showCompareSlider);
    };

    return (
        <main className="content">
            <div className="content-header">
                <h1>{activeTool === 'Interior' ? 'Interior AI Designer' : 'Exterior AI Designer'}</h1>
                <p>Upload a photo and see your space transformed in seconds. The power of AI at your fingertips.</p>
            </div>

            <div className="main-layout">
                <div className="controls-panel">
                    <h3>
                        <span className="material-symbols-outlined">tune</span>
                        Your Design Controls
                    </h3>
                    <div className="form-group">
                        <label>1. Select Style</label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)}>
                            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>2. Select Space Type</label>
                        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                            {ROOM_TYPES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>3. Add Extra Details (Optional)</label>
                        <textarea
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            placeholder="e.g., with a large leather sofa..."
                        />
                    </div>

                    <div className="action-buttons-vertical">
                        <button
                            className="generate-button"
                            onClick={handleGenerateClick}
                            disabled={isLoading || !imageFile}
                        >
                            <span className="material-symbols-outlined">auto_awesome</span>
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                        {previewUrl && (
                            <button
                                className="start-new-button"
                                onClick={handleStartNew}
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Start New Project
                            </button>
                        )}
                    </div>
                </div>

                <div className="image-panel">
                    {!previewUrl ? (
                        <div
                            className={`upload-card ${isDragging ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                            onClick={() => document.getElementById('imageUpload').click()}
                        >
                            <span className="material-symbols-outlined upload-icon">add_photo_alternate</span>
                            <h4>Upload Your Photo</h4>
                            <p>Drag & Drop or Click to Browse</p>
                            <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} hidden />
                        </div>
                    ) : (
                        <div className="result-container">
                            {showCompareSlider && resultUrl && !isLoading && !error ? (
                                <div className="comparison-slider-wrapper">
                                    <h4>Drag Handle to Compare</h4>
                                    <div className="comparison-slider-container">
                                        <ReactCompareImage
                                            leftImage={previewUrl}
                                            rightImage={resultUrl}
                                            leftImageLabel="Original"
                                            rightImageLabel="AI Result"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="result-view">
                                    <div className="image-box">
                                      <div className="image-box-header">
                                        <h3>Original</h3>
                                      </div>
                                        <div className="image-content-wrapper">
                                            <img src={previewUrl} alt="Original" />
                                        </div>
                                    </div>
                                    <div className="image-box">
                                        <div className="image-box-header">
                                            <h3>AI Result</h3>
                                            {resultUrl && !isLoading && !error && (
                                                <button className="compare-button" onClick={toggleCompareSlider}>
                                                    <span className="material-symbols-outlined">compare</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="image-content-wrapper">
                                            {isLoading && <div className="loading-spinner"></div>}
                                            {error && <div className="error-message">{error}</div>}
                                            {resultUrl && !isLoading && <img src={resultUrl} alt="AI Result" />}
                                            {!isLoading && !resultUrl && !error && <div className="placeholder">Press 'Generate' to see the result.</div>}
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