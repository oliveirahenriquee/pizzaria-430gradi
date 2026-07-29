let cart = [];
let discount = 0;
let appliedCouponCode = "";

function showToast(message, type = 'success') {
    const toast = document.getElementById('cart-toast');
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

    toast.innerHTML = `
        <div class="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
            <div class="rounded-full bg-amber-500/15 p-2 text-amber-400">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div>
                <p class="text-sm font-semibold text-white">${message}</p>
            </div>
        </div>
    `;

    toast.classList.remove('hidden');
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => toast.classList.add('hidden'), 2200);
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('translate-x-full');
}

function toggleNotification() {
    const notifBox = document.getElementById('notification-box');
    const badge = document.getElementById('notif-badge');
    notifBox.classList.toggle('hidden');
    if (badge) badge.remove(); 
}

function toggleFaq(id) {
    const answer = document.getElementById(`faq-answer-${id}`);
    const icon = document.getElementById(`faq-icon-${id}`);
    answer.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
}

function addToCart(name, price) {
    const itemExistente = cart.find(item => item.name === name);
    if (itemExistente) {
        itemExistente.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
    showToast(`${name} adicionado ao carrinho!`);
}

function updateQuantity(name, amount) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-count');
    
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item-row');
    existingItems.forEach(el => el.remove());

    let subtotal = 0;
    let totalItens = 0;

    if (cart.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            totalItens += item.quantity;

            const div = document.createElement('div');
            div.className = 'cart-item-row flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700/50';
            div.innerHTML = `
                <div>
                    <p class="font-bold text-sm text-slate-100">${item.name}</p>
                    <p class="text-xs text-amber-400">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="updateQuantity('${item.name}', -1)" class="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs">-</button>
                    <span class="text-sm font-bold">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', 1)" class="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    let finalDiscount = discount;
    if (appliedCouponCode === "PIZZA10") {
        finalDiscount = subtotal * 0.10; 
    } else if (appliedCouponCode === "TERCAOFF" && subtotal > 15) {
        finalDiscount = 15; 
    }

    const paymentMethod = document.getElementById('payment-method').value;
    if (paymentMethod === 'pix' && subtotal > 0) {
        finalDiscount += (subtotal - finalDiscount) * 0.10;
    }

    const total = Math.max(0, subtotal - finalDiscount);
    const couponStatus = document.getElementById('coupon-status');
    const couponStatusText = document.getElementById('coupon-status-text');

    if (appliedCouponCode) {
        couponStatus.classList.remove('hidden');
        couponStatus.classList.add('flex');
        couponStatusText.innerText = `Cupom ativo: ${appliedCouponCode}`;
    } else {
        couponStatus.classList.add('hidden');
        couponStatus.classList.remove('flex');
    }

    cartCount.innerText = totalItens;
    document.getElementById('subtotal-val').innerText = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('discount-val').innerText = `- R$ ${finalDiscount.toFixed(2)}`;
    document.getElementById('total-val').innerText = `R$ ${total.toFixed(2)}`;
}

document.getElementById('payment-method').addEventListener('change', updateCartUI);

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (couponInput === "PIZZA10" || couponInput === "TERCAOFF") {
        appliedCouponCode = couponInput;
        showToast(`Cupom "${couponInput}" aplicado com sucesso!`);
        updateCartUI();
    } else {
        showToast("Cupom inválido ou expirado.", "error");
    }
}

function removeCoupon() {
    if (!appliedCouponCode) return;
    appliedCouponCode = "";
    document.getElementById('coupon-input').value = "";
    showToast("Cupom removido.");
    updateCartUI();
}

function copiarCupom(cupom, button) {
    navigator.clipboard.writeText(cupom);
    const originalText = button.innerText;
    button.innerText = "Copiado!";
    setTimeout(() => {
        button.innerText = originalText;
    }, 1500);
}

function copiarLink(button) {
    const refLink = document.getElementById('ref-link').value;
    navigator.clipboard.writeText(refLink);
    const originalText = button.innerText;
    button.innerText = "Copiado!";
    button.classList.add('bg-green-500');
    setTimeout(() => {
        button.innerText = originalText;
        button.classList.remove('bg-green-500');
    }, 1500);
}

function checkout() {
    if (cart.length === 0) {
        showToast("Seu carrinho está vazio!", "error");
        return;
    }
    showToast("Pedido enviado com sucesso para a cozinha! Obrigado por comprar conosco.");
    cart = [];
    appliedCouponCode = "";
    document.getElementById('coupon-input').value = "";
    updateCartUI();
    toggleCart();
}

function filterCategory(category, button) {
    
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'text-black');
        btn.classList.add('bg-zinc-900', 'text-zinc-400');
    });
    
    button.classList.remove('bg-zinc-900', 'text-zinc-400');
    button.classList.add('active', 'bg-white', 'text-black');

    const items = document.querySelectorAll('.cardapio-item');
    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'todos' || itemCategory === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}