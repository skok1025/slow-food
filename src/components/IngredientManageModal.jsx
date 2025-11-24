import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const IngredientManageModal = ({ isOpen, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        icon: '🥗'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch ingredients when modal opens
    React.useEffect(() => {
        if (isOpen) {
            fetchIngredients();
            setDeletingId(null);
        }
    }, [isOpen]);

    const fetchIngredients = () => {
        fetch(`${API_BASE_URL}/api/ingredients`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setIngredients(data);
                }
            })
            .catch(err => console.error('Failed to fetch ingredients:', err));
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                onUpdate(); // Reload parent's list
                fetchIngredients(); // Reload local list
                setFormData({ id: '', name: '', icon: '🥗' });
                alert('식재료가 추가되었습니다.');
            } else {
                alert(data.message || '식재료 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Add ingredient error:', error);
            alert('서버 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
    };

    const handleCancelDelete = () => {
        setDeletingId(null);
    };

    const handleConfirmDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                onUpdate(); // Reload parent's list
                fetchIngredients(); // Reload local list
            } else {
                alert(data.message || '식재료 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete ingredient error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setDeletingId(null);
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
            <div className="bg-white rounded-lg p-4 shadow-md" style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>식재료 관리</h2>
                    <button onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>새 식재료 추가</h3>
                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>ID (영문)</label>
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="예: spinach"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>이름 (한글)</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="예: 시금치"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>아이콘 (이모지)</label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                placeholder="예: 🥬"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            />
                        </div>

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
                            {isLoading ? '추가 중...' : '추가하기'}
                        </button>
                    </form>

                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>등록된 식재료 목록</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {ingredients.map(ing => (
                                <div key={ing.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{ing.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{ing.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{ing.id}</div>
                                        </div>
                                    </div>
                                    <div>
                                        {deletingId === ing.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleConfirmDelete(ing.id)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        color: 'white',
                                                        backgroundColor: '#dc3545',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    확인
                                                </button>
                                                <button
                                                    onClick={handleCancelDelete}
                                                    style={{
                                                        padding: '0.5rem',
                                                        color: '#333',
                                                        backgroundColor: '#e0e0e0',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteClick(ing.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    color: '#dc3545',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {ingredients.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>등록된 식재료가 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IngredientManageModal;
