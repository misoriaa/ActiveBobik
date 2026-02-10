// BASKET

let selectedReception = null;

function Delete(btn) {
    const card = btn.closest('.basket-block_product-card')
    const productId = card.dataset.productId

    const cart = getCart()
    const updatedCart = cart.filter(item => item.id !== parseInt(productId))
    saveCart(updatedCart)

    const checkedState = getBasketChecked()
    delete checkedState[productId]
    saveBasketChecked(checkedState)

    card.remove()
    recalcBasket()
}

function getBasketChecked() {
    const saved = localStorage.getItem('basket_checked')
    if (!saved) {
        return {}
    }

    try {
        return JSON.parse(saved) || {}
    } catch (e) {
        console.error('Ошибка при парсинге basket_checked:', e)
        return {}
    }
}

function saveBasketChecked(state) {
    localStorage.setItem('basket_checked', JSON.stringify(state))
}

function saveReception(type) {
    localStorage.setItem('selected_reception', type)
}

function getReception() {
    return localStorage.getItem('selected_reception')
}

function initBasketCheckboxes() {
    const checkboxes = document.querySelectorAll('.basket-good-checkbox')
    const checkedState = getBasketChecked()
    let hasNewItems = false

    checkboxes.forEach(cb => {
        const id = cb.dataset.id

        if (checkedState[id] === undefined) {
            checkedState[id] = false
            cb.checked = false
            hasNewItems = true
        } else {
            cb.checked = checkedState[id]
        }

        cb.addEventListener('change', () => {
            checkedState[id] = cb.checked
            saveBasketChecked(checkedState)
            recalcBasket()
        })
    })

    if (hasNewItems) {
        saveBasketChecked(checkedState)
    }

    recalcBasket()
}

function updateCartCount(productId, value) {
    const cart = getCart()
    const item = cart.find(p => p.id === Number(productId))
    if (!item) return

    item.count = value
    saveCart(cart)
}

function updateCardPrice(card) {
    const priceEl = card.querySelector('.price');
    const basePrice = Number(priceEl.dataset.price);
    const count = Number(card.querySelector('.qty').textContent);

    priceEl.textContent = `${basePrice * count} ₽`;
}

document.addEventListener('DOMContentLoaded', function () {
    renderBasket();

    const savedReception = getReception();
    if (savedReception) {
        selectedReception = savedReception;

        if (savedReception === 'pickup') {
            document.getElementById('reception-title').textContent = 'Самовывоз';
            document.getElementById('reception-desc').textContent = 'Забрать в магазине';
        }

        if (savedReception === 'delivery') {
            document.getElementById('reception-title').textContent = 'Доставка';
            document.getElementById('reception-desc').textContent = 'Доставка по указанному адресу';
        }
    }
});

function renderBasket() {
    const cart = getCart()
    const container = document.querySelector('.product-cards-holder')

    if (!container) return;

    container.innerHTML = ''

    if (cart.length === 0) {
        resetBasketCounters();
        return;
    }

    cart.forEach(item => {
        const inFavorites = isInFavorites(item.id)
        const checkedState = getBasketChecked()

        const isChecked = checkedState[item.id] === true;

        container.innerHTML += `
            <div class="basket-block_product-card" data-product-id="${item.id}">
                <div class="basket-good_image">
                    <input type="checkbox" class="basket-good-checkbox" data-price="${item.price}" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
                    <img src="${item.image}">
                </div>

                <div class="product-card_product-info">
                    <div class="title-row">
                        <h3>${item.description}</h3>
                        <span class="price" data-price="${item.price}">${item.price * item.count} ₽</span>
                        <button class="favorite-btn ${inFavorites ? 'active' : ''}" onclick="toggleFavoriteById(${item.id}, this)">
                            <img src="${inFavorites ? '../img/like-heart_on-goods-active.svg' : '../img/like-heart_on-goods.svg'}">
                        </button>
                    </div>

                    <p class="description">${item.title}</p>

                    <div class="bottom-row">
                        <div class="rating">
                            <img src="../img/goods_rating-star.svg"><span>${item.rating}</span>
                        </div>

                        <div class="controls">
                            <div class="controls-maj">
                                <button class="qty-btn" onclick="MinusProduct(this)">−</button>
                                <span class="qty">${item.count}</span>
                                <button class="qty-btn" onclick="PlusProduct(this)">+</button>
                            </div>
                            <button class="delete-btn" onclick="Delete(this)"><img src="../img/trash-can_basket-goods.svg"></button>
                        </div>
                    </div>
                </div>
            </div>
        `
    })

    initBasketCheckboxes()
}

function resetBasketCounters() {
    document.getElementById('selected-count').textContent = '0';
    document.getElementById('price-changing').textContent = '0';
    document.getElementById('total-sum').textContent = '0';
    updateOrderButton();
}

function MinusProduct(btn) {
    const card = btn.closest('.basket-block_product-card')
    const countEl = card.querySelector('.qty')
    const productId = card.dataset.productId

    let value = Number(countEl.textContent)

    if (value > 1) {
        value--
        countEl.textContent = value

        updateCartCount(productId, value)
        updateCardPrice(card)
        recalcBasket()
    }
}

function PlusProduct(btn) {
    const card = btn.closest('.basket-block_product-card')
    const countEl = card.querySelector('.qty')
    const productId = card.dataset.productId

    let value = Number(countEl.textContent) + 1
    countEl.textContent = value

    updateCartCount(productId, value)
    updateCardPrice(card)
    recalcBasket()
}

