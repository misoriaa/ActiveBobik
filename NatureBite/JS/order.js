document.addEventListener('DOMContentLoaded', function() {
    // Загружаем данные заказа из localStorage
    loadOrderData();
    
    // Заполняем даты и время и делаем селекты недоступными для изменения
    initializeDateAndTimeSelects();
    
    // Обработчик для кнопки "Заказать"
    const orderButton = document.querySelector('.result-btn');
    if (orderButton) {
        orderButton.addEventListener('click', function(e) {
            e.preventDefault();
            submitOrder();
        });
    }
    
    // Маска для телефона с возможностью стирать первый символ
    initializePhoneMask();
    
    // Валидация формы перед отправкой
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        
        if (!name) {
            alert('Пожалуйста, введите имя');
            return false;
        }
        
        if (phone.replace(/\D/g, '').length !== 11) {
            alert('Пожалуйста, введите корректный номер телефона');
            return false;
        }
        
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Пожалуйста, введите корректный email');
            return false;
        }
        
        if (!address) {
            alert('Пожалуйста, введите адрес доставки');
            return false;
        }
        
        return true;
    }
    
    // Функция отправки заказа
    function submitOrder() {
        if (!validateForm()) {
            return;
        }
        
        // Получаем данные из формы
        const orderDetails = {
            customer: {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value
            },
            delivery: {
                address: document.getElementById('address').value,
                date: document.getElementById('address-date').value,
                time: document.getElementById('address-time').value,
                dateText: document.getElementById('address-date').options[document.getElementById('address-date').selectedIndex]?.text || '',
                timeText: document.getElementById('address-time').options[document.getElementById('address-time').selectedIndex]?.text || ''
            },
            options: getSelectedOptions(),
            payment: document.querySelector('input[name="paymentTime"]:checked')?.id === 'payNow' ? 'card' : 'cash',
            orderData: JSON.parse(localStorage.getItem('currentOrder')) || {}
        };
        
        // Здесь можно отправить данные на сервер
        console.log('Заказ оформлен:', orderDetails);
        
        // Очищаем корзину после оформления заказа
        clearCartAfterOrder();
        
        // Показываем сообщение об успехе
        alert('✅ Заказ успешно оформлен!');
        
        // Перенаправляем в корзину (а не на главную)
        window.location.href = '../cart/cart.html';
    }
    
    // Получение выбранных опций
    function getSelectedOptions() {
        const options = [];
        document.querySelectorAll('.option-checkbox:checked').forEach(checkbox => {
            const label = checkbox.closest('.option-item');
            const text = label.querySelector('.option-text').textContent;
            options.push(text);
        });
        return options;
    }
    
    // Очистка корзины после заказа
    function clearCartAfterOrder() {
        if (typeof clearCart === 'function') {
            // Определяем, какой день заказали
            const orderData = JSON.parse(localStorage.getItem('currentOrder')) || {};
            
            // Очищаем только тот день, который был в заказе
            if (orderData.day) {
                clearCart(orderData.day);
            }
        }
        
        // Удаляем данные заказа из localStorage
        localStorage.removeItem('currentOrder');
    }
});

// Функция загрузки данных заказа
function loadOrderData() {
    const orderData = JSON.parse(localStorage.getItem('currentOrder'));
    
    if (!orderData) {
        // Если нет данных, показываем сообщение и перенаправляем
        alert('Нет данных для оформления заказа');
        window.location.href = '../cart/cart.html';
        return;
    }
    
    // Определяем, какой день заказан
    let day = orderData.day || 'today';
    let dayData = orderData[day];
    
    if (!dayData) {
        // Если данных для этого дня нет, пробуем найти любой день
        if (orderData.today) {
            day = 'today';
            dayData = orderData.today;
        } else if (orderData.tomorrow) {
            day = 'tomorrow';
            dayData = orderData.tomorrow;
        }
    }
    
    if (dayData) {
        // Обновляем заголовок в зависимости от дня
        const dayTitle = document.querySelector('.page-title');
        if (dayTitle) {
            dayTitle.textContent = day === 'today' ? 'Оформление заказа (сегодня)' : 'Оформление заказа (завтра)';
        }
        
        // Обновляем итоговую сумму
        updateTotalPrice(dayData.totalPrice || 0);
        
        // Сохраняем в localStorage информацию о том, какой день заказан
        localStorage.setItem('currentOrder', JSON.stringify({
            day: day,
            [day]: dayData
        }));
    } else {
        alert('Ошибка загрузки данных заказа');
        window.location.href = '../cart/cart.html';
    }
}

