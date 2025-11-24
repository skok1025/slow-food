import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import IngredientFilter from './components/IngredientFilter';
import RecipeList from './components/RecipeList';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import RecipeUploadModal from './components/RecipeUploadModal';
import IngredientManageModal from './components/IngredientManageModal';
import RecipeDetailModal from './components/RecipeDetailModal';
import HeroCarousel from './components/HeroCarousel';
import { recipes as initialRecipes } from './data/recipes';
import { API_BASE_URL } from './config';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isIngredientManageOpen, setIsIngredientManageOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'favorites'
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Fetch ingredients from API
  const fetchIngredients = () => {
    fetch(`${API_BASE_URL}/api/ingredients`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIngredients(data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch ingredients:', err);
      });
  };

  // Fetch recipes from API


  const fetchRecipes = () => {
    fetch(`${API_BASE_URL}/api/recipes`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRecipes(data);
        } else {
          // If DB is empty, use initial mock data
          setRecipes(initialRecipes);
        }
      })
      .catch(err => {
        console.error('Failed to fetch recipes:', err);
        setRecipes(initialRecipes); // Fallback to mock data
      });
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setFavoriteRecipeIds([]);
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setFavoriteRecipeIds(data.favorites);
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchIngredients();

    // Check for logged in user and fetch favorites
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFavorites();
    }
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    // 1. Filter by ingredient
    if (selectedIngredients.length > 0) {
      const hasAllIngredients = selectedIngredients.every(selectedId =>
        recipe.ingredients && recipe.ingredients.some(ing => ing.id === selectedId)
      );
      if (!hasAllIngredients) return false;
    }
    // 2. Filter by favorites if in favorite view mode
    if (viewMode === 'favorites' && !favoriteRecipeIds.includes(recipe.id)) {
      return false;
    }
    return true;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoginOpen(false);
    localStorage.setItem('user', JSON.stringify(userData));
    fetchFavorites();
  };

  const handleLogout = () => {
    setUser(null);
    setFavoriteRecipeIds([]);
    setViewMode('all');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleViewRecipe = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setIsDetailOpen(true);
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const handleRecipeDeleted = (recipeId) => {
    setRecipes(recipes.filter(r => r.id !== recipeId));
  };

  const handleToggleFavorite = async (recipeId) => {
    if (!user) {
      alert('로그인이 필요한 기능입니다.');
      setIsLoginOpen(true);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setFavoriteRecipeIds(prev => {
          if (data.isFavorite) {
            return [...prev, recipeId];
          } else {
            return prev.filter(id => id !== recipeId);
          }
        });
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const handleIngredientSelect = (id) => {
    if (id === null) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients(prev => {
        if (prev.includes(id)) {
          return prev.filter(item => item !== id);
        } else {
          return [...prev, id];
        }
      });
    }
  };

  return (
    <Layout
      onLoginClick={() => setIsLoginOpen(true)}
      onLogoutClick={handleLogout}
      user={user}
      onUploadClick={() => setIsUploadOpen(true)}
      onManageIngredientsClick={() => setIsIngredientManageOpen(true)}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onSignupClick={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSignupSuccess={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <RecipeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        ingredients={ingredients}
        onUploadSuccess={(newRecipe) => {
          setRecipes([newRecipe, ...recipes]);
          alert('레시피가 등록되었습니다.');
        }}
      />
      <IngredientManageModal
        isOpen={isIngredientManageOpen}
        onClose={() => setIsIngredientManageOpen(false)}
        onUpdate={() => {
          // Reload ingredients without closing modal
          fetch(`${API_BASE_URL}/api/ingredients`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                setIngredients(data);
              }
            })
            .catch(err => console.error('Failed to reload ingredients:', err));
        }}
      />
      <HeroCarousel />

      <IngredientFilter
        ingredients={ingredients}
        selectedIngredients={selectedIngredients}
        onSelect={handleIngredientSelect}
        user={user}
        onAddRecipeClick={() => setIsUploadOpen(true)}
        onManageIngredientsClick={() => setIsIngredientManageOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <RecipeDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        recipeId={selectedRecipeId}
        user={user}
        onRecipeUpdated={handleRecipeUpdated}
        onRecipeDeleted={handleRecipeDeleted}
        isFavorite={favoriteRecipeIds.includes(selectedRecipeId)}
        onToggleFavorite={() => handleToggleFavorite(selectedRecipeId)}
      />

      <RecipeList
        recipes={filteredRecipes}
        onViewRecipe={handleViewRecipe}
        favoriteRecipeIds={favoriteRecipeIds}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}

export default App;
