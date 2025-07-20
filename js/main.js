// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js script loaded and DOM is fully parsed.');

    const menuToggleBtn = document.querySelector('.menu-toggle-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const cartCountSpan = document.querySelector('.cart-count');
    const mainNavLinks = document.querySelectorAll('.main-nav a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    // --- Mobile Navigation Toggle ---
    menuToggleBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        // تغيير أيقونة القائمة
        if (mobileNav.classList.contains('active')) {
            menuToggleBtn.querySelector('i').classList.remove('fa-bars');
            menuToggleBtn.querySelector('i').classList.add('fa-times');
        } else {
            menuToggleBtn.querySelector('i').classList.remove('fa-times');
            menuToggleBtn.querySelector('i').classList.add('fa-bars');
        }
    });

    // إغلاق قائمة الجوال عند النقر على رابط
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            menuToggleBtn.querySelector('i').classList.remove('fa-times');
            menuToggleBtn.querySelector('i').classList.add('fa-bars');
        });
    });

    // --- Update Cart Count ---
    // هذه الوظيفة ستكون متاحة عالمياً (window.updateCartCount)
    // لتتمكن السكريبتات الأخرى (products.js, product-details.js, cart.js) من استدعائها
    window.updateCartCount = function() {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountSpan.innerText = totalItems;
    };

    // تحديث عدد السلة عند تحميل أي صفحة
    window.updateCartCount();

    // --- Active Nav Link Highlight ---
    function setActiveNavLink() {
        const currentPath = window.location.pathname.split('/').pop(); // Get filename
        const allNavLinks = [...mainNavLinks, ...mobileNavLinks];

        allNavLinks.forEach(link => {
            // إزالة الكلاس active من الكل أولاً
            link.classList.remove('active');
            // إذا كان الرابط يؤدي إلى الصفحة الحالية، أضف الكلاس active
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
            // معالجة حالة الصفحة الرئيسية (index.html)
            if (currentPath === '' || currentPath === 'index.html') {
                document.querySelector('.main-nav a[href="index.html"]').classList.add('active');
                document.querySelector('.mobile-nav a[href="index.html"]').classList.add('active');
            }
        });
    }

    setActiveNavLink(); // استدعي الدالة عند تحميل الصفحة

    // يمكنك إضافة منطق البحث هنا (زر البحث في الهيدر)
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', () => {
        alert('وظيفة البحث قيد التطوير!');
        // يمكنك هنا عرض حقل بحث منبثق أو إعادة التوجيه لصفحة البحث
    });
});