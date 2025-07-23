// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

function Profile() {
    const [userEmail, setUserEmail] = useState('');
    const [userConversions, setUserConversions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async user => {
            if (user) {
                setUserEmail(user.email);

                const conversionsRef = collection(db, `users/${user.uid}/conversions`);
                const q = query(conversionsRef, orderBy('createdAt', 'desc'));

                const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
                    const conversions = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setUserConversions(conversions);
                    setLoading(false);
                }, (err) => {
                    console.error("Firestore 변환 목록 가져오기 오류:", err);
                    setError("변환 목록을 불러오는 데 실패했습니다.");
                    setLoading(false);
                });

                return () => unsubscribeFirestore();
            } else {
                setUserEmail('');
                setUserConversions([]);
                setLoading(false);
                navigate('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert('로그아웃 되었습니다.');
            navigate('/login');
        } catch (error) {
            console.error("로그아웃 실패:", error);
            alert('로그아웃에 실패했습니다.');
        }
    };

    const handleViewDetail = (conversionId) => {
        navigate(`/profile/${conversionId}`);
    };

    // ✨ 목록에서 바로 항목을 삭제하는 함수
    const handleDeleteFromList = async (e, conversionId) => {
        // 중요: 카드 전체의 클릭 이벤트(상세보기)가 실행되는 것을 막습니다.
        e.stopPropagation(); 
        
        const isConfirmed = window.confirm("정말로 이 변환 기록을 삭제하시겠습니까?");
        if (isConfirmed && auth.currentUser) {
            try {
                const docRef = doc(db, `users/${auth.currentUser.uid}/conversions`, conversionId);
                await deleteDoc(docRef);
                // onSnapshot이 실시간으로 감지하므로 목록이 자동 갱신됩니다.
            } catch (err) {
                console.error("삭제 실패:", err);
                alert("기록 삭제에 실패했습니다.");
            }
        }
    };

    if (loading) {
        return <div className="container">로딩 중...</div>;
    }

    if (error) {
        return <div className="container error">{error}</div>;
    }

    return (
        <div className="profile-container">
            <h2>내 프로필</h2>
            {userEmail && (
                <p>환영합니다, **{userEmail}**님!</p>
            )}
            
            <button className="generate-button" onClick={handleLogout} style={{ marginTop: '20px', marginBottom: '30px' }}>
                로그아웃
            </button>

            <h3>저장된 변환 목록</h3>
            {userConversions.length === 0 ? (
                <p>아직 저장된 변환 목록이 없습니다. 이미지를 생성하고 저장해보세요!</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {userConversions.map((conversion) => (
                        <div
                            key={conversion.id}
                            onClick={() => handleViewDetail(conversion.id)}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '10px',
                                textAlign: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                backgroundColor: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative', // 삭제 버튼 위치의 기준점
                            }}
                        >
                            {/* ✨ 삭제 버튼 추가 */}
                            <button
                                onClick={(e) => handleDeleteFromList(e, conversion.id)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }}
                                title="삭제하기"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#333' }}>delete</span>
                            </button>

                            <img
                                src={conversion.imageUrl}
                                alt="Converted Result Thumbnail"
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    maxHeight: '180px',
                                    objectFit: 'contain',
                                    borderRadius: '4px',
                                    marginBottom: '10px',
                                    flexShrink: 0,
                                }}
                            />
                            <div style={{ width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '5px', paddingRight: '5px', textAlign: 'left' }}>
                                <p style={{ fontSize: '0.9em', color: '#555', marginTop: '5px', fontWeight: 'bold', lineHeight: '1.3em', maxHeight: '2.6em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {conversion.prompt ? (conversion.prompt.replace(/<[^>]*>/g, '').substring(0, 50) + '...') : '프롬프트 없음'}
                                </p>
                                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                                    {conversion.style || '스타일 없음'} / {conversion.type || '유형 없음'}
                                </p>
                                <p style={{ fontSize: '0.7em', color: '#aaa', marginTop: '5px' }}>
                                    저장일: {conversion.createdAt?.toDate().toLocaleDateString() || '날짜 없음'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Profile;