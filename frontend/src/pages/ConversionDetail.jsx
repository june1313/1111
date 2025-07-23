// src/pages/ConversionDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// ✨ 1. 여기에 누락되었던 Tiptap 확장 기능 import를 모두 다시 추가합니다.
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Youtube from '@tiptap/extension-youtube';
import FontSize from 'tiptap-extension-font-size';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Link from '@tiptap/extension-link';

// ResizableImage 관련 코드는 현재 사용되지 않으므로 주석 처리하거나 필요 시 경로를 맞춰주세요.
// import { ResizableImage } from '../components/Editor/ResizableImage';

// const CustomImage = Image.extend({
//     addAttributes() { return { ...this.parent?.(), width: { default: null } }; },
//     addNodeView() { return ReactNodeViewRenderer(ResizableImage); },
// });


// ✨ 2. TiptapContentRenderer 컴포넌트를 확장 기능이 모두 포함된 버전으로 수정합니다.
const TiptapContentRenderer = ({ content }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                underline: false,
            }),
            Link.configure({ openOnClick: true, autolink: true,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                },
             }),
            TextStyle, FontFamily, Color, /* CustomImage, */ Image, FontSize, Underline,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Youtube.configure({ nocookie: true }),
            Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
        ],
        content: content,
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose-mirror-editor read-only-editor',
            },
        },
    });

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    return <EditorContent editor={editor} />;
};


function ConversionDetail() {
    // 이 아래의 나머지 코드는 이전과 동일합니다.
    const { conversionId } = useParams();
    const navigate = useNavigate();
    const [conversionData, setConversionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setCurrentUser(user);
            else navigate('/login');
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!currentUser || !conversionId) return;
        const loadData = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, `users/${currentUser.uid}/conversions`, conversionId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setConversionData({ id: docSnap.id, ...docSnap.data() });
                else setError("해당 기록을 찾을 수 없습니다.");
            } catch (err) {
                setError("데이터 로딩 중 오류 발생");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [conversionId, currentUser]);
    
    const handleDelete = async () => {
        if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
            try {
                const docRef = doc(db, `users/${currentUser.uid}/conversions`, conversionId);
                await deleteDoc(docRef);
                alert('삭제되었습니다.');
                navigate('/profile');
            } catch (err) {
                alert("삭제에 실패했습니다.");
            }
        }
    };
    
    if (loading) return <div className="container">로딩 중...</div>;
    if (error) return <div className="container error">{error}</div>;
    if (!conversionData) return <div className="container">정보를 불러올 수 없습니다.</div>;

    return (
        <div className="detail-page-container">
            <div className="detail-page-header">
                <h2>변환 상세 정보</h2>
                <div className="header-actions">
                    <button onClick={() => navigate('/profile')} className="start-new-button">
                        <span className="material-symbols-outlined">arrow_back</span>
                        목록으로
                    </button>
                    <button onClick={handleDelete} className="logout-button-sidebar">
                        <span className="material-symbols-outlined">delete</span>
                        삭제하기
                    </button>
                </div>
            </div>

            <div className="detail-content-layout">
                <div className="detail-image-wrapper">
                    <img src={conversionData.imageUrl} alt="AI 변환 결과" />
                </div>
                
                <div className="detail-info-card">
                    <div className="info-section">
                        <div className="info-label">
                            <span className="material-symbols-outlined">edit_note</span>
                            <h3>프롬프트</h3>
                        </div>
                        <div className="prompt-content">
                            {conversionData.prompt ? 
                                <TiptapContentRenderer content={conversionData.prompt} /> : 
                                <p>입력된 프롬프트가 없습니다.</p>
                            }
                        </div>
                    </div>

                    <div className="info-section">
                        <div className="info-label">
                            <span className="material-symbols-outlined">grid_view</span>
                            <h3>요약 정보</h3>
                        </div>
                        <div className="metadata-grid">
                            <div className="metadata-item">
                                <span className="item-label">스타일</span>
                                <span className="item-value">{conversionData.style || 'N/A'}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="item-label">유형</span>
                                <span className="item-value">{conversionData.type || 'N/A'}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="item-label">도구</span>
                                <span className="item-value">{conversionData.tool || 'N/A'}</span>
                            </div>
                            <div className="metadata-item">
                                <span className="item-label">저장일</span>
                                <span className="item-value">{conversionData.createdAt?.toDate().toLocaleString() || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {conversionData.info && (
                        <div className="info-section">
                            <div className="info-label">
                                <span className="material-symbols-outlined">developer_mode</span>
                                <h3>생성 정보 (Dev)</h3>
                            </div>
                            <pre className="info-code-block">{conversionData.info}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConversionDetail;