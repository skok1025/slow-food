import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const RecipeUploadModal = ({ isOpen, onClose, onUploadSuccess, ingredients }) => {
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        recipe: '',
        time: '',
        difficulty: '쉬움'
    });
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAIGenerating, setIsAIGenerating] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleIngredient = (ingredientId) => {
        setSelectedIngredients(prev =>
            prev.includes(ingredientId)
                ? prev.filter(id => id !== ingredientId)
                : [...prev, ingredientId]
        );
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleAIGenerate = async () => {
        if (!formData.title) {
            alert('먼저 레시피 제목을 입력해주세요.');
            return;
        }

        setIsAIGenerating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/recipes/generate-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title
                }),
            });

            const data = await response.json();

            if (data.success) {
                setFormData({
                    ...formData,
                    shortDescription: data.recipe.shortDescription,
                    recipe: data.recipe.recipe,
                    time: data.recipe.time,
                    difficulty: data.recipe.difficulty
                });
            } else {
                alert(data.message || 'AI 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            alert('AI 생성 중 오류가 발생했습니다.');
        } finally {
            setIsAIGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('shortDescription', formData.shortDescription);
        data.append('recipe', formData.recipe);
        data.append('time', formData.time);
        data.append('difficulty', formData.difficulty);
        data.append('ingredientIds', JSON.stringify(selectedIngredients)); // Add multiple ingredients
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/recipes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const responseData = await response.json(); // Renamed to avoid conflict with FormData 'data'

            if (responseData.success) {
                onUploadSuccess(responseData.recipe);
                onClose();
                setFormData({
                    title: '',
                    shortDescription: '',
                    recipe: '',
                    ingredientId: ingredients && ingredients.length > 0 ? ingredients[0].id : '',
                    time: '',
                    difficulty: '쉬움'
                });
                setSelectedIngredients([]);
                setImageFile(null);
            } else {
                alert(data.message || '레시피 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('서버 오류가 발생했습니다.');
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
            <div className="bg-white rounded-lg p-4 shadow-md" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: '1.5rem' }}>레시피 등록</h2>
                    <button onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>레시피 제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            required
                        />
                        <button
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={isAIGenerating || !formData.title}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.85rem',
                                backgroundColor: '#10a37f',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 500,
                                opacity: (isAIGenerating || !formData.title) ? 0.5 : 1,
                                cursor: (isAIGenerating || !formData.title) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isAIGenerating ? '🤖 생성 중...' : '🤖 AI로 내용 자동 생성'}
                        </button>
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>짧은 설명</label>
                        <input
                            type="text"
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            placeholder="한 줄로 요약 (예: 매콤하고 시원한 김치찌개)"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>레시피</label>
                        <textarea
                            name="recipe"
                            value={formData.recipe}
                            onChange={handleChange}
                            placeholder="재료와 조리 방법을 상세히 입력하세요"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc', minHeight: '150px' }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>주재료 (복수 선택 가능)</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: 'var(--radius-md)',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {ingredients && ingredients.map(ing => (
                                <label key={ing.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIngredients.includes(ing.id)}
                                        onChange={() => toggleIngredient(ing.id)}
                                    />
                                    <span>{ing.icon} {ing.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>조리 시간</label>
                            <input
                                type="text"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                placeholder="예: 30분"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>난이도</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                            >
                                <option value="쉬움">쉬움</option>
                                <option value="보통">보통</option>
                                <option value="어려움">어려움</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>이미지 업로드</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                        />
                        {imageFile && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                                선택된 파일: {imageFile.name}
                            </p>
                        )}
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
                        {isLoading ? '등록 중...' : '등록하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RecipeUploadModal;
