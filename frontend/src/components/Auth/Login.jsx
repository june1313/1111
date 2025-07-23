// src/components/Auth/Login.jsx


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();


    const handleLogin = async () => {
        setErrorMessage('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('로그인 성공');
            navigate('/');
        } catch (error) {
            let message = '로그인에 실패했습니다.';
            if (error.code === 'auth/invalid-email') {
                message = '유효하지 않은 이메일 형식입니다.';
            } else if (error.code === 'auth/user-not-found') {
                message = '등록되지 않은 이메일입니다.';
            } else if (error.code === 'auth/wrong-password') {
                message = '비밀번호가 일치하지 않습니다.';
            } else if (error.code === 'auth/network-request-failed') {
                message = '네트워크 연결에 실패했습니다.';
            }
            alert(message); // 알림 창 표시
            setErrorMessage(message); // 혹시 모를 상황에 대비하여 상태도 업데이트
        }
    };


    return (
        <div className="container">
            <h2>로그인</h2>
            <div className="form-group">
                <input
                    type="email"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button className="generate-button" onClick={handleLogin}>
                로그인
            </button>
            {/* 기존의 에러 메시지 표시는 제거 */}
            <p style={{ marginTop: '20px' }}>
                계정이 없으신가요?{' '}
                <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}>
                    회원가입
                </Link>
            </p>
        </div>
    );
}


export default Login;