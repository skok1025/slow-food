import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const LoginModal = ({ isOpen, onClose, onLogin, onSignupClick }) => {
    const [memberId, setMemberId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Hash password on client side using Web Crypto API
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-512', passwordData);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    member_id: memberId,
                    password: hashedPassword, // Send hashed password
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                onLogin(data.user);
                onClose();
            } else {
                setError(data.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 연결 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="bg-white rounded-lg p-4 shadow-md" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: '1.5rem' }}>로그인</h2>
                    <button onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>아이디</label>
                        <input
                            type="text"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid #ccc'
                            }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid #ccc'
                            }}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 500,
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={onSignupClick}
                            style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', textDecoration: 'underline' }}
                        >
                            계정이 없으신가요? 회원가입
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
