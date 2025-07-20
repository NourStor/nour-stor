// js/products.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Products.js script loaded and DOM is fully parsed.');

    // جلب العناصر الأساسية من DOM
    const productsGrid = document.querySelector('.all-products-grid');
    const categoryFilterBtns = document.querySelectorAll('.filter-btn'); // أزرار فلاتر الفئات (الكل، ديكورات، إلخ)
    const priceRangeSlider = document.getElementById('priceRange'); // شريط نطاق السعر
    const priceValueSpan = document.getElementById('priceValue'); // عرض قيمة السعر المختارة
    const applyPriceFilterBtn = document.querySelector('.apply-price-filter'); // زر تطبيق فلتر السعر
    
    // عناصر البحث والفرز الجديدة/المؤكدة
    const searchInput = document.getElementById('productSearch'); // حقل البحث
    const searchButton = document.getElementById('searchButton'); // زر البحث
    const sortBySelect = document.getElementById('sortBy'); // قائمة الفرز المنسدلة

    // المتغيرات لحالة الفلترة والفرز الحالية
    let currentCategory = 'all'; // الفئة الافتراضية هي "الكل"
    
    // تحديد أقصى سعر ديناميكياً من بيانات المنتجات (من data.js)
    // هذا يضمن أن أقصى قيمة في شريط التمرير تتطابق مع أغلى منتج لدينا
    let maxPriceInProducts = products.reduce((max, product) => Math.max(max, product.price), 0);
    priceRangeSlider.max = maxPriceInProducts; // تحديث أقصى قيمة لشريط التمرير
    priceRangeSlider.value = maxPriceInProducts; // تعيين القيمة الافتراضية القصوى عند التحميل
    let currentMaxPrice = maxPriceInProducts; // السعر الأقصى الحالي للفلترة

    priceValueSpan.innerText = currentMaxPrice; // تحديث القيمة المعروضة الأولية للسعر

    /**
     * @function renderProducts
     * @description تقوم بمسح المنتجات الحالية وعرض المنتجات المفلترة/المفروزة في الشبكة.
     * @param {Array} filteredProducts - مصفوفة المنتجات التي سيتم عرضها.
     */
    function renderProducts(filteredProducts) {
        productsGrid.innerHTML = ''; // مسح جميع المنتجات المعروضة حاليًا

        // إذا لم تكن هناك منتجات مطابقة للفلتر، اعرض رسالة
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<p class="no-products-message">لا توجد منتجات مطابقة لمعايير البحث أو الفلترة.</p>';
            return;
        }

        // إنشاء بطاقة لكل منتج وعرضها
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <p class="product-category">${product.category}</p>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">${product.price} جنيه مصري</p>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-details" data-id="${product.id}">التفاصيل</button>
                        <button class="btn btn-primary btn-add-to-cart" data-id="${product.id}">إضافة للسلة</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });

        // بعد الانتهاء من عرض جميع المنتجات، نضيف مستمعي الأحداث لأزرار "التفاصيل" و"الإضافة للسلة"
        // هذا مهم لأن الأزرار يتم إنشاؤها ديناميكيًا مع كل عملية عرض للمنتجات
        addEventListenersToProductButtons();
    }

    /**
     * @function filterAndSortProducts
     * @description هذه هي الدالة الرئيسية التي تقوم بتطبيق جميع الفلاتر (الفئة، السعر، البحث) والفرز
     * ثم تستدعي `renderProducts` لعرض النتائج.
     * يتم استدعاؤها في كل مرة يتم فيها تغيير أي من معايير البحث أو الفلترة أو الفرز.
     */
    function filterAndSortProducts() {
        let filtered = products; // ابدأ بمصفوفة المنتجات الكاملة (من data.js)

        // 1. تطبيق فلتر الفئة
        if (currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === currentCategory);
        }

        // 2. تطبيق فلتر السعر الأقصى
        filtered = filtered.filter(product => product.price <= currentMaxPrice);

        // 3. تطبيق فلتر البحث (البحث الحقيقي عن طريق الاسم أو الوصف أو الفئة)
        const searchTerm = searchInput.value.toLowerCase().trim(); // احصل على نص البحث وحوّله لحروف صغيرة وأزل المسافات الزائدة
        if (searchTerm) { // إذا كان هناك نص بحث (ليس فارغًا)
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) || // ابحث في اسم المنتج
                product.description.toLowerCase().includes(searchTerm) || // ابحث في وصف المنتج
                product.category.toLowerCase().includes(searchTerm) // ابحث في فئة المنتج
            );
        }

        // 4. تطبيق الفرز
        const sortByValue = sortBySelect.value; // احصل على القيمة المختارة من قائمة الفرز
        if (sortByValue === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price); // فرز تصاعدي حسب السعر
        } else if (sortByValue === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price); // فرز تنازلي حسب السعر
        } else if (sortByValue === 'name-asc') {
            // فرز أبجدي تصاعدي (من أ إلى ي) مع دعم اللغة العربية
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' }));
        } else if (sortByValue === 'name-desc') {
            // فرز أبجدي تنازلي (من ي إلى أ) مع دعم اللغة العربية
            filtered.sort((a, b) => b.name.localeCompare(a.name, 'ar', { sensitivity: 'base' }));
        }
        // إذا كانت القيمة 'default'، فلا حاجة للفرز الإضافي، فالترتيب الأصلي للمنتجات سيُستخدم.

        // أخيرًا، اعرض المنتجات بعد تطبيق جميع الفلاتر والفرز
        renderProducts(filtered);
    }

    // --- مستمعي الأحداث ---

    // 1. مستمعو أحداث فلاتر الفئات
    categoryFilterBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // منع سلوك الرابط الافتراضي
            // إزالة الكلاس 'active' من الزر النشط حاليًا وإضافته للزر الذي تم النقر عليه
            categoryFilterBtns.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            currentCategory = event.target.dataset.category; // تحديث الفئة الحالية
            filterAndSortProducts(); // إعادة تطبيق جميع الفلاتر والفرز
        });
    });

    // 2. مستمع حدث شريط نطاق السعر
    priceRangeSlider.addEventListener('input', () => {
        currentMaxPrice = parseInt(priceRangeSlider.value); // تحديث السعر الأقصى الحالي
        priceValueSpan.innerText = currentMaxPrice; // تحديث القيمة المعروضة
        // لا نستدعي filterAndSortProducts() هنا مباشرة للحفاظ على الأداء
        // بل ننتظر النقر على زر "تطبيق" أو تغيير فلتر آخر.
    });

    // 3. مستمع حدث زر تطبيق فلتر السعر
    applyPriceFilterBtn.addEventListener('click', () => {
        filterAndSortProducts(); // تطبيق جميع الفلاتر والفرز عند النقر
    });

    // 4. مستمعو أحداث البحث
    searchButton.addEventListener('click', filterAndSortProducts); // عند النقر على زر البحث
    searchInput.addEventListener('keyup', (event) => { // عند الضغط على Enter في حقل البحث
        if (event.key === 'Enter') {
            filterAndSortProducts();
        }
        // يمكنك أيضًا استدعاء filterAndSortProducts() هنا مباشرة بدون شرط Enter
        // إذا أردت تحديث النتائج فورًا مع كل حرف يكتبه المستخدم (بحث مباشر)
        // ولكن قد يؤثر ذلك على الأداء مع عدد كبير جداً من المنتجات.
        // filterAndSortProducts(); // مثال للبحث المباشر
    });

    // 5. مستمع حدث قائمة الفرز المنسدلة
    sortBySelect.addEventListener('change', filterAndSortProducts); // عند تغيير خيار الفرز

    /**
     * @function addEventListenersToProductButtons
     * @description تقوم بإضافة مستمعي الأحداث لأزرار "التفاصيل" و"إضافة للسلة" لكل بطاقة منتج.
     * يجب استدعاء هذه الدالة بعد كل عملية `renderProducts` لأن الأزرار يتم إنشاؤها ديناميكيًا.
     */
    function addEventListenersToProductButtons() {
        const detailBtns = document.querySelectorAll('.btn-details');
        const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');

        // إضافة مستمعي الأحداث لأزرار التفاصيل
        detailBtns.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                // إعادة التوجيه إلى صفحة تفاصيل المنتج مع تمرير ID المنتج كمعامل في URL
                window.location.href = `product-details.html?id=${productId}`;
            });
        });

        // إضافة مستمعي الأحداث لأزرار "إضافة للسلة"
        addToCartBtns.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id); // جلب ID المنتج من الخاصية data-id
                const productToAdd = products.find(p => p.id === productId); // البحث عن المنتج في مصفوفة المنتجات
                const currentButton = event.target; // المرجع للزر الحالي الذي تم النقر عليه

                if (productToAdd) {
                    let cart = JSON.parse(localStorage.getItem('cart') || '[]'); // جلب محتويات السلة من Local Storage

                    // التحقق مما إذا كان المنتج موجودًا بالفعل في السلة
                    const existingItem = cart.find(item => item.id === productId);
                    if (existingItem) {
                        existingItem.quantity = (existingItem.quantity || 1) + 1; // زيادة الكمية إذا كان موجودًا
                    } else {
                        cart.push({ ...productToAdd, quantity: 1 }); // إضافة المنتج بكمية 1 إذا كان جديدًا
                    }

                    localStorage.setItem('cart', JSON.stringify(cart)); // حفظ السلة المحدثة في Local Storage

                    // تغيير نص الزر ولونه للإشارة إلى أنه تمت الإضافة
                    const originalText = currentButton.innerText; // حفظ النص الأصلي
                    currentButton.innerText = '✓ تمت الإضافة'; // تغيير النص
                    currentButton.classList.add('added-to-cart'); // إضافة كلاس للستايل الأخضر وتعطيل النقر

                    // تحديث عداد السلة في الهيدر (إذا كانت الدالة موجودة في main.js)
                    if (typeof window.updateCartCount === 'function') {
                        window.updateCartCount();
                    }

                    // إعادة الزر إلى حالته الأصلية بعد فترة زمنية (2 ثانية)
                    setTimeout(() => {
                        currentButton.innerText = originalText; // إعادة النص الأصلي
                        currentButton.classList.remove('added-to-cart'); // إزالة الكلاس لإعادة الستايل وتفعيل النقر
                    }, 2000); // 2000 مللي ثانية = 2 ثانية
                }
            });
        });
    }

    // --- التحميل الأولي للصفحة ---
    // استدعاء دالة filterAndSortProducts() عند تحميل الصفحة لأول مرة
    // هذا يضمن عرض جميع المنتجات الافتراضية مع تطبيق أي فلاتر افتراضية (مثل "الكل")
    filterAndSortProducts();
});