function recalcBasket() {
    const cards = document.querySelectorAll('.basket-block_product-card')

    if (!cards || cards.length === 0) {
        resetBasketCounters();
        return;
    }

    let totalCount = 0
    let totalSum = 0

    cards.forEach(card => {
        const checkbox = card.querySelector('.basket-good-checkbox')
        const count = Number(card.querySelector('.qty').textContent)
        const basePrice = Number(card.querySelector('.price').dataset.price)

        if (checkbox && checkbox.checked) {
            totalCount += count
            totalSum += count * basePrice
        }
    })

    document.getElementById('selected-count').textContent = totalCount
    document.getElementById('price-changing').textContent = totalSum
    document.getElementById('total-sum').textContent = totalSum

    updateOrderButton()
}

function toggleReception() {
    const list = document.getElementById('reception-list');
    list.style.display = list.style.display === 'block' ? 'none' : 'block';
}

function selectReception(type) {
    const title = document.getElementById('reception-title');
    const desc = document.getElementById('reception-desc');
    const list = document.getElementById('reception-list');

    if (type === 'pickup') {
        title.textContent = 'Самовывоз';
        desc.textContent = 'Забрать в магазине';
    }

    if (type === 'delivery') {
        title.textContent = 'Доставка';
        desc.textContent = 'Доставка по указанному адресу';
    }

    selectedReception = type;
    saveReception(type);

    list.style.display = 'none';
    updateOrderButton();
}

function updateOrderButton() {
    const priceChangingEl = document.getElementById('price-changing');
    const totalSumEl = document.getElementById('total-sum');
    const selectedCountEl = document.getElementById('selected-count');
    const orderBtn = document.getElementById('order-btn');

    if (!priceChangingEl || !totalSumEl || !selectedCountEl || !orderBtn) {
        return;
    }

    const priceChanging = Number(priceChangingEl.textContent);
    const totalSum = Number(totalSumEl.textContent);
    const selectedCount = Number(selectedCountEl.textContent);

    if (priceChanging > 0 && totalSum > 0 && selectedCount > 0 && selectedReception !== null) {
        orderBtn.disabled = false;
    } else {
        orderBtn.disabled = true;
    }
}

function Order() {
    const priceChanging = Number(document.getElementById('price-changing').textContent);
    const totalSum = Number(document.getElementById('total-sum').textContent);
    const selectedCount = Number(document.getElementById('selected-count').textContent);

    if (priceChanging <= 0 || totalSum <= 0 || selectedCount <= 0 || !selectedReception) {
        alert('Выберите товары для заказа!');
        return;
    }

    const cart = getCart();
    const checkedState = getBasketChecked();
    const selectedItems = cart.filter(item => checkedState[item.id] === true);

    if (selectedItems.length === 0) {
        alert('Выберите товары для заказа!');
        return;
    }

    localStorage.setItem('selected_order_items', JSON.stringify(selectedItems));
    localStorage.setItem('order_total_price', totalSum.toString());
    localStorage.setItem('order_total_count', selectedCount.toString());

    if (selectedReception === 'pickup') {
        window.location.href = '../pickup/pickup.html';
    }

    if (selectedReception === 'delivery') {
        window.location.href = '../delivery/delivery.html';
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || []
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
}

function forceRecalcBasket() {
    const cart = getCart();
    const checkedState = getBasketChecked();

    if (cart.length === 0) {
        resetBasketCounters();
        return;
    }

    let totalCount = 0;
    let totalSum = 0;

    cart.forEach(item => {
        const isChecked = checkedState[item.id] === true;
        if (isChecked) {
            totalCount += item.count;
            totalSum += item.price * item.count;
        }
    });

    document.getElementById('selected-count').textContent = totalCount;
    document.getElementById('price-changing').textContent = totalSum;
    document.getElementById('total-sum').textContent = totalSum;

    updateOrderButton();
}

document.addEventListener('DOMContentLoaded', function () {
    renderBasket();

    setTimeout(forceRecalcBasket, 100);

    const savedReception = getReception();
    if (savedReception) {
        selectedReception = savedReception;

        if (savedReception === 'pickup') {
            document.getElementById('reception-title').textContent = 'Самовывоз';
            document.getElementById('reception-desc').textContent = 'Забрать в магазине';
        }

        if (savedReception === 'delivery') {
            document.getElementById('reception-title').textContent = 'Доставка';
            document.getElementById('reception-desc').textContent = 'Доставка по указанному адресу';
        }
    }
});






//LIKE

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || []
}

function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites))
}

function isInFavorites(productId) {
    return getFavorites().some(item => item.id === productId)
}

function toggleFavoriteById(productId, btn) {
    const favorites = getFavorites()

    const product = ALL_PRODUCTS.find(p => p.id === productId)
    if (!product) return

    const index = favorites.findIndex(item => item.id === productId)
    const img = btn.querySelector('img')

    if (index !== -1) {
        // Удаляем из избранного
        favorites.splice(index, 1)
        btn.classList.remove('active')
        img.src = '../img/like-heart_on-goods.svg'
        const checkedState = getLikeChecked()
        delete checkedState[productId]
        saveLikeChecked(checkedState)

    } else {
        // Добавляем в избранное
        favorites.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            description: product.description,
            rating: product.rating
        })
        btn.classList.add('active')
        img.src = '../img/like-heart_on-goods-active.svg'
    }

    saveFavorites(favorites)

    if (window.location.pathname.includes('like.html')) {
        renderFavoritesPage()
    }
}

