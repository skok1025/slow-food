import React from 'react';

const IngredientFilter = ({ ingredients, selectedIngredients, onSelect, user, onAddRecipeClick, onManageIngredientsClick, viewMode, onViewModeChange }) => {
    return (
        <div className="mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>식재료별 레시피</h2>
                {user && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {user.is_admin && (
                            <button
                                onClick={onManageIngredientsClick}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                🥗 식재료 관리
                            </button>
                        )}
                        <button
                            onClick={onAddRecipeClick}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            + 레시피 등록
                        </button>
                    </div>
                )}
            </div>
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                paddingBottom: '1rem'
            }}>
                <button
                    onClick={() => onSelect(null)}
                    style={{
                        padding: '0.5rem 1.5rem',
                        borderRadius: '2rem',
                        backgroundColor: selectedIngredients.length === 0 ? 'var(--color-primary)' : 'white',
                        color: selectedIngredients.length === 0 ? 'white' : 'var(--color-text)',
                        border: '1px solid var(--color-primary)',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    전체
                </button>
                {ingredients.map((ingredient) => (
                    <button
                        key={ingredient.id}
                        onClick={() => onSelect(ingredient.id)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '2rem',
                            backgroundColor: selectedIngredients.includes(ingredient.id) ? 'var(--color-primary)' : 'white',
                            color: selectedIngredients.includes(ingredient.id) ? 'white' : 'var(--color-text)',
                            border: '1px solid var(--color-primary)',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{ingredient.icon}</span>
                        {ingredient.name}
                    </button>
                ))}
            </div>
        </div >
    );
};

export default IngredientFilter;
