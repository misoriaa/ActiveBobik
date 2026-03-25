function calculate() {
    const weight = Number(document.getElementById('weight').value);
    const height = Number(document.getElementById('height').value);
    const age = Number(document.getElementById('age').value);
    const gender = document.querySelector('input[name="gender"]:checked').value;

    // Проверка на корректные значения
    if (weight <= 0 || height <= 0 || age <= 0) {
        alert('Пожалуйста, введите корректные положительные значения');
        return;
    }

    const base = 10 * weight + 6.25 * height - 5 * age;
    const result = gender === 'male' ? base + 5 : base - 161;

    document.getElementById('result').textContent = Math.round(result);
}

// Автоматический расчет при загрузке страницы
window.addEventListener('load', calculate);