function renderFavoritesPage() {
    const favorites = getFavorites()
    const container = document.querySelector('.like-grid_left-side')

    if (!container) return

    container.innerHTML = ''

    if (favorites.length === 0) {
        updateSelectedCount()
        updateSum()
        return
    }

    favorites.forEach(item => {
        const inCart = isInCart(item.id)
        const checkedState = getLikeChecked()
        const isChecked = checkedState[item.id] !== false

        container.innerHTML += `
            <div class="like-block_product-card" data-product-id="${item.id}">
                <div class="like-good_image">
                    <input type="checkbox" class="like-good-checkbox" data-price="${item.price}" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
                    <img src="${item.image}">
                </div>

                <div class="product-card_product-info">
                    <div class="title-row">
                        <h3>${item.description}</h3>
                        <span class="price">${item.price} ₽</span>
                        <button class="favorite-btn active" onclick="toggleFavoriteById(${item.id}, this)">
                            <img src="../img/like-heart_on-goods-active.svg">
                        </button>
                    </div>

                    <p class="description">${item.title}</p>

                    <div class="bottom-row">
                        <div class="rating">
                            <img src="../img/goods_rating-star.svg"><span>${item.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    })

    initCheckboxes()
    initCheckboxCounter()
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('like.html')) {
        renderFavoritesPage()
    }
})

function AddToCartFromFavorites() {
    const checkboxes = document.querySelectorAll('.like-good-checkbox:checked')
    const cart = getCart()

    checkboxes.forEach(checkbox => {
        const card = checkbox.closest('.like-block_product-card')
        const productId = parseInt(card.dataset.productId)

        if (isInCart(productId)) {
            alert('Товар уже есть в корзине')
            checkbox.checked = false
            return
        }

        const product = ALL_PRODUCTS.find(p => p.id === productId)

        if (product) {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                description: product.description,
                rating: product.rating,
                count: 1
            })
        }
    })

    saveCart(cart)

    checkboxes.forEach(cb => cb.checked = false)
    updateSelectedCount()
    updateSum()
}

function AddToCart() {
    AddToCartFromFavorites()
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.like-good-checkbox');
    const countElement = document.getElementById('selected-count');

    let checkedCount = 0;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedCount++;
        }
    });

    countElement.textContent = checkedCount;
    updateAddToCartButton();
}


function initCheckboxCounter() {
    const checkboxes = document.querySelectorAll('.like-good-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });

    updateSelectedCount();
}

function getLikeChecked() {
    return JSON.parse(localStorage.getItem('like_checked')) || {}
}

function saveLikeChecked(state) {
    localStorage.setItem('like_checked', JSON.stringify(state))
}

document.addEventListener('DOMContentLoaded', initCheckboxCounter);

function updateSum() {
    const checkboxes = document.querySelectorAll('.like-good-checkbox');
    const totalPriceElement = document.getElementById('price-changing');
    const totalSumElement = document.getElementById('total-sum');

    let totalSum = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const price = parseInt(checkbox.dataset.price) || 0;
            totalSum += price;
        }
    });

    totalPriceElement.textContent = totalSum;
    totalSumElement.textContent = totalSum;

    updateAddToCartButton();
}

function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.like-good-checkbox')
    const checkedState = getLikeChecked()

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const id = checkbox.dataset.id
            checkedState[id] = checkbox.checked
            saveLikeChecked(checkedState)
            updateSum()
        })
    })

    updateSum()
}

document.addEventListener('DOMContentLoaded', initCheckboxes);

function updateAddToCartButton() {
    const selectedCount = Number(document.getElementById('selected-count').textContent);
    const priceChanging = Number(document.getElementById('price-changing').textContent);
    const totalSum = Number(document.getElementById('total-sum').textContent);
    const btn = document.getElementById('add-to-cart-btn');

    if (selectedCount !== 0 && priceChanging !== 0 && totalSum !== 0) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', updateAddToCartButton);





//CATALOG

const Products = [
    {
        id: 7,
        title: 'Petmax Свитер для кошек',
        price: 799,
        stock: 50,
        rating: 5.0,
        image: '../img/id7.svg',
        description: 'Теплый свитер для кошек с оригинальным дизайном',
        type: 'clothes',
        specs: {
            material: 'Полиэстер, флис, эластан',
            size: 'S (30-40 см), M (40-50 см), L (50-60 см), XL (60-70 см)',
            color: 'Красный, зеленый, серый, бежевый',
            season: 'Oсень-зима'
        }
    },
    {
        id: 2,
        title: 'Попона теплая со шлейкой для собак',
        price: 2999,
        stock: 50,
        rating: 5.0,
        image: '../img/id2.svg',
        description: 'Теплая попона со встроенной шлейкой для зимних прогулок',
        type: 'clothes',
        specs: {
            material: 'Полиэстер, флис, эластан',
            size: 'S (30-40 см), M (40-50 см), L (50-60 см), XL (60-70 см)',
            color: 'Красный, зеленый, серый, бежевый',
            season: 'Осень-зима'
        }
    },
    {
        id: 16,
        title: 'Little One Корм для кроликов',
        price: 250,
        stock: 50,
        rating: 5.0,
        image: '../img/id16.svg',
        description: 'Сбалансированный корм для кроликов с витаминами',
        type: 'food',
        specs: {
            weight: '250 г, 500 г, 1 кг',
            age: 'Кролики от 3 месяцев',
            taste: 'Травяная смесь',
            composition: 'Тимофеевка (30%), овес (20%), ячмень (15%), пшеница (10%), сушеные овощи (морковь, свекла - 15%), витаминный комплекс (10%)'
        }
    },
    {
        id: 8,
        title: 'RURRI Сумка-переноска для кошек',
        price: 1699,
        stock: 50,
        rating: 5.0,
        image: '../img/id8.svg',
        description: 'Сумка-переноска с жесткими стенками для безопасной транспортировки кошек',
        type: 'carrying_bag',
        specs: {
            material: 'Полиэстер, пластик, металл',
            size: '45×28×32 см (Д×Ш×В)',
            weight: '1.5 кг'
        }
    },
    {
        id: 10,
        title: 'Ownat Adult Sterilized Classic Сухой корм для стерилизованных кошек, с курицей',
        price: 2999,
        stock: 50,
        rating: 5.0,
        image: '../img/id10.svg',
        description: 'Специальный корм для стерилизованных кошек, поддерживает здоровье мочевыделительной системы',
        type: 'food',
        specs: {
            weight: '1.5 кг, 3 кг, 5 кг',
            age: 'Стерилизованные кошки от 1 года',
            taste: 'Курица',
            composition: 'Куриное мясо (35%), кукуруза (20%), рис (15%), овощи (10%), витамины для мочевыделительной системы (10%), масла (10%)'
        }
    },
    {
        id: 6,
        title: 'Игрушка для собак Мяч веревочный с петлями',
        price: 200,
        stock: 50,
        rating: 5.0,
        image: '../img/id6.svg',
        description: 'Интерактивная игрушка для тренировки и игр с собакой',
        type: 'toy',
        specs: {
            material: 'Натуральная резина, хлопковая веревка',
            size: 'Диаметр 8 см, длина веревки 50 см',
            type: 'Интерактивная игрушка для апортировки',
            petAge: 'Щенки от 3 месяцев, взрослые собаки'
        }
    },
];

const dogProducts = [
    {
        id: 1,
        title: 'Комбинезон на замке для собак',
        price: 1499,
        stock: 50,
        rating: 5.0,
        image: '../img/id1.svg',
        description: 'Утепленный комбинезон с молнией для прогулок в прохладную погоду',
        type: 'clothes',
        specs: {
            material: 'Нейлон, хлопок',
            size: 'Размеры: XS (25-30 см), S (30-35 см), M (35-40 см), L (40-45 см), XL (45-50 см)',
            color: 'Розовый',
            season: 'Всесезонный'
        }
    },
    {
        id: 2,
        title: 'Попона теплая со шлейкой для собак',
        price: 2999,
        stock: 50,
        rating: 5.0,
        image: '../img/id2.svg',
        description: 'Теплая попона со встроенной шлейкой для зимних прогулок',
        type: 'clothes',
        specs: {
            material: 'Полиэстер, эластан',
            size: 'S (30-40 см), M (40-50 см), L (50-60 см), XL (60-70 см)',
            color: 'Зеленый',
            season: 'Осень-зима'
        }
    },
    {
        id: 3,
        title: 'RURRI Сумка-переноска для собак мелких пород',
        price: 1299,
        stock: 50,
        rating: 5.0,
        image: '../img/id3.svg',
        description: 'Удобная сумка-переноска с вентиляцией для мелких собак',
        type: 'carrying_bag',
        specs: {
            material: 'Полиэстер 600D, пластик',
            size: '40×25×30 см (Д×Ш×В)',
            weight: '1.2 кг'
        }
    },
    {
        id: 4,
        title: 'RURRI Переноска для собак мелких пород',
        price: 1699,
        stock: 50,
        rating: 5.0,
        image: '../img/id4.svg',
        description: 'Пластиковая переноска с металлической дверцей для безопасной транспортировки',
        type: 'carrying_bag',
        specs: {
            material: 'Пластик, металлические элементы',
            size: '35×20×25 см (Д×Ш×В)',
            weight: '0.8 кг'
        }
    },
    {
        id: 5,
        title: 'Ownat Adult Grain Free Сухой корм беззерновой для взрослых собак',
        price: 3799,
        stock: 50,
        rating: 5.0,
        image: '../img/id5.svg',
        description: 'Премиальный беззерновой корм для взрослых собак с высоким содержанием мяса',
        type: 'food',
        specs: {
            weight: '2 кг, 5 кг, 10 кг',
            age: 'Взрослые собаки (1-7 лет)',
            taste: 'Говядина с овощами',
            composition: 'Мясо говядины (40%), рис (25%), овощи (морковь, горох - 20%), витаминно-минеральный комплекс (10%), масла (5%)'
        }
    },
    {
        id: 6,
        title: 'Игрушка для собак Мяч веревочный с петлями',
        price: 200,
        stock: 50,
        rating: 5.0,
        image: '../img/id6.svg',
        description: 'Интерактивная игрушка для тренировки и игр с собакой',
        type: 'toy',
        specs: {
            material: 'Натуральная резина, хлопковая веревка',
            size: 'Диаметр 8 см, длина веревки 50 см',
            type: 'Интерактивная игрушка для апортировки',
            petAge: 'Щенки от 3 месяцев, взрослые собаки'
        }
    }
];

const catProducts = [
    {
        id: 7,
        title: 'Petmax Свитер для кошек',
        price: 799,
        stock: 50,
        rating: 5.0,
        image: '../img/id7.svg',
        description: 'Теплый свитер для кошек с оригинальным дизайном',
        type: 'clothes',
        specs: {
            material: 'Акрил (80%), хлопок (20%)',
            size: 'S (25-30 см), M (30-35 см), L (35-40 см)',
            color: 'Красный',
            season: 'Осень-зима'
        }
    },
    {
        id: 8,
        title: 'RURRI Сумка-переноска для кошек',
        price: 1699,
        stock: 50,
        rating: 5.0,
        image: '../img/id8.svg',
        description: 'Сумка-переноска с жесткими стенками для безопасной транспортировки кошек',
        type: 'carrying_bag',
        specs: {
            material: 'Полиэстер, пластик, металл',
            size: '45×28×32 см (Д×Ш×В)',
            weight: '1.5 кг'
        }
    },
    {
        id: 9,
        title: 'Moderna Переноска с металлической дверью и замком для кошек',
        price: 1699,
        stock: 50,
        rating: 5.0,
        image: '../img/id9.svg',
        description: 'Прочная переноска с металлической дверью для максимальной безопасности',
        type: 'carrying_bag',
        specs: {
            material: 'Пластик, металлическая решетка',
            size: '40×25×30 см (Д×Ш×В)',
            weight: '2.1 кг'
        }
    },
    {
        id: 10,
        title: 'Ownat Adult Sterilized Classic Сухой корм для стерилизованных кошек, с курицей',
        price: 2999,
        stock: 50,
        rating: 5.0,
        image: '../img/id10.svg',
        description: 'Специальный корм для стерилизованных кошек, поддерживает здоровье мочевыделительной системы',
        type: 'food',
        specs: {
            weight: '1.5 кг, 3 кг, 5 кг',
            age: 'Стерилизованные кошки от 1 года',
            taste: 'Курица',
            composition: 'Куриное мясо (35%), кукуруза (20%), рис (15%), овощи (10%), витамины для мочевыделительной системы (10%), масла (10%)'
        }
    },
    {
        id: 11,
        title: 'HiPet Игрушка на радиоуправлении для кошек',
        price: 2000,
        stock: 50,
        rating: 5.0,
        image: '../img/id11.svg',
        description: 'Электронная игрушка в виде мыши с радиоуправлением для активных игр',
        type: 'toy',
        specs: {
            material: 'Пластик, флис, электронные компоненты',
            size: '15×8×8 см (мышь)',
            type: 'Электронная игрушка с радиоуправлением',
            petAge: 'Котята от 4 месяцев, взрослые кошки'
        }
    }
];

const birdProducts = [
    {
        id: 12,
        title: 'Padovan Grandmix Pappagalli Корм для крупных попугаев',
        price: 900,
        stock: 50,
        rating: 5.0,
        image: '../img/id12.svg',
        description: 'Сбалансированный корм с семенами, орехами и сухофруктами для крупных попугаев',
        type: 'food',
        specs: {
            weight: '500 г, 1 кг, 2 кг',
            age: 'Взрослые попугаи (ара, какаду, жако)',
            taste: 'Смесь семян и фруктов',
            composition: 'Семена подсолнечника (20%), кукуруза (15%), овес (15%), пшеница (10%), сухофрукты (банан, яблоко - 20%), орехи (15%)'
        }
    },
    {
        id: 13,
        title: 'ПРЕСТИЖ Забавные качели для средних попугаев',
        price: 415,
        stock: 50,
        rating: 5.0,
        image: '../img/id13.svg',
        description: 'Игровой комплекс с качелями для средних попугаев',
        type: 'toy',
        specs: {
            material: 'Дерево, металлические крепления',
            size: 'Длина 25 см, высота 15 см',
            petAge: 'Средние попугаи (корелла, неразлучники)'
        }
    }
];

const rodentProducts = [
    {
        id: 14,
        title: 'Воротничок для кроликов розовый',
        price: 299,
        stock: 50,
        rating: 5.0,
        image: '../img/id14.svg',
        description: 'Декоративный воротничок для кроликов после операций или для красоты',
        type: 'clothes',
        specs: {
            material: 'Полиэстер, хлопок',
            size: 'Диаметр 15 см, регулируемый',
            color: 'Розовый',
            season: 'Всесезонный'
        }
    },
    {
        id: 15,
        title: 'Шлейка-жилетка для морской свинки',
        price: 999,
        stock: 50,
        rating: 5.0,
        image: '../img/id15.svg',
        description: 'Удобная шлейка-жилетка для прогулок с морской свинкой',
        type: 'clothes',
        specs: {
            material: 'Нейлон, пластик',
            size: 'XS (15-20 см), S (20-25 см)',
            color: 'Зеленый',
            season: 'Всесезонный'
        }
    },
    {
        id: 16,
        title: 'Little One Корм для кроликов',
        price: 250,
        stock: 50,
        rating: 5.0,
        image: '../img/id16.svg',
        description: 'Сбалансированный корм для кроликов с витаминами',
        type: 'food',
        specs: {
            weight: '250 г, 500 г, 1 кг',
            age: 'Кролики от 3 месяцев',
            taste: 'Травяная смесь',
            composition: 'Тимофеевка (30%), овес (20%), ячмень (15%), пшеница (10%), сушеные овощи (морковь, свекла - 15%), витаминный комплекс (10%)'
        }
    },
    {
        id: 17,
        title: 'Дорадо Вуд Деревянное беговое колесо для грызунов',
        price: 1815,
        stock: 50,
        rating: 5.0,
        image: '../img/id17.svg',
        description: 'Бесшумное беговое колесо из натурального дерева для активных грызунов',
        type: 'toy',
        specs: {
            material: 'Натуральное дерево',
            size: 'Диаметр 25 см, ширина 8 см',
            type: 'Беговое колесо',
            petAge: 'Хомяки, мыши, песчанки, дегу'
        }
    }
];

const fishProducts = [
    {
        id: 18,
        title: 'Tetra Min корм для рыб в хлопьях',
        price: 1900,
        stock: 50,
        rating: 5.0,
        image: '../img/id20.svg',
        description: 'Основной корм в хлопьях для всех видов тропических рыб',
        type: 'food',
        specs: {
            weight: '100 мл, 250 мл, 500 мл',
            age: 'Все возраста',
            taste: 'Универсальный',
            composition: 'Рыбная мука (30%), креветки (20%), спирулина (15%), витамины A, D, E (10%), злаки (25%)'
        }
    },
    {
        id: 19,
        title: 'WATERA Аквариум (50х25х30,5 см) с покровным стеклом',
        price: 2999,
        stock: 50,
        rating: 5.0,
        image: '../img/id18.svg',
        description: 'Комплектный аквариум для начинающих аквариумистов',
        type: 'aquarium',
        specs: {
            volume: '38 литров',
            dimensions: '50×25×30.5 см (Д×Ш×В)',
            material: 'Стекло, пластик'
        }
    },
    {
        id: 20,
        title: 'Голд Фиш Аквариум (75,5х32,9х43 см) прямоугольный с крышкой',
        price: 7499,
        stock: 50,
        rating: 5.0,
        image: '../img/id19.svg',
        description: 'Профессиональный аквариум с полной комплектацией',
        type: 'aquarium',
        specs: {
            volume: '105 литров',
            dimensions: '75.5×32.9×43 см (Д×Ш×В)',
            material: 'Стекло, пластик, металл'
        }
    }
];

const ALL_PRODUCTS = [
    ...Products, //... - раскрытие всех элементов массива
    ...dogProducts,
    ...catProducts,
    ...birdProducts,
    ...rodentProducts,
    ...fishProducts
];


const itemsPerPage = 6
let currentPage = 1
let currentProducts = Products

const productsContainer = document.getElementById('products')
const pagesContainer = document.querySelector('.pages')

function isInCart(productId) {
    const cart = getCart()
    return cart.some(item => item.id === productId)
}

function addToCart(product, buttonElement) {
    const cart = getCart()
    const existing = cart.find(item => item.id === product.id)

    if (existing) {
        existing.count += 1
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            description: product.description,
            rating: product.rating,
            count: 1
        })
    }

    saveCart(cart)

    const checkedState = getBasketChecked()
    checkedState[product.id] = true
    saveBasketChecked(checkedState)

    if (buttonElement) {
        setButtonInCartState(buttonElement)
    }
}

function setButtonInCartState(btn) {
    btn.disabled = true
    btn.classList.add('in-cart')
    btn.innerHTML = 'В корзине'
}


const typeLabels = {
    clothes: 'Одежда',
    carrying_bag: 'Переноски',
    food: 'Еда',
    toy: 'Игрушки',
    aquarium: 'Аквариумы'
}
function toggleFilters(button, products) {
    const container = button.nextElementSibling

    document.querySelectorAll('.filters').forEach(f => {
        if (f !== container) f.classList.remove('active')
    })

    if (container.classList.contains('active')) {
        container.classList.remove('active')
        showCatalog(products)
        return
    }

    container.classList.add('active')
    container.innerHTML = ''

    const types = [...new Set(products.map(p => p.type))]

    container.innerHTML += `
        <button class="filter-btn active"
            onclick="applyFilter(this, ${JSON.stringify(products).replace(/"/g, '&quot;')})">
            Все
        </button>
    `

    types.forEach(type => {
        container.innerHTML += `
            <button class="filter-btn"
                onclick="applyFilter(this, ${JSON.stringify(products).replace(/"/g, '&quot;')}, '${type}')">
                ${typeLabels[type] || type}
            </button>
        `
    })

    showCatalog(products)
}


function applyFilter(btn, products, type = null) {
    const buttons = btn.parentElement.querySelectorAll('.filter-btn')
    buttons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')

    if (!type) {
        showCatalog(products)
    } else {
        showCatalog(products.filter(p => p.type === type))
    }
}

function renderProducts() {
    productsContainer.innerHTML = ''

    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage

    currentProducts.slice(start, end).forEach(product => {
        const inCart = isInCart(product.id)
        const inFavorites = isInFavorites(product.id)

        productsContainer.innerHTML += `
            <div class="catalog-card">
                <div class="image-area">
                    <img src="${product.image}" class="product">

                    <div class="rating-badge">
                        <img src="../img/goods_rating-star.svg">
                        <span>${product.rating}</span>
                    </div>

                    <button class="favorite-btn ${inFavorites ? 'active' : ''}" onclick="toggleFavoriteById(${product.id}, this)">
                        <img src="${inFavorites ? '../img/like-heart_on-goods-active.svg' : '../img/like-heart_on-goods.svg'}">
                    </button>

                    <div class="price-badge">${product.price} ₽</div>
                </div>

                <div class="card-content">
                    <p class="title">${product.title}</p>
                    <p class="stock">Осталось: ${product.stock}шт</p>

                    <button 
                        class="add-btn ${inCart ? 'in-cart' : ''}" 
                        ${inCart ? 'disabled' : ''}
                        onclick='addToCart(${JSON.stringify(product)}, this)'>
                        ${inCart ? 'В корзине' : '<img src="../img/catalog-add_basket.svg">В корзину'}
                    </button>
                </div>
            </div>
        `
    })
}

function renderPages() {
    pagesContainer.innerHTML = ''

    const totalPages = Math.ceil(currentProducts.length / itemsPerPage)

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button')
        btn.className = 'page-btn'
        btn.textContent = i

        if (i === currentPage) btn.classList.add('active')

        btn.onclick = () => {
            currentPage = i
            updateCatalog()
        }

        pagesContainer.appendChild(btn)
    }
}

function updateCatalog() {
    renderProducts()
    renderPages()
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
        const action = btn.dataset.action
        const totalPages = Math.ceil(currentProducts.length / itemsPerPage)

        if (action === 'first') currentPage = 1
        if (action === 'last') currentPage = totalPages
        if (action === 'prev' && currentPage > 1) currentPage--
        if (action === 'next' && currentPage < totalPages) currentPage++

        updateCatalog()
    }
})

function showCatalog(products) {
    currentProducts = products
    currentPage = 1
    updateCatalog()
}

updateCatalog()






// Модальная панель для карточек товаров в каталоге

const productSpecs = {
    'clothes': [
        { label: 'Материал', key: 'material' },
        { label: 'Размер', key: 'size' },
        { label: 'Цвет', key: 'color' },
        { label: 'Сезон', key: 'season' }
    ],
    'carrying_bag': [
        { label: 'Материал', key: 'material' },
        { label: 'Размер', key: 'size' },
        { label: 'Вес', key: 'weight' }
    ],
    'food': [
        { label: 'Вес упаковки', key: 'weight' },
        { label: 'Возраст', key: 'age' },
        { label: 'Вкус', key: 'taste' },
        { label: 'Состав', key: 'composition' }
    ],
    'toy': [
        { label: 'Материал', key: 'material' },
        { label: 'Размер', key: 'size' },
        { label: 'Тип', key: 'type' },
        { label: 'Возраст питомца', key: 'petAge' }
    ],
    'aquarium': [
        { label: 'Объем', key: 'volume' },
        { label: 'Размеры', key: 'dimensions' },
        { label: 'Материал', key: 'material' },
        { label: 'Комплектация', key: 'equipment' }
    ]
};



function openProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalBody = document.querySelector('.modal-body');


    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));

    let specsHTML = '';
    if (productSpecs[product.type]) {
        const specs = productSpecs[product.type];
        const details = product.specs || {};

        specsHTML = specs.map(spec => {
            const value = details[spec.key] || 'Не указано';
            return `
                <div class="spec-item">
                    <span class="spec-label">${spec.label}:</span>
                    <span class="spec-value">${value}</span>
                </div>
            `;
        }).join('');
    }

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="modal-title-section">
                <h2 class="modal-title">${product.title}</h2>
                <div class="modal-price">${product.price} ₽</div>
                <div class="modal-rating">
                    <span class="rating-stars">${stars}</span>
                    <span class="rating-value">${product.rating}</span>
                </div>
                <span class="modal-stock">В наличии: ${product.stock} шт.</span>
            </div>
        </div>
        
        <div class="modal-specs">
            <h3 class="specs-title">Характеристики</h3>
            <div class="specs-grid">
                ${specsHTML}
            </div>
        </div>
        
        <div class="modal-description">
            <h3>Описание</h3>
            <p>${product.description || 'Подробное описание товара. Качественный продукт для ваших питомцев.'}</p>
        </div>
    `;


    const addToCartBtn = document.querySelector('.modal-add-to-cart');
    const addToFavBtn = document.querySelector('.modal-add-to-favorites');

    if (addToCartBtn) addToCartBtn.dataset.productId = product.id;
    if (addToFavBtn) addToFavBtn.dataset.productId = product.id;


    modal.classList.add('active');
}


