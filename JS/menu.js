document.addEventListener('DOMContentLoaded', function () {
    console.log('Menu.js загружен!');
    const burgerIcon = document.querySelector('.burger-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    const overlay = document.querySelector('.overlay');

    // Открытие меню
    if (burgerIcon) {
        burgerIcon.addEventListener('click', function () {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
        });
    }

    // Закрытие меню (крестик)
    if (closeMenu) {
        closeMenu.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Возвращаем прокрутку
        });
    }

    // Закрытие меню при клике на оверлей
    if (overlay) {
        overlay.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Закрытие меню при клике на ссылку
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    const dayFilter = document.querySelector('.day-filter');
    const portionsFilter = document.querySelector('.portions-filter');
    const dayText = dayFilter.querySelector('.day-text');
    const portionsText = portionsFilter.querySelector('.portions-text');
    const dishesBlock = document.querySelector('.dishes_block');
    const addToCartBtn = document.querySelector('.add_btn');

    // Текущие настройки
    let currentDay = 'today';
    let currentMeals = 3;

    // Получаем текущие даты
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const tomorrowStr = tomorrow.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // Устанавливаем начальные значения
    dayText.textContent = `Сегодня, ${todayStr}`;
    portionsText.textContent = '3 приёма пищи';

    // Функция для генерации меню
    function generateMenu(mealCount) {
        console.log('Генерируем меню для', mealCount, 'приемов');

        let menu = [];
        let usedIds = [];

        // Получаем рецепты по типам
        const breakfasts = recipes.filter(r => r.mealType === 'Завтрак');
        const lunches = recipes.filter(r => r.mealType === 'Обед');
        const dinners = recipes.filter(r => r.mealType === 'Ужин');
        const extras = recipes.filter(r => r.mealType === 'Перекус' || r.mealType === 'Полдник');

        console.log('Доступно рецептов:', {
            завтрак: breakfasts.length,
            обед: lunches.length,
            ужин: dinners.length,
            доп: extras.length
        });

        function getRandomRecipe(array, excludeIds) {
            if (!array || array.length === 0) return null;
            const available = array.filter(r => !excludeIds.includes(r.id));
            if (available.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * available.length);
            return available[randomIndex];
        }

        // 1. ЗАВТРАК
        let breakfast = getRandomRecipe(breakfasts, usedIds);
        if (breakfast) {
            menu.push(breakfast);
            usedIds.push(breakfast.id);
        }

        // 2. ОБЕД - ДВА РАЗНЫХ БЛЮДА
        let lunch1 = getRandomRecipe(lunches, usedIds);
        if (lunch1) {
            menu.push(lunch1);
            usedIds.push(lunch1.id);
        }

        let lunch2 = getRandomRecipe(lunches, usedIds);
        if (lunch2) {
            menu.push(lunch2);
            usedIds.push(lunch2.id);
        }

        // 3. УЖИН
        let dinner = getRandomRecipe(dinners, usedIds);
        if (dinner) {
            menu.push(dinner);
            usedIds.push(dinner.id);
        }

        // 4. ДОПОЛНИТЕЛЬНЫЕ ПРИЕМЫ (для 4 и 5)
        if (mealCount > 3) {
            const extraNeeded = mealCount - 3;
            console.log('Нужно добавить дополнительных приемов:', extraNeeded);

            for (let i = 0; i < extraNeeded; i++) {
                let extra = getRandomRecipe(extras, usedIds);
                if (extra) {
                    menu.push(extra);
                    usedIds.push(extra.id);
                }
            }
        }

        console.log('ИТОГОВОЕ МЕНЮ содержит', menu.length, 'блюд');
        return menu;
    }

    // Функция для отображения меню
    function displayMenu(menu) {
        dishesBlock.innerHTML = '';

        if (!menu || menu.length === 0) {
            dishesBlock.innerHTML = '<p class="no-dishes">Нет доступных блюд</p>';
            return;
        }

        // Просто отображаем все блюда подряд
        menu.forEach(recipe => {
            dishesBlock.appendChild(createRecipeCard(recipe));
        });

        updateStatistics(menu);
    }

    // Создание карточки рецепта
    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'card_dish';
        card.dataset.recipeId = recipe.id;

        const isLiked = typeof isFavorite === 'function' ? isFavorite(recipe.id) : false;
        const likeIcon = isLiked ? '../h-f-img/like.svg' : '../h-f-img/non-act-like.svg';

        // Используем путь к фото как есть из recipe
        const imagePath = recipe.image || '../food-img/1.jpg';

        card.innerHTML = `
            <img class="dish-card_img" src="${imagePath}" alt="${recipe.name}" onerror="this.src='../food-img/1.jpg'">
            <p class="dish-card_desc">${recipe.name}</p>
            <div class="dish-stats">
                <span class="calories">${recipe.calories} ккал</span>
                <span class="price">${recipe.price || 350} ₽</span>
            </div>
            <div class="dish-nutrients">
                <span class="protein">Б: ${recipe.protein}</span>
                <span class="fat">Ж: ${recipe.fat}</span>
                <span class="carbs">У: ${recipe.carbs}</span>
            </div>
            <div class="bottom-card_desc">
                <p class="dish_kind jost-light">${recipe.mealType}</p>
                <button class="change-btn jost-semibold like-btn" data-id="${recipe.id}">
                    <img src="${likeIcon}" alt="Избранное" width="24" height="24">
                </button>
            </div>
        `;

        return card;
    }

    // Обновление статистики
    function updateStatistics(menu) {
        let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0, totalPrice = 0;

        menu.forEach(recipe => {
            totalCalories += recipe.calories || 0;
            totalProtein += recipe.protein || 0;
            totalFat += recipe.fat || 0;
            totalCarbs += recipe.carbs || 0;
            totalPrice += recipe.price || 350;
        });

        const statsBox = document.querySelector('.stats-box');
        if (statsBox) {
            const statsValues = statsBox.querySelectorAll('.stats-value');
            if (statsValues.length >= 5) {
                statsValues[0].textContent = menu.length; // Количество БЛЮД
                statsValues[1].textContent = totalCalories;
                statsValues[2].textContent = totalProtein;
                statsValues[3].textContent = totalFat;
                statsValues[4].textContent = totalCarbs;
            }
        }

        const sumElement = document.querySelector('.sum_text span');
        if (sumElement) {
            sumElement.textContent = totalPrice.toLocaleString() + ' руб.';
        }
    }

    // Функция для добавления в корзину
    function addToCartHandler() {
        const currentMenu = [];
        const cards = document.querySelectorAll('.card_dish');

        cards.forEach(card => {
            const recipeId = parseInt(card.dataset.recipeId);
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe) {
                currentMenu.push(recipe);
            }
        });

        if (currentMenu.length > 0) {
            if (currentDay === 'today') {
                cartToday = currentMenu;
                saveCartToday();
            } else {
                cartTomorrow = currentMenu;
                saveCartTomorrow();
            }
            alert('Меню добавлено в корзину!');
        } else {
            alert('Нет блюд для добавления');
        }
    }

    // Создание выпадающих списков
    function createDropdowns() {
        const oldDayDropdown = dayFilter.querySelector('.dropdown-menu');
        const oldMealsDropdown = portionsFilter.querySelector('.dropdown-menu');
        if (oldDayDropdown) oldDayDropdown.remove();
        if (oldMealsDropdown) oldMealsDropdown.remove();

        const dayDropdown = document.createElement('div');
        dayDropdown.className = 'dropdown-menu';
        dayDropdown.innerHTML = `
            <div class="dropdown-item" data-day="today">Сегодня, ${todayStr}</div>
            <div class="dropdown-item" data-day="tomorrow">Завтра, ${tomorrowStr}</div>
        `;
        dayFilter.appendChild(dayDropdown);

        const mealsDropdown = document.createElement('div');
        mealsDropdown.className = 'dropdown-menu';
        mealsDropdown.innerHTML = `
            <div class="dropdown-item" data-meals="3">3 приёма (завтрак, обед, ужин)</div>
            <div class="dropdown-item" data-meals="4">4 приёма (+ перекус/полдник)</div>
            <div class="dropdown-item" data-meals="5">5 приёмов (+ перекус и полдник)</div>
        `;
        portionsFilter.appendChild(mealsDropdown);

        dayFilter.addEventListener('click', function (e) {
            e.stopPropagation();
            dayFilter.classList.toggle('active');
            portionsFilter.classList.remove('active');
        });

        portionsFilter.addEventListener('click', function (e) {
            e.stopPropagation();
            portionsFilter.classList.toggle('active');
            dayFilter.classList.remove('active');
        });

        dayDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                currentDay = this.dataset.day;
                dayText.textContent = currentDay === 'today' ? `Сегодня, ${todayStr}` : `Завтра, ${tomorrowStr}`;

                dayDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                dayFilter.classList.remove('active');

                const menu = generateMenu(currentMeals);
                displayMenu(menu);
            });
        });

        mealsDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                const meals = parseInt(this.dataset.meals);

                if (meals !== currentMeals) {
                    currentMeals = meals;

                    let mealsText = '';
                    if (meals === 3) mealsText = '3 приёма пищи';
                    else if (meals === 4) mealsText = '4 приёма пищи';
                    else mealsText = '5 приёмов пищи';

                    portionsText.textContent = mealsText;

                    const menu = generateMenu(currentMeals);
                    displayMenu(menu);
                }

                mealsDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
                portionsFilter.classList.remove('active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.day-filter') && !e.target.closest('.portions-filter')) {
                dayFilter.classList.remove('active');
                portionsFilter.classList.remove('active');
            }
        });
    }

    // Обработчик лайков
    document.addEventListener('click', function (e) {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn && typeof toggleFavorite === 'function') {
            e.preventDefault();
            const recipeId = parseInt(likeBtn.dataset.id);
            toggleFavorite(recipeId);
        }
    });

    window.addEventListener('favoritesUpdated', function () {
        document.querySelectorAll('.like-btn').forEach(btn => {
            const recipeId = parseInt(btn.dataset.id);
            const isLiked = isFavorite(recipeId);
            const img = btn.querySelector('img');
            img.src = isLiked ? '../h-f-img/like.svg' : '../h-f-img/non-act-like.svg';
        });
    });

    // Обработчик кнопки добавления в корзину
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCartHandler);
    }

    // Инициализация
    createDropdowns();
    const initialMenu = generateMenu(3);
    displayMenu(initialMenu);

    setTimeout(() => {
        const firstDayItem = document.querySelector('[data-day="today"]');
        const firstMealsItem = document.querySelector('[data-meals="3"]');
        if (firstDayItem) firstDayItem.classList.add('selected');
        if (firstMealsItem) firstMealsItem.classList.add('selected');
    }, 100);
});