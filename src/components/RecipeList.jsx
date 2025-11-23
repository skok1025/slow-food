import React from 'react';
import RecipeCard from './RecipeCard';

const RecipeList = ({ recipes, onViewRecipe, favoriteRecipeIds = [], onToggleFavorite }) => {
    if (recipes.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                선택한 식재료로 만들 수 있는 레시피가 없습니다.
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
        }}>
            {recipes.map((recipe) => (
                <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onViewRecipe={onViewRecipe}
                    isFavorite={favoriteRecipeIds.includes(recipe.id)}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    );
};

export default RecipeList;
