document.addEventListener('DOMContentLoaded', function() {
    
    // Функционал бургер-меню
    const burgerIcon = document.querySelector('.burger-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    const overlay = document.querySelector('.overlay');
    
    // Открытие меню
    if (burgerIcon) {
        burgerIcon.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Запрещаем прокрутку страницы
        });
    }
    
    // Закрытие меню (крестик)
    if (closeMenu) {
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Возвращаем прокрутку
        });
    }
    
    // Закрытие меню при клике на оверлей
    if (overlay) {
        overlay.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Закрытие меню при клике на ссылку
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});