// Функция обновления итоговой суммы
function updateTotalPrice(total) {
    const resultText = document.querySelector('.result-text');
    if (resultText) {
        resultText.textContent = `Итого: ${total.toLocaleString()} руб.`;
    }
}

// Функция инициализации селектов с датой и временем
function initializeDateAndTimeSelects() {
    // Получаем сегодняшнюю дату
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Форматируем даты
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const weekday = weekdays[date.getDay()];
        
        return `${day}.${month}, ${weekday}`;
    };
    
    // Заполняем select с датами
    const dateSelect = document.getElementById('address-date');
    if (dateSelect) {
        dateSelect.innerHTML = `
            <option value="${today.toISOString()}">${formatDate(today)}</option>
            <option value="${tomorrow.toISOString()}">${formatDate(tomorrow)}</option>
        `;
        
        // Проверяем, какой день заказан
        const orderData = JSON.parse(localStorage.getItem('currentOrder'));
        if (orderData && orderData.day === 'tomorrow') {
            dateSelect.selectedIndex = 1; // Выбираем завтра
        } else {
            dateSelect.selectedIndex = 0; // Выбираем сегодня
        }
        
        // Делаем селект недоступным для изменения
        dateSelect.disabled = true;
    }
    
    // Заполняем select с временем (круглосуточно, с интервалом 1 час)
    const timeSelect = document.getElementById('address-time');
    if (timeSelect) {
        let options = '';
        
        // Генерируем время с 00:00 до 23:00 с интервалом 1 час
        for (let hour = 0; hour < 24; hour++) {
            const startHour = hour.toString().padStart(2, '0');
            const endHour = (hour + 1).toString().padStart(2, '0');
            const timeValue = `${startHour}:00-${endHour}:00`;
            const timeDisplay = `${startHour}:00-${endHour}:00`;
            
            // Делаем время с 12:00-13:00 выбранным по умолчанию
            const selected = hour === 12 ? 'selected' : '';
            
            options += `<option value="${timeValue}" ${selected}>${timeDisplay}</option>`;
        }
        
        timeSelect.innerHTML = options;
        
        // Время оставляем доступным для выбора
        timeSelect.disabled = false;
    }
}

// Функция инициализации маски телефона
function initializePhoneMask() {
    const input = document.getElementById('phone');
    if (!input) return;

    input.addEventListener('input', function () {
        let digits = input.value.replace(/\D/g, '');

        // Убираем первую 7 или 8
        if (digits.startsWith('7') || digits.startsWith('8')) {
            digits = digits.substring(1);
        }

        // Ограничиваем 10 цифрами
        digits = digits.substring(0, 10);

        let formatted = '+7';

        if (digits.length > 0) {
            formatted += ' (' + digits.substring(0, 3);
        }
        if (digits.length >= 3) {
            formatted += ') ' + digits.substring(3, 6);
        }
        if (digits.length >= 6) {
            formatted += '-' + digits.substring(6, 8);
        }
        if (digits.length >= 8) {
            formatted += '-' + digits.substring(8, 10);
        }

        input.value = formatted;
    });

    input.addEventListener('focus', function () {
        if (input.value === '') {
            input.value = '+7';
        }
    });

    input.addEventListener('keydown', function (e) {
        // Запрещаем удалять +7
        if (input.selectionStart <= 2 && e.key === 'Backspace') {
            e.preventDefault();
        }
    });
}

// Добавляем стили для отключенного селекта
const style = document.createElement('style');
style.textContent = `
    .address-select:disabled {
        background-color: #f0f0f0;
        cursor: not-allowed;
        opacity: 0.7;
    }
`;
document.head.appendChild(style);