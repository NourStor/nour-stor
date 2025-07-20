// js/product-details.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Product Details script loaded.');

    // جلب العناصر الرئيسية من DOM
    const productDetailContainer = document.getElementById('product-detail-container');
    const loadingMessage = document.querySelector('.loading-message');
    const productDetailContent = document.querySelector('.product-detail-content');
    const productNotFoundMessage = document.querySelector('.product-not-found');

    const mainProductImage = document.getElementById('mainProductImage');
    const thumbnailImagesContainer = document.getElementById('thumbnailImages');
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    const imageCounter = document.getElementById('imageCounter');

    const productNameElem = document.getElementById('productName');
    const productCategoryElem = document.getElementById('productCategory');
    const productPriceElem = document.getElementById('productPrice');
    const productDescriptionElem = document.getElementById('productDescription');
    const productQuantityInput = document.getElementById('productQuantity');
    const decreaseQuantityBtn = document.getElementById('decreaseQuantity');
    const increaseQuantityBtn = document.getElementById('increaseQuantity');
    const addToCartBtn = document.querySelector('.btn-add-to-cart-detail');

    let currentProduct = null; // لتخزين المنتج الذي يتم عرضه
    let currentImageIndex = 0; // لتتبع الصورة الحالية المعروضة في المعرض

    /**
     * @function getProductIdFromUrl
     * @description تستخرج ID المنتج من عنوان URL.
     * @returns {number|null} ID المنتج أو null إذا لم يتم العثور عليه.
     */
    function getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        return productId ? parseInt(productId) : null;
    }

    /**
     * @function renderProductDetails
     * @description تعرض تفاصيل المنتج على الصفحة.
     * @param {Object} product - كائن المنتج المراد عرضه.
     */
    function renderProductDetails(product) {
        currentProduct = product; // حفظ المنتج الحالي
        
        // إخفاء رسالة التحميل وعرض محتوى المنتج
        loadingMessage.style.display = 'none';
        productDetailContent.style.display = 'flex'; // استخدام flex لأن CSS يعتمد على flexbox

        // تعبئة البيانات الأساسية للمنتج
        productNameElem.innerText = product.name;
        productCategoryElem.innerText = product.category;
        productPriceElem.innerText = `${product.price} جنيه مصري`;
        productDescriptionElem.innerText = product.description;
        addToCartBtn.dataset.id = product.id; // تعيين ID المنتج لزر الإضافة للسلة

        // معالجة الصور (يجب أن يكون لديك مصفوفة صور في كائن المنتج)
        // إذا لم يكن لديك 'images' كـ Array في data.js، فستحتاج إلى تعديلها.
        // افتراض: product.image هو الصورة الرئيسية، و product.additionalImages هي مصفوفة صور إضافية.
        // أو إذا كان product.image هو المصفوفة الوحيدة، فسنستخدمها كلها.
        const allProductImages = product.additionalImages && product.additionalImages.length > 0 
                                 ? [product.image, ...product.additionalImages] 
                                 : [product.image];
        
        // التأكد من أن الصور موجودة
        if (!allProductImages || allProductImages.length === 0) {
            mainProductImage.src = 'images/placeholder.jpg'; // صورة افتراضية
            mainProductImage.alt = 'لا توجد صورة';
            thumbnailImagesContainer.innerHTML = '';
            imageCounter.innerText = '';
            prevImageBtn.style.display = 'none';
            nextImageBtn.style.display = 'none';
            return;
        }

        // عرض الصورة الرئيسية الأولى
        mainProductImage.src = allProductImages[0];
        mainProductImage.alt = product.name;
        currentImageIndex = 0; // إعادة تعيين الفهرس

        // عرض الصور المصغرة
        thumbnailImagesContainer.innerHTML = ''; // مسح الصور المصغرة القديمة
        allProductImages.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `${product.name} - صورة ${index + 1}`;
            img.dataset.index = index; // حفظ الفهرس في dataset
            if (index === currentImageIndex) {
                img.classList.add('active'); // تمييز الصورة النشطة
            }
            img.addEventListener('click', () => {
                showImage(index); // عند النقر على صورة مصغرة، اعرضها كصورة رئيسية
            });
            thumbnailImagesContainer.appendChild(img);
        });

        updateImageDisplay(allProductImages); // تحديث عداد الصور والأزرار
    }

    /**
     * @function showImage
     * @description تقوم بتغيير الصورة الرئيسية المعروضة وتحديث الصور المصغرة والعداد.
     * @param {number} index - فهرس الصورة المراد عرضها.
     */
    function showImage(index) {
        const allProductImages = currentProduct.additionalImages && currentProduct.additionalImages.length > 0 
                                 ? [currentProduct.image, ...currentProduct.additionalImages] 
                                 : [currentProduct.image];

        if (index < 0) {
            index = allProductImages.length - 1; // الانتقال لآخر صورة
        } else if (index >= allProductImages.length) {
            index = 0; // الانتقال لأول صورة
        }

        currentImageIndex = index;
        mainProductImage.src = allProductImages[currentImageIndex];
        mainProductImage.alt = `${currentProduct.name} - صورة ${currentImageIndex + 1}`;
        
        updateImageDisplay(allProductImages);
    }

    /**
     * @function updateImageDisplay
     * @description تحدث الكلاس النشط للصور المصغرة وتحديث عداد الصور.
     * @param {Array} imagesArray - مصفوفة جميع مسارات الصور.
     */
    function updateImageDisplay(imagesArray) {
        // تحديث الكلاس 'active' للصور المصغرة
        const thumbnails = thumbnailImagesContainer.querySelectorAll('img');
        thumbnails.forEach((thumb, idx) => {
            if (idx === currentImageIndex) {
                thumb.classList.add('active');
                // جعل الصورة المصغرة النشطة مرئية في شريط التمرير
                thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                thumb.classList.remove('active');
            }
        });

        // تحديث عداد الصور
        if (imagesArray.length > 1) {
            imageCounter.innerText = `${currentImageIndex + 1} / ${imagesArray.length}`;
            prevImageBtn.style.display = 'block';
            nextImageBtn.style.display = 'block';
        } else {
            imageCounter.innerText = '';
            prevImageBtn.style.display = 'none';
            nextImageBtn.style.display = 'none';
        }
    }


    /**
     * @function loadProduct
     * @description جلب ID المنتج، والبحث عنه، ثم عرضه أو إظهار رسالة خطأ.
     */
    function loadProduct() {
        loadingMessage.style.display = 'block'; // عرض رسالة التحميل
        productDetailContent.style.display = 'none';
        productNotFoundMessage.style.display = 'none';

        const productId = getProductIdFromUrl();

        if (productId) {
            // استخدام `products` من ملف `data.js`
            const product = products.find(p => p.id === productId);

            if (product) {
                renderProductDetails(product);
            } else {
                loadingMessage.style.display = 'none';
                productNotFoundMessage.style.display = 'block';
            }
        } else {
            loadingMessage.style.display = 'none';
            productNotFoundMessage.style.display = 'block';
        }
    }

    // مستمعي أحداث معرض الصور
    prevImageBtn.addEventListener('click', () => {
        showImage(currentImageIndex - 1);
    });

    nextImageBtn.addEventListener('click', () => {
        showImage(currentImageIndex + 1);
    });

    // مستمعي أحداث التحكم في الكمية
    decreaseQuantityBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        if (currentQuantity > 1) {
            productQuantityInput.value = currentQuantity - 1;
        }
    });

    increaseQuantityBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        productQuantityInput.value = currentQuantity + 1;
    });

    // مستمع حدث زر الإضافة للسلة (في صفحة التفاصيل)
    addToCartBtn.addEventListener('click', (event) => {
        if (!currentProduct) return; // تأكد أن هناك منتج معروض

        const productId = currentProduct.id;
        const quantity = parseInt(productQuantityInput.value);

        if (isNaN(quantity) || quantity < 1) {
            alert('الرجاء إدخال كمية صحيحة.');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + quantity; // إضافة الكمية المحددة
        } else {
            cart.push({ ...currentProduct, quantity: quantity }); // إضافة المنتج بكمية محددة
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // تغيير نص الزر ولونه
        const originalText = addToCartBtn.innerText;
        addToCartBtn.innerText = `✓ تمت الإضافة (${quantity})`; // إظهار الكمية المضافة
        addToCartBtn.classList.add('added-to-cart');

        // تحديث عداد السلة في الهيدر (إذا كانت الدالة موجودة في main.js)
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }

        // إعادة الزر لحالته الأصلية بعد فترة
        setTimeout(() => {
            addToCartBtn.innerText = originalText;
            addToCartBtn.classList.remove('added-to-cart');
        }, 2000); // 2 ثانية
    });


    // عند تحميل الصفحة، ابدأ بتحميل تفاصيل المنتج
    loadProduct();
});