// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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

                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        console.log("Firestore에서 사용자 기본 정보 가져옴:", userDocSnap.data());
                    }
                } catch (err) {
                    console.error("Firestore에서 사용자 기본 정보 가져오기 오류:", err);
                    setError("사용자 기본 정보를 불러오는 데 실패했습니다.");
                }

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

    if (loading) {
        return <div className="container">로딩 중...</div>;
    }

    if (error) {
        return <div className="container error">{error}</div>;
    }

    return (
        <div className="container">
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {userConversions.map((conversion) => (
                        <div key={conversion.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '10px',
                            textAlign: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            backgroundColor: '#fff'
                        }}>
                            <img
                                src={conversion.imageUrl}
                                alt="Converted Result"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginBottom: '10px' }}
                            />
                            <p style={{ fontSize: '0.9em', color: '#555', wordBreak: 'break-word' }}>
                                **프롬프트:** {conversion.prompt || '없음'}
                            </p>
                            <p style={{ fontSize: '0.8em', color: '#888' }}>
                                **스타일:** {conversion.style || '없음'}
                            </p>
                            <p style={{ fontSize: '0.8em', color: '#888' }}>
                                **유형:** {conversion.type || '없음'}
                            </p>
                            <p style={{ fontSize: '0.7em', color: '#aaa', marginTop: '5px' }}>
                                저장일: {conversion.createdAt?.toDate().toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Profile;