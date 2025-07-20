// js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Cart.js script loaded and DOM is fully parsed.');

    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
    const totalPriceSpan = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Payment Modal Elements
    const paymentModal = document.getElementById('payment-modal');
    const closeModalButton = document.querySelector('#payment-modal .close-button');
    const modalTotalPriceSpan = document.getElementById('modal-total-price');
    const vodafonePhoneNumberInput = document.getElementById('vodafone-phone-number');
    const whatsappPhoneNumberInput = document.getElementById('whatsapp-phone-number'); // NEW: WhatsApp input
    const paymentScreenshotInput = document.getElementById('payment-screenshot');
    const sendPaymentProofBtn = document.getElementById('send-payment-proof-btn');
    const successMessageDiv = document.getElementById('success-message'); // NEW: Success message div

    const TELEGRAM_BOT_TOKEN = '7802492625:AAE-9hC6d4L84KUIs6s-lUEzn8rIVzbOlxk'; // توكن البوت الخاص بك
    const TELEGRAM_CHAT_ID = '5840731327'; // ID المحادثة الخاصة بك (أو ID المجموعة)

    let cart = []; // مصفوفة لتخزين عناصر السلة مؤقتًا

    // --- 1. Load Cart from localStorage ---
    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                cart = JSON.parse(storedCart);
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                cart = []; // مسح السلة إذا كانت البيانات تالفة
            }
        }
        renderCart();
        updateCartTotal();
    }

    // --- 2. Render Cart Items ---
    function renderCart() {
        cartItemsContainer.innerHTML = ''; // مسح المحتوى الحالي

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
            return;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
        }

        cart.forEach(item => {
            const cartItemCard = document.createElement('div');
            cartItemCard.classList.add('cart-item-card');
            cartItemCard.dataset.id = item.id; // لتحديد العنصر عند الحذف أو التعديل

            cartItemCard.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-price">${item.price} جنيه مصري</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="decrease-quantity-btn" data-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="increase-quantity-btn" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemCard);
        });

        addCartItemEventListeners(); // إضافة مستمعي الأحداث بعد عرض العناصر
    }

    // --- 3. Update Cart in localStorage ---
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        // تحديث عداد السلة في الهيدر (وظيفة عامة في main.js)
        if (typeof window.updateCartCount === 'function') {
            window.updateCartCount();
        }
    }

    // --- 4. Update Cart Total ---
    function updateCartTotal() {
        let subtotal = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity || 1); 
            if (!isNaN(price) && !isNaN(quantity)) {
                subtotal += price * quantity;
            } else {
                console.warn(`Invalid price or quantity for item ID: ${item.id}`);
            }
        });

        subtotalPriceSpan.innerText = `${subtotal.toFixed(2)} جنيه مصري`;
        
        const shippingCost = 50; // Fixed shipping cost for all governorates in Egypt
        const total = subtotal + shippingCost;
        totalPriceSpan.innerText = `${total.toFixed(2)} جنيه مصري`;
        modalTotalPriceSpan.innerText = `${total.toFixed(2)} جنيه مصري`; // تحديث السعر في المودال

        checkoutBtn.disabled = cart.length === 0; // تعطيل زر الدفع إذا كانت السلة فارغة
    }

    // --- 5. Add Event Listeners for Cart Items ---
    function addCartItemEventListeners() {
        document.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                const item = cart.find(i => i.id === itemId);
                if (item) {
                    item.quantity = (item.quantity || 1) + 1;
                    saveCart();
                    renderCart(); 
                    updateCartTotal();
                }
            });
        });

        document.querySelectorAll('.decrease-quantity-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = parseInt(event.target.dataset.id);
                const item = cart.find(i => i.id === itemId);
                if (item) { 
                    if (item.quantity > 1) {
                        item.quantity--;
                        saveCart();
                        renderCart();
                        updateCartTotal();
                    } else if (item.quantity === 1) {
                        removeCartItem(itemId);
                    }
                }
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const cartItemCard = event.target.closest('.cart-item-card');
                if (cartItemCard) {
                    const itemId = parseInt(cartItemCard.dataset.id); 
                    removeCartItem(itemId);
                } else {
                    console.error("Could not find parent cart-item-card for remove button.");
                }
            });
        });
    }

    // --- 6. Remove Item from Cart ---
    function removeCartItem(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        saveCart();
        renderCart();
        updateCartTotal();
    }

    // --- Payment Modal Logic ---
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            paymentModal.style.display = 'flex'; // Show the modal
            modalTotalPriceSpan.innerText = totalPriceSpan.innerText; // Update total in modal
            // Hide success message if it was shown previously
            successMessageDiv.classList.remove('show');
            successMessageDiv.style.display = 'none';
        } else {
            alert('عربة التسوق فارغة لا يمكن المتابعة للدفع.');
        }
    });

    closeModalButton.addEventListener('click', () => {
        paymentModal.style.display = 'none'; // Hide the modal
        // Optional: clear input fields when closing
        vodafonePhoneNumberInput.value = '';
        whatsappPhoneNumberInput.value = '';
        paymentScreenshotInput.value = ''; // Clear file input
    });

    // Close modal if clicked outside of the content
    window.addEventListener('click', (event) => {
        if (event.target == paymentModal) {
            paymentModal.style.display = 'none';
            // Optional: clear input fields when closing
            vodafonePhoneNumberInput.value = '';
            whatsappPhoneNumberInput.value = '';
            paymentScreenshotInput.value = ''; // Clear file input
        }
    });

    // --- Send Payment Proof to Telegram Bot ---
    sendPaymentProofBtn.addEventListener('click', async () => {
        const vodafonePhone = vodafonePhoneNumberInput.value.trim();
        const whatsappPhone = whatsappPhoneNumberInput.value.trim(); // NEW: Get WhatsApp phone
        const screenshotFile = paymentScreenshotInput.files[0];
        const currentTotal = totalPriceSpan.innerText;

        if (!vodafonePhone) {
            alert('من فضلك أدخل رقم هاتف فودافون كاش الذي تم التحويل منه.');
            return;
        }

        if (!whatsappPhone) { // NEW: Validate WhatsApp phone
            alert('من فضلك أدخل رقم واتساب للتواصل.');
            return;
        }

        // Make screenshot mandatory
        if (!screenshotFile) {
            alert('صورة إيصال الدفع إجبارية لإتمام الطلب.');
            return;
        }

        sendPaymentProofBtn.disabled = true; // Disable button to prevent multiple submissions
        sendPaymentProofBtn.innerText = 'جاري الإرسال...';
        successMessageDiv.classList.remove('show'); // Hide success message during submission
        successMessageDiv.style.display = 'none';

        let message = `*طلب دفع جديد - Nour Stor*\n\n`;
        message += `*الإجمالي الكلي:* ${currentTotal}\n`;
        message += `*رقم هاتف التحويل (فودافون كاش):* \`${vodafonePhone}\`\n`;
        message += `*رقم واتساب للتواصل:* \`${whatsappPhone}\`\n\n`; // NEW: Add WhatsApp to message
        message += `*تفاصيل الطلب:*\n`;

        cart.forEach((item, index) => {
            message += `_المنتج ${index + 1}:_\n`;
            message += `   *الاسم:* ${item.name}\n`;
            message += `   *الكمية:* ${item.quantity}\n`;
            message += `   *السعر للوحدة:* ${item.price} جنيه مصري\n`;
            message += `   *الإجمالي للوحدة:* ${(item.price * item.quantity).toFixed(2)} جنيه مصري\n`;
            message += `\n`;
        });

        // Function to send message to Telegram
        async function sendTelegramMessage(text, photoFile = null) {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('parse_mode', 'Markdown');
            
            if (photoFile) {
                // If photo is provided, send as photo with caption
                formData.append('photo', photoFile);
                formData.append('caption', text);
                return fetch(url + 'sendPhoto', {
                    method: 'POST',
                    body: formData,
                });
            } else {
                // Otherwise, send as a regular message (though photo is mandatory now)
                formData.append('text', text);
                return fetch(url + 'sendMessage', {
                    method: 'POST',
                    body: formData,
                });
            }
        }

        try {
            // Validate file size (max 5MB for Telegram photos)
            const MAX_FILE_SIZE_MB = 5;
            if (screenshotFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                alert(`حجم الصورة كبير جداً. الحد الأقصى ${MAX_FILE_SIZE_MB} ميجابايت.`);
                sendPaymentProofBtn.disabled = false;
                sendPaymentProofBtn.innerText = 'إرسال إثبات الدفع';
                return;
            }
            
            // Send the message with the photo (it's mandatory now)
            const response = await sendTelegramMessage(message, screenshotFile);

            const data = await response.json();
            if (response.ok && data.ok) {
                // Show success message on screen
                successMessageDiv.style.display = 'block';
                setTimeout(() => {
                    successMessageDiv.classList.add('show');
                }, 10); // Small delay for transition to work

                // Optional: hide modal after a short delay to let user see success message
                setTimeout(() => {
                    paymentModal.style.display = 'none';
                    vodafonePhoneNumberInput.value = ''; // Clear fields
                    whatsappPhoneNumberInput.value = '';
                    paymentScreenshotInput.value = '';
                    successMessageDiv.classList.remove('show');
                    successMessageDiv.style.display = 'none'; // Hide success div completely
                }, 3000); // Hide after 3 seconds

                // DO NOT CLEAR CART HERE. KEEP PRODUCTS IN CART
                // cart = []; 
                // saveCart();
                // renderCart();
                // updateCartTotal();

            } else {
                console.error('Telegram API error:', data);
                alert('حدث خطأ أثناء إرسال إثبات الدفع. يرجى المحاولة مرة أخرى.');
            }
        } catch (error) {
            console.error('Error sending payment proof:', error);
            alert('حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        } finally {
            sendPaymentProofBtn.disabled = false;
            sendPaymentProofBtn.innerText = 'إرسال إثبات الدفع';
        }
    });

    // --- Initial Load ---
    loadCart(); // تحميل وعرض السلة عند فتح الصفحة
});