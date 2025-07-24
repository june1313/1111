// src/components/Auth/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth'; // ✨ setPersistence와 browserSessionPersistence 임포트 추가
import { auth } from '../../firebaseConfig';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✨ 1. 실제 로그인 로직을 처리하는 함수
    const handleLogin = async () => {
        if (!email || !password) {
            setError('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // ✨ 로그인 전에 세션 유지 방식을 SESSION으로 설정
            // 브라우저 탭/창을 닫으면 자동으로 로그아웃됩니다.
            await setPersistence(auth, browserSessionPersistence);

            await signInWithEmailAndPassword(auth, email, password);
            navigate('/'); // 로그인 성공 시 메인 페이지로 이동
        } catch (err) {
            // Firebase 에러 코드에 따른 한글 메시지 처리
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('등록되지 않은 이메일입니다.');
                    break;
                case 'auth/wrong-password':
                    setError('비밀번호가 일치하지 않습니다.');
                    break;
                case 'auth/invalid-email':
                    setError('유효하지 않은 이메일 형식입니다.');
                    break;
                default:
                    setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
                    console.error("Login error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    // ✨ 2. form 태그의 제출 이벤트를 처리하는 함수
    const handleLoginSubmit = (event) => {
        event.preventDefault(); // form의 기본 동작(페이지 새로고침) 방지
        handleLogin(); // 위에서 만든 로그인 함수 호출
    };

    return (
        <div className="container">
            {/* ✨ 3. form 태그로 모든 입력 필드와 버튼을 감싸고 onSubmit 이벤트 연결 */}
            <form onSubmit={handleLoginSubmit}>
                <h2>로그인</h2>
                <div className="form-group">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        required
                    />
                </div>

                {error && <p className="error" style={{ marginBottom: '16px' }}>{error}</p>}

                {/* ✨ 4. 로그인 버튼에 type="submit" 속성 추가 */}
                <button type="submit" className="generate-button" disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                </button>
            </form>
            <p style={{ marginTop: '24px' }}>
                계정이 없으신가요? <Link to="/register">가입하기</Link>
            </p>
        </div>
    );
}

export default Login;