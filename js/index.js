// js/index.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Index.js script loaded and DOM is fully parsed.');

    // --- Hero Section Dynamic Content / Animation ---
    const heroTitle = document.querySelector('.hero-content h1');
    const heroParagraph = document.querySelector('.hero-content p');

    if (heroTitle && heroParagraph) {
        // تأثير ظهور تدريجي لعنوان وفقرة الـ Hero
        setTimeout(() => {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
            heroParagraph.style.opacity = '1';
            heroParagraph.style.transform = 'translateY(0)';
        }, 300); // تأخير بسيط لبدء التحريك بعد تحميل الصفحة ليعطي انطباعًا ديناميكيًا
    }

    // --- Info Sections Interactions (Hover Effects & Click Actions) ---
    const infoCards = document.querySelectorAll('.info-card');

    infoCards.forEach(card => {
        // إضافة كلاس 'hover-effect' لتطبيق تأثيرات CSS عند التحويم
        card.addEventListener('mouseover', () => {
            card.classList.add('hover-effect');
        });
        card.addEventListener('mouseout', () => {
            card.classList.remove('hover-effect');
        });

        // مثال: عند النقر على بطاقة، يمكن توجيهه لصفحة المنتجات مع فلتر معين
        card.addEventListener('click', () => {
            const cardTitle = card.querySelector('h3').innerText;
            console.log(`Clicked on: ${cardTitle}`);
            // هنا يمكنك إضافة منطق إعادة التوجيه لصفحة المنتجات بناءً على البطاقة التي تم النقر عليها
            // مثال: window.location.href = `products.html?category=${encodeURIComponent(cardTitle)}`;
        });
    });

    // ملاحظة: الوظائف العامة مثل تحديث عداد السلة (updateCartCount) يتم استدعاؤها من main.js.
    // هذا الملف (index.js) يركز على الوظائف والتفاعلات الخاصة بمحتوى الصفحة الرئيسية فقط.
});