// src/components/Auth/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        setMessage('');
        setIsError(false);

        if (email.length === 0 || password.length === 0) {
            setMessage('이메일과 비밀번호를 모두 입력해주세요.');
            setIsError(true);
            return;
        }
        if (password.length < 6) {
            setMessage('비밀번호는 6자 이상이어야 합니다.');
            setIsError(true);
            return;
        }

        setMessage('회원가입 중...', false);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("회원가입 성공:", user);
            setMessage('회원가입에 성공했습니다!');
            setIsError(false);

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date()
            });

            console.log(`Firestore에 사용자 ${user.uid}의 기본 정보 저장 성공.`);
            setMessage('회원가입 및 사용자 정보 저장이 완료되었습니다!');

            setEmail('');
            setPassword('');
            navigate('/');

        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("회원가입 실패:", errorCode, errorMessage);

            let displayMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
            if (errorCode === 'auth/email-already-in-use') {
                displayMessage = '이미 사용 중인 이메일 주소입니다. 다른 이메일을 사용해주세요.';
            } else if (errorCode === 'auth/invalid-email') {
                displayMessage = '유효하지 않은 이메일 형식입니다. 올바른 이메일을 입력해주세요.';
            } else if (errorCode === 'auth/weak-password') {
                displayMessage = '비밀번호는 6자 이상이어야 합니다. 더 강력한 비밀번호를 사용해주세요.';
            } else if (errorCode === 'auth/network-request-failed') {
                displayMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
            }
            setMessage(displayMessage);
            setIsError(true);
        }
    };

    return (
        <div className="container">
            <h2>회원가입</h2>
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
                    placeholder="비밀번호 (6자 이상)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button className="generate-button" onClick={handleRegister}>
                회원가입
            </button>
            {message && (
                <p className={isError ? 'error' : 'success-message'} style={{ marginTop: '15px' }}>
                    {message}
                </p>
            )}
            <p style={{ marginTop: '20px' }}>
                이미 계정이 있으신가요? {' '}
                <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}>
                    로그인
                </Link>
            </p>
        </div>
    );
}

export default Register;