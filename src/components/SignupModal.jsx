import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const SignupModal = ({ isOpen, onClose, onSignupSuccess }) => {
    const [formData, setFormData] = useState({
        member_id: '',
        password: '',
        name: '',
        tel: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Hash password on client side
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(formData.password);
            const hashBuffer = await crypto.subtle.digest('SHA-512', passwordData);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const response = await fetch(`${API_BASE_URL}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    member_id: formData.member_id,
                    password: hashedPassword, // Send hashed password
                    name: formData.name,
                    tel: formData.tel
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                onSignupSuccess();
                onClose();
            } else {
                setError(data.message || '회원가입에 실패했습니다.');
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
                    <h2 style={{ fontSize: '1.5rem' }}>회원가입</h2>
                    <button onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>아이디</label>
                        <input
                            type="text"
                            name="member_id"
                            value={formData.member_id}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>전화번호</label>
                        <input
                            type="tel"
                            name="tel"
                            value={formData.tel}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
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
                        {isLoading ? '가입 중...' : '가입하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupModal;