function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
}

function addToCartFromModal() {
    const btn = document.querySelector('.modal-add-to-cart');
    const productId = parseInt(btn.dataset.productId);
    const product = ALL_PRODUCTS.find(p => p.id === productId);

    if (product) {
        addToCart(product, btn);
        closeModal();
    }
}

function addToFavoritesFromModal() {
    const btn = document.querySelector('.modal-add-to-favorites');
    const productId = parseInt(btn.dataset.productId);
    const favoriteBtn = document.querySelector(`.favorite-btn[onclick*="${productId}"]`);

    if (productId) {
        toggleFavoriteById(productId, favoriteBtn || btn);
    }
}


// Модифицируем функцию renderProducts в каталоге, чтобы добавить обработчики кликов:
function renderProducts() {
    productsContainer.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    currentProducts.slice(start, end).forEach(product => {
        const inCart = isInCart(product.id);
        const inFavorites = isInFavorites(product.id);

        productsContainer.innerHTML += `
            <div class="catalog-card" onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="image-area">
                    <img src="${product.image}" class="product">

                    <div class="rating-badge">
                        <img src="../img/goods_rating-star.svg">
                        <span>${product.rating}</span>
                    </div>

                    <button class="favorite-btn ${inFavorites ? 'active' : ''}" 
                            onclick="event.stopPropagation(); toggleFavoriteById(${product.id}, this)">
                        <img src="${inFavorites ? '../img/like-heart_on-goods-active.svg' : '../img/like-heart_on-goods.svg'}">
                    </button>

                    <div class="price-badge">${product.price} ₽</div>
                </div>

                <div class="card-content">
                    <p class="title">${product.title}</p>
                    <p class="stock">Осталось: ${product.stock}шт</p>

                    <button 
                        class="add-btn ${inCart ? 'in-cart' : ''}" 
                        ${inCart ? 'disabled' : ''}
                        onclick="event.stopPropagation(); addToCart(${JSON.stringify(product)}, this)">
                        ${inCart ? 'В корзине' : '<img src="../img/catalog-add_basket.svg">В корзину'}
                    </button>
                </div>
            </div>
        `;
    });
}





// PICK_UP

function chooseAdress() {
    const existingDropdown = document.querySelector('.address-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    const addresses = [
        "Москва, Казинаковская улица, 7к2",
        "Москва, ул. Тверская, 10",
        "Москва, пр-т Мира, 25",
        "Москва, ул. Арбат, 15",
        "Москва, Ленинградский пр-т, 67",
        "Москва, ул. Новый Арбат, 21",
        "Санкт-Петербург, Невский пр-т, 28",
        "Москва, ул. Покровка, 31"
    ];

    const dropdown = document.createElement('div');
    dropdown.className = 'address-dropdown';
    dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    margin-top: 10px;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
  `;

    addresses.forEach(address => {
        const addressItem = document.createElement('div');
        addressItem.className = 'address-item';
        addressItem.textContent = address;
        addressItem.style.cssText = `
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f0f0f0;
    `;

        addressItem.addEventListener('mouseenter', () => {
            addressItem.style.backgroundColor = '#f8f9ff';
        });

        addressItem.addEventListener('mouseleave', () => {
            addressItem.style.backgroundColor = 'transparent';
        });

        addressItem.addEventListener('click', (e) => {
            e.stopPropagation();

            document.getElementById('adress-desc').textContent = address;

            dropdown.remove();
        });

        dropdown.appendChild(addressItem);
    });

    const basketBlock = document.querySelector('.basket-block_way-of-reception');
    basketBlock.style.position = 'relative';
    basketBlock.appendChild(dropdown);

    const closeDropdown = (e) => {
        if (!basketBlock.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 0);
}




// DELIVERY

function putAdress() {
    let existingForm = document.querySelector('.address-form-container');
    
    if (existingForm) {
        existingForm.remove();
        return;
    }
    
    const basketBlock = document.querySelector('.basket-block_way-of-reception');
    const addressDesc = document.getElementById('adress-desc');
    
    const formContainer = document.createElement('div');
    formContainer.className = 'address-form-container';
    formContainer.style.cssText = `
        width: 70%;
        margin: 15px auto;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    `;
    
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.id = 'address-input';
    inputField.placeholder = 'Введите новый адрес';
    inputField.style.cssText = `
        width: 100%;
        padding: 12px 15px;
        margin-bottom: 10px;
        border: 1px solid #878FE4;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
    `;
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Подтвердить';
    confirmButton.style.cssText = `
        background-color: #878FE4;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.3s;
    `;
    
    confirmButton.onmouseover = function() {
        this.style.backgroundColor = '#6a73d4';
    };
    confirmButton.onmouseout = function() {
        this.style.backgroundColor = '#878FE4';
    };
    
    confirmButton.onclick = function() {
        const newAddress = inputField.value.trim();
        
        if (newAddress) {
            addressDesc.textContent = newAddress;
        }
        
        formContainer.remove();
    };
    
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmButton.click();
        }
    });
    
    formContainer.appendChild(inputField);
    formContainer.appendChild(confirmButton);
    
    basketBlock.insertAdjacentElement('afterend', formContainer);
    
    setTimeout(() => {
        inputField.focus();
    }, 10);
}




// PICK_UP and DELIVERY

document.addEventListener('DOMContentLoaded', function () {
    console.log('Страница pickup загружена');

    // Отображаем товары
    renderOrderItems();
    updateOrderSummary();

    // Назначаем обработчик для кнопки "Заказать"
    const orderButton = document.getElementById('order');
    if (orderButton) {
        orderButton.addEventListener('click', processPickupOrder);

        // Убираем inline onclick
        orderButton.onclick = null;
    }

    // Добавляем обработчики для радио-кнопок оплаты
    const payOptions = document.querySelectorAll('.pay-option');
    payOptions.forEach(option => {
        option.addEventListener('change', function () {
            const allLabels = document.querySelectorAll('.pay-button');
            allLabels.forEach(label => {
                label.style.border = '2px solid #cccccc';
            });

            if (this.checked) {
                const label = document.querySelector(`label[for="${this.id}"]`);
                if (label) {
                    label.style.border = '2px solid #7980D3';
                }
            }
        });
    });

    // Инициализируем стили радио-кнопок
    const checkedOption = document.querySelector('.pay-option:checked');
    if (checkedOption) {
        const label = document.querySelector(`label[for="${checkedOption.id}"]`);
        if (label) {
            label.style.border = '2px solid #7980D3';
        }
    }
});