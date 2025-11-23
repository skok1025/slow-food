import React from 'react';

const RecipeCard = ({ recipe, onViewRecipe, isFavorite, onToggleFavorite }) => {

    return (
        <div className="bg-white rounded-lg shadow-md" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}>
            <div style={{
                height: '200px',
                backgroundImage: `url(${recipe.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }} />
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-primary)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {recipe.difficulty} • {recipe.time}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(recipe.id);
                        }}
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
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{recipe.title}</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                    {recipe.shortDescription}
                </p>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {recipe.ingredients.map(ing => (
                            <span key={ing.id} style={{ fontSize: '1.2rem' }} title={ing.name}>
                                {ing.icon}
                            </span>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => onViewRecipe(recipe.id)}
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500
                    }}
                >
                    레시피 보기
                </button>
            </div>
        </div>
    );
};

export default RecipeCard;
