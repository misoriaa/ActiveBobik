document.addEventListener('DOMContentLoaded', function () {
    // Получаем обе корзины
    const carts = getAllCarts();
    const dishesBlocks = document.querySelectorAll('.dishes_block');
    const statsBoxes = document.querySelectorAll('.stats-box');
    const sumElements = document.querySelectorAll('.sum_text span');
    const orderButtons = document.querySelectorAll('.order_btn');

    // Создаем кнопки очистки для обеих корзин
    function createClearCartButtons() {
        const btnaContainers = document.querySelectorAll('.btna');

        btnaContainers.forEach((container, index) => {
            // Проверяем, есть ли уже кнопка в этом контейнере
            let clearBtn = container.querySelector('.clear-cart-btn');

            // Если кнопки нет, создаем новую
            if (!clearBtn) {
                clearBtn = document.createElement('button');
                clearBtn.className = 'clear-cart-btn jost-semibold';
                clearBtn.innerHTML = '🗑️ Очистить всё';
                clearBtn.dataset.cartIndex = index; // 0 - сегодня, 1 - завтра

                // Вставляем перед кнопкой заказа
                container.insertBefore(clearBtn, container.firstChild);

                // Добавляем обработчик клика
                clearBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const cartIndex = parseInt(this.dataset.cartIndex);
                    const day = cartIndex === 0 ? 'today' : 'tomorrow';
                    const cartItems = day === 'today' ? carts.today : carts.tomorrow;

                    if (cartItems.length === 0) {
                        alert('Корзина уже пуста');
                        return;
                    }

                    if (confirm(`Вы уверены, что хотите очистить корзину на ${day === 'today' ? 'сегодня' : 'завтра'}?`)) {
                        clearCart(day);
                        if (day === 'today') {
                            carts.today = [];
                        } else {
                            carts.tomorrow = [];
                        }
                        updateAllCarts();
                        alert(`✅ Корзина на ${day === 'today' ? 'сегодня' : 'завтра'} очищена`);
                    }
                });
            }

            // Обновляем видимость кнопки
            updateClearButtonVisibility(container, index === 0 ? carts.today : carts.tomorrow);
        });
    }

    // Функция для обновления видимости кнопки очистки
    function updateClearButtonVisibility(container, cartItems) {
        const clearBtn = container.querySelector('.clear-cart-btn');
        if (clearBtn) {
            if (cartItems.length === 0) {
                clearBtn.style.display = 'none';
            } else {
                clearBtn.style.display = 'inline-block';
            }
        }
    }

    // Функция для создания карточки блюда
    function createCartItem(recipe, index, day) {
        const card = document.createElement('div');
        card.className = 'card_dish';
        card.dataset.recipeId = recipe.id;
        card.dataset.itemIndex = index;
        card.dataset.day = day;

        const isLiked = typeof isFavorite === 'function' ? isFavorite(recipe.id) : false;
        const likeIcon = isLiked ? '../h-f-img/like.svg' : '../h-f-img/non-act-like.svg';

        card.innerHTML = `
            <img class="dish-card_img" src="${recipe.image}" alt="${recipe.name}">
            <p class="dish-card_desc">${recipe.name}</p>
            <div class="dish-stats">
                <span class="calories">${recipe.calories} ккал</span>
                <span class="price">${recipe.price} ₽</span>
            </div>
            <div class="dish-nutrients">
                <span class="protein">Б: ${recipe.protein}</span>
                <span class="fat">Ж: ${recipe.fat}</span>
                <span class="carbs">У: ${recipe.carbs}</span>
            </div>
            <div class="bottom-card_desc">
                <p class="dish_kind jost-light">${recipe.mealType}</p>
                <div style="display: flex; gap: 10px;">
                    <button class="like-btn" data-id="${recipe.id}" style="background: none; border: none; cursor: pointer;">
                        <img src="${likeIcon}" alt="Избранное" width="20" height="20">
                    </button>
                    <button class="delete-btn jost-semibold" data-index="${index}" data-day="${day}" title="Удалить из корзины">
                        <img src="../h-f-img/del.svg" alt="Удалить" width="20" height="20">
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Функция для обновления всех корзин
    function updateAllCarts() {
        // Обновляем первую корзину (сегодня)
        updateCartBlock(0, 'today', carts.today);

        // Обновляем вторую корзину (завтра)
        updateCartBlock(1, 'tomorrow', carts.tomorrow);

        // Обновляем статистику
        updateAllStatistics();

        // Обновляем видимость кнопок очистки
        const btnaContainers = document.querySelectorAll('.btna');
        btnaContainers.forEach((container, index) => {
            const cartItems = index === 0 ? carts.today : carts.tomorrow;
            updateClearButtonVisibility(container, cartItems);
        });
    }

    // Функция для обновления конкретного блока корзины
    function updateCartBlock(blockIndex, day, cartItems) {
        const block = dishesBlocks[blockIndex];
        if (!block) return;

        block.innerHTML = '';

        if (cartItems.length === 0) {
            // Показываем сообщение о пустой корзине
            const dayText = day === 'today' ? 'сегодня' : 'завтра';
            block.innerHTML = `
                <div class="empty-cart-message">
                    <p>📅 Меню на ${dayText}</p>
                    <p class="jost-light">Корзина пуста</p>
                    <a href="../menu/menu.html" class="menu-btn jost-medium">Выбрать меню</a>
                </div>
            `;
        } else {
            cartItems.forEach((item, idx) => {
                block.appendChild(createCartItem(item, idx, day));
            });
        }
    }

    // Функция для обновления статистики всех блоков
    function updateAllStatistics() {
        // Статистика для сегодня
        updateStatisticsBlock(0, carts.today);

        // Статистика для завтра
        updateStatisticsBlock(1, carts.tomorrow);
    }

    // Функция для обновления статистики конкретного блока
    function updateStatisticsBlock(blockIndex, cartItems) {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        let totalPrice = 0;

        cartItems.forEach(item => {
            totalCalories += item.calories;
            totalProtein += item.protein;
            totalFat += item.fat;
            totalCarbs += item.carbs;
            totalPrice += item.price;
        });

        if (statsBoxes[blockIndex]) {
            const statsValues = statsBoxes[blockIndex].querySelectorAll('.stats-value');
            if (statsValues.length >= 5) {
                statsValues[0].textContent = cartItems.length;
                statsValues[1].textContent = totalCalories;
                statsValues[2].textContent = totalProtein;
                statsValues[3].textContent = totalFat;
                statsValues[4].textContent = totalCarbs;
            }
        }

        if (sumElements[blockIndex]) {
            sumElements[blockIndex].textContent = totalPrice.toLocaleString() + ' руб.';
        }
    }

    // Функция для удаления элемента из корзины
    function handleRemoveFromCart(index, day) {
        removeFromCart(index, day);

        // Обновляем локальные массивы
        if (day === 'today') {
            carts.today = getCart('today');
        } else {
            carts.tomorrow = getCart('tomorrow');
        }

        updateAllCarts();

        // ТОЛЬКО уведомление об удалении из корзины
        alert('✅ Блюдо удалено из корзины');
    }

    // Слушаем события обновления избранного
    window.addEventListener('favoritesUpdated', function (e) {
        // Обновляем все кнопки лайков на странице корзины
        document.querySelectorAll('.like-btn').forEach(btn => {
            const recipeId = parseInt(btn.dataset.id);
            const isLiked = isFavorite(recipeId);
            const img = btn.querySelector('img');
            img.src = isLiked ? '../h-f-img/like.svg' : '../h-f-img/non-act-like.svg';
        });
    });

    // Обработчик кликов по кнопкам
    document.addEventListener('click', function (e) {
        // Обработка удаления
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.preventDefault();
            const index = parseInt(deleteBtn.dataset.index);
            const day = deleteBtn.dataset.day;
            handleRemoveFromCart(index, day);
        }

        // Обработка лайков в корзине
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn && typeof toggleFavorite === 'function') {
            e.preventDefault();
            const recipeId = parseInt(likeBtn.dataset.id);
            toggleFavorite(recipeId);
        }
    });

    // Обработчики для кнопок "Заказать"
    orderButtons.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            const day = index === 0 ? 'today' : 'tomorrow';
            const cartItems = day === 'today' ? carts.today : carts.tomorrow;

            if (cartItems.length === 0) {
                alert(`Корзина на ${day === 'today' ? 'сегодня' : 'завтра'} пуста`);
                return;
            }

            // Сохраняем данные заказа в localStorage
            saveOrderData(day, cartItems);

            // Перенаправляем на страницу оформления заказа
            window.location.href = '../order/order.html';
        });
    });

    // Функция для сохранения данных заказа
    function saveOrderData(day, cartItems) {
        // Рассчитываем итоговую сумму
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
        
        // Сохраняем данные только для одного дня
        const orderData = {
            day: day, // Запоминаем, какой день заказан
            [day]: {
                items: cartItems,
                totalPrice: totalPrice,
                itemsCount: cartItems.length
            }
        };
        
        // Сохраняем в localStorage
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
        
        console.log(`Сохранен заказ на ${day === 'today' ? 'сегодня' : 'завтра'} на сумму ${totalPrice} руб.`);
    }

    // Добавляем стили для кнопок очистки
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .dish-stats {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #666;
            margin: 5px 0;
        }
        
        .dish-nutrients {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #999;
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        
        .calories {
            color: #5da130;
            font-weight: 600;
        }
        
        .price {
            color: #3D571F;
            font-weight: 600;
        }
        
        .delete-btn, .like-btn {
            border: none;
            background-color: transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 5px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .like-btn:hover {
            background-color: #DCFB73;
            transform: scale(1.1);
        }
        
        .delete-btn:hover {
            background-color: #ff4444;
            transform: scale(1.1);
        }
        
        .delete-btn:hover img {
            filter: brightness(0) invert(1);
        }
        
        .bottom-card_desc {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
        }
        
        .clear-cart-btn {
            background: #ff4444;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 20px;
            cursor: pointer;
            box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
            transition: all 0.3s;
            margin-right: 20px;
            display: none; /* По умолчанию скрыта */
        }
        
        .clear-cart-btn:hover {
            background: #cc0000;
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 12px 22px rgba(0, 0, 0, 0.25);
        }
        
        .empty-cart-message {
            text-align: center;
            padding: 60px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
            width: 100%;
        }
        
        .empty-cart-message p {
            font-size: 24px;
            color: #666;
            margin-bottom: 15px;
        }
        
        .empty-cart-message p.jost-light {
            font-size: 18px;
            color: #999;
        }
        
        .empty-cart-message .menu-btn {
            display: inline-block;
            padding: 15px 30px;
            background: #5da130;
            color: white;
            border-radius: 20px;
            text-decoration: none;
            transition: all 0.3s;
        }
        
        .empty-cart-message .menu-btn:hover {
            background: #4a8a27;
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 12px 22px rgba(0, 0, 0, 0.25);
        }
        
        .btna {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 20px;
        }
    `;
    document.head.appendChild(style);

    // Создаем кнопки очистки для обеих корзин
    createClearCartButtons();

    // Инициализация
    updateAllCarts();
});