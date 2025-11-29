import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const RecipeDetailModal = ({ isOpen, onClose, recipeId, user, onRecipeUpdated, onRecipeDeleted, isFavorite, onToggleFavorite }) => {
    const [recipe, setRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        recipe: '',
        time: '',
        difficulty: '쉬움'
    });
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        if (isOpen && recipeId) {
            setIsLoading(true);
            fetch(`${API_BASE_URL}/api/recipes/${recipeId}`)
                .then(res => res.json())
                .then(data => {
                    // Check if data has success property (standard API response) or is the recipe object directly
                    const recipeData = data.success ? data.recipe : data;

                    if (recipeData && recipeData.id) {
                        setRecipe(recipeData);
                        setFormData({
                            title: recipeData.title,
                            shortDescription: recipeData.shortDescription,
                            recipe: recipeData.recipe,
                            time: recipeData.time,
                            difficulty: recipeData.difficulty
                        });
                        if (recipeData.ingredients) {
                            setSelectedIngredients(recipeData.ingredients.map(ing => ing.id));
                        }
                    } else {
                        alert(data.message || '레시피를 불러올 수 없습니다.');
                        onClose();
                    }
                })
                .catch(err => {
                    console.error('Fetch recipe error:', err);
                    alert('레시피를 불러오는 중 오류가 발생했습니다.');
                    onClose();
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, recipeId, onClose]);

    useEffect(() => {
        if (isEditMode && ingredients.length === 0) {
            fetch(`${API_BASE_URL}/api/ingredients`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setIngredients(data);
                    }
                })
                .catch(err => console.error('Failed to fetch ingredients:', err));
        }
    }, [isEditMode, ingredients.length]);

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
        setImageFile(e.target.files[0]);
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setImageFile(null);
        // Reset form to original recipe data
        setFormData({
            title: recipe.title,
            shortDescription: recipe.shortDescription,
            recipe: recipe.recipe,
            time: recipe.time,
            difficulty: recipe.difficulty
        });
        setSelectedIngredients(recipe.ingredients ? recipe.ingredients.map(ing => ing.id) : []);
    };

    const handleSave = async () => {
        console.log('handleSave started');
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('shortDescription', formData.shortDescription);
            formDataToSend.append('recipe', formData.recipe);
            formDataToSend.append('ingredientIds', JSON.stringify(selectedIngredients));
            formDataToSend.append('time', formData.time);
            formDataToSend.append('difficulty', formData.difficulty);

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            console.log('Sending PUT request...');
            const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend,
            });
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                console.log('Update successful, updating state...');
                setRecipe(data.recipe);
                setIsEditMode(false);
                setImageFile(null);
                console.log('Calling onRecipeUpdated...');
                onRecipeUpdated(data.recipe);
                console.log('onRecipeUpdated done');
                alert('레시피가 수정되었습니다.');
            } else {
                console.warn('Update failed:', data.message);
                alert(data.message || '레시피 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('Update recipe error details:', error);
            alert('레시피 수정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말 이 레시피를 삭제하시겠습니까?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (data.success) {
                onRecipeDeleted(recipeId);
                onClose();
                alert('레시피가 삭제되었습니다.');
            } else {
                alert(data.message || '레시피 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete recipe error:', error);
            alert('레시피 삭제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

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
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="bg-white rounded-lg shadow-md" style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
            }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
                ) : recipe ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                                    {isEditMode ? '레시피 수정' : '레시피 상세'}
                                </h2>
                                {!isEditMode && user && (
                                    <button
                                        onClick={() => onToggleFavorite()}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            color: isFavorite ? '#FFD700' : '#ccc',
                                            padding: 0,
                                            lineHeight: 1
                                        }}
                                    >
                                        {isFavorite ? '★' : '☆'}
                                    </button>
                                )}
                            </div>
                            <button onClick={onClose} style={{ fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        {isEditMode ? (
                            // Edit Mode
                            <div>
                                <div className="mb-4">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>제목</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>짧은 설명</label>
                                    <input
                                        type="text"
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
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
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc', minHeight: '200px' }}
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
                                        {ingredients.map(ing => (
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

                                <div className="mb-4">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>조리 시간</label>
                                    <input
                                        type="text"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        placeholder="예: 30분"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                                    />
                                </div>

                                <div className="mb-4">
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

                                <div className="mb-4">
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>이미지</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ccc' }}
                                    />
                                    {recipe.image && !imageFile && (
                                        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                                            현재 이미지: {recipe.image}
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500
                                        }}
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: '#ccc',
                                            color: '#333',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500
                                        }}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div>
                                {recipe.image && (
                                    <div style={{
                                        width: '100%',
                                        height: '300px',
                                        backgroundImage: `url(${recipe.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1.5rem'
                                    }} />
                                )}

                                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{recipe.title}</h3>
                                <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                                    {recipe.shortDescription}
                                </p>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-light)',
                                        backgroundColor: '#E8F5E9',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        ⏱️ {recipe.time}
                                    </span>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-light)',
                                        backgroundColor: '#FFF3E0',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        📊 {recipe.difficulty}
                                    </span>
                                </div>

                                {recipe.ingredients && recipe.ingredients.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>사용된 식재료</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {recipe.ingredients.map(ing => (
                                                <span key={ing.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: '#f0f0f0',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <span>{ing.icon}</span>
                                                    <span>{ing.name}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.8',
                                    fontSize: '1rem',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    {recipe.recipe}
                                </div>

                                {user && user.is_admin && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
                                        <button
                                            onClick={handleEdit}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'white',
                                                borderRadius: 'var(--radius-md)',
                                                fontWeight: 500
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isLoading}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                borderRadius: 'var(--radius-md)',
                                                fontWeight: 500
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default RecipeDetailModal;
