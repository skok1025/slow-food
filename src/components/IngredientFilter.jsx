import React from 'react';

const IngredientFilter = ({ ingredients, selectedIngredients, onSelect, user, onAddRecipeClick, onManageIngredientsClick, viewMode, onViewModeChange }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredIngredients = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                paddingBottom: '1rem',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    placeholder="🔍 식재료 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '200px',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        border: '1px solid #ddd',
                        fontSize: '0.95rem',
                        backgroundColor: '#f9f9f9'
                    }}
                />
                <style>
                    {`
                        @keyframes rainbowGlow {
                            0% { border-color: #ff0000; box-shadow: 0 0 10px #ff0000; }
                            15% { border-color: #ff7f00; box-shadow: 0 0 10px #ff7f00; }
                            30% { border-color: #ffff00; box-shadow: 0 0 10px #ffff00; }
                            45% { border-color: #00ff00; box-shadow: 0 0 10px #00ff00; }
                            60% { border-color: #0000ff; box-shadow: 0 0 10px #0000ff; }
                            75% { border-color: #4b0082; box-shadow: 0 0 10px #4b0082; }
                            90% { border-color: #9400d3; box-shadow: 0 0 10px #9400d3; }
                            100% { border-color: #ff0000; box-shadow: 0 0 10px #ff0000; }
                        }
                    `}
                </style>
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
                {filteredIngredients.map((ingredient) => {
                    const isMatch = searchTerm && ingredient.name.toLowerCase() === searchTerm.toLowerCase();
                    return (
                        <button
                            key={ingredient.id}
                            onClick={() => onSelect(ingredient.id)}
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: '2rem',
                                backgroundColor: selectedIngredients.includes(ingredient.id) ? 'var(--color-primary)' : 'white',
                                color: selectedIngredients.includes(ingredient.id) ? 'white' : 'var(--color-text)',
                                border: isMatch ? '2px solid transparent' : '1px solid var(--color-primary)',
                                animation: isMatch ? 'rainbowGlow 2s linear infinite' : 'none',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transform: isMatch ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{ingredient.icon}</span>
                            {ingredient.name}
                        </button>
                    );
                })}
                {filteredIngredients.length === 0 && (
                    <div style={{ color: '#666', padding: '0.5rem' }}>
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div >
    );
};

export default IngredientFilter;
