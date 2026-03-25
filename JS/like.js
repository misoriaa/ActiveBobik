document.addEventListener('DOMContentLoaded', function() {
    const recipesGrid = document.querySelector('.recipes-grid');
    
    // Функция для создания модального окна с рецептом
    function createRecipeModal(recipe) {
        const modal = document.createElement('div');
        modal.className = 'recipe-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2 class="modal-title jost-bold">${recipe.name}</h2>
                <img src="${recipe.image}" alt="${recipe.name}" class="modal-image">
                
                <div class="modal-stats">
                    <div class="stat-item">
                        <span class="stat-value">${recipe.calories}</span>
                        <span class="stat-label">ккал</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${recipe.protein}</span>
                        <span class="stat-label">белки</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${recipe.fat}</span>
                        <span class="stat-label">жиры</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${recipe.carbs}</span>
                        <span class="stat-label">углеводы</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${recipe.mealType}</span>
                        <span class="stat-label">прием пищи</span>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3 class="section-title jost-semibold">Ингредиенты:</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="modal-section">
                    <h3 class="section-title jost-semibold">Приготовление:</h3>
                    <ol class="instructions-list">
                        ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <button class="remove-favorite-btn jost-medium" data-id="${recipe.id}">
                    Удалить из избранного
                </button>
            </div>
        `;
        
        return modal;
    }
    
    // Функция для отображения избранных рецептов
    function displayFavoriteRecipes() {
        const favoriteRecipesList = getFavoriteRecipes();
        
        if (favoriteRecipesList.length === 0) {
            recipesGrid.innerHTML = `
                <li class="empty-favorites">
                    <p class="jost-regular">😢 У вас пока нет избранных рецептов</p>
                    <p class="jost-light">Добавьте рецепты в избранное на странице меню</p>
                    <a href="../menu/menu.html" class="menu-btn jost-medium">Перейти в меню</a>
                </li>
            `;
            return;
        }
        
        recipesGrid.innerHTML = '';
        
        favoriteRecipesList.forEach(recipe => {
            const recipeItem = document.createElement('li');
            recipeItem.className = 'recipe-item';
            
            recipeItem.innerHTML = `
                <div class="recipe-card" data-recipe-id="${recipe.id}">
                    <div class="card-row">
                        <div class="card-image">
                            <img src="${recipe.image}" class="recipe-image" alt="${recipe.name}">
                        </div>
                        <div class="card-content">
                            <div class="content-wrapper">
                                <h5 class="recipe-name jost-bold">${recipe.name}</h5>
                                <div class="recipe-meta">
                                    <span class="meal-type">${recipe.mealType}</span>
                                    <span class="calories">${recipe.calories} ккал</span>
                                </div>
                                <p class="recipe-description">${recipe.description.substring(0, 150)}...</p>
                            </div>
                            <button class="show-more-btn jost-medium view-recipe" data-id="${recipe.id}">
                                Посмотреть рецепт
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            recipesGrid.appendChild(recipeItem);
        });
    }
    
    // Обработчик клика для открытия модального окна
    document.addEventListener('click', function(e) {
        const viewBtn = e.target.closest('.view-recipe');
        if (viewBtn) {
            e.preventDefault();
            const recipeId = parseInt(viewBtn.dataset.id);
            const recipe = recipes.find(r => r.id === recipeId);
            
            if (recipe) {
                const modal = createRecipeModal(recipe);
                document.body.appendChild(modal);
                document.body.style.overflow = 'hidden';
                
                // Закрытие модального окна
                const closeBtn = modal.querySelector('.close-modal');
                closeBtn.addEventListener('click', () => {
                    modal.remove();
                    document.body.style.overflow = '';
                });
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        document.body.style.overflow = '';
                    }
                });
                
                // Кнопка удаления из избранного в модальном окне
                const removeBtn = modal.querySelector('.remove-favorite-btn');
                removeBtn.addEventListener('click', () => {
                    toggleFavorite(recipeId);
                    modal.remove();
                    document.body.style.overflow = '';
                    displayFavoriteRecipes(); // Обновляем список
                });
            }
        }
    });
    
    // Инициализация отображения
    displayFavoriteRecipes();
    
    // Добавляем стили для модального окна и дополнительных элементов
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .recipe-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: slideUp 0.3s ease;
        }
        
        .close-modal {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 28px;
            cursor: pointer;
            color: #3D571F;
            transition: transform 0.2s;
        }
        
        .close-modal:hover {
            transform: scale(1.2);
            color: #5da130;
        }
        
        .modal-title {
            font-size: 24px;
            color: #3D571F;
            margin-bottom: 20px;
            padding-right: 30px;
        }
        
        .modal-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 15px;
            margin-bottom: 20px;
        }
        
        .modal-stats {
            display: flex;
            justify-content: space-around;
            background: #F6F6F6;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
            min-width: 80px;
        }
        
        .stat-value {
            display: block;
            font-size: 20px;
            font-weight: 600;
            color: #5da130;
        }
        
        .stat-label {
            font-size: 14px;
            color: #666;
        }
        
        .modal-section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            color: #3D571F;
            margin-bottom: 10px;
        }
        
        .ingredients-list, .instructions-list {
            padding-left: 20px;
        }
        
        .ingredients-list li, .instructions-list li {
            margin-bottom: 8px;
            color: #666;
            line-height: 1.4;
        }
        
        .instructions-list li {
            margin-bottom: 15px;
        }
        
        .recipe-meta {
            display: flex;
            gap: 15px;
            margin: 10px 0;
            font-size: 14px;
        }
        
        .meal-type {
            background: #DCFB73;
            padding: 4px 10px;
            border-radius: 15px;
            color: #3D571F;
            font-weight: 500;
        }
        
        .calories {
            background: #5da130;
            padding: 4px 10px;
            border-radius: 15px;
            color: white;
            font-weight: 500;
        }
        
        .remove-favorite-btn {
            width: 100%;
            padding: 15px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 15px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 20px;
        }
        
        .remove-favorite-btn:hover {
            background: #cc0000;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 68, 68, 0.3);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .empty-favorites {
            text-align: center;
            padding: 50px;
            list-style: none;
            background: white;
            border-radius: 20px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .empty-favorites p {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .empty-favorites p:first-child {
            font-size: 24px;
            margin-bottom: 20px;
        }
        
        .empty-favorites .menu-btn {
            display: inline-block;
            padding: 15px 30px;
            margin-top: 20px;
        }
    `;
    document.head.appendChild(modalStyles);
});