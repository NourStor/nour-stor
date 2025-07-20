// js/index.js

document.addEventListener('DOMContentLoaded', () => {
    const scrollLeftButton = document.querySelector('.scroll-button.scroll-left');
    const scrollRightButton = document.querySelector('.scroll-button.scroll-right');
    const categoriesGrid = document.querySelector('.categories-grid');

    if (scrollLeftButton && scrollRightButton && categoriesGrid) {
        // زر التمرير لليمين (لأن الاتجاه RTL)
        scrollLeftButton.addEventListener('click', () => {
            scrollContent(categoriesGrid, 'left'); 
        });

        // زر التمرير لليسار
        scrollRightButton.addEventListener('click', () => {
            scrollContent(categoriesGrid, 'right'); 
        });
    }

    function scrollContent(element, direction) {
        const scrollAmount = element.offsetWidth * 0.8; 

        if (direction === 'left') {
            element.scrollBy({
                left: scrollAmount, // Scroll right for 'left' direction in RTL
                behavior: 'smooth'
            });
        } else if (direction === 'right') {
            element.scrollBy({
                left: -scrollAmount, // Scroll left for 'right' direction in RTL
                behavior: 'smooth'
            });
        }
    }
});