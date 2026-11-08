import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'apeks_gnss_cart';

// Shared state singleton across components
const cartItems = ref([]);
const isCartOpen = ref(false);

// Initialize from localStorage
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      cartItems.value = parsed;
    }
  }
} catch (e) {
  console.warn('Failed to parse cart from localStorage:', e);
}

// Persist on change
watch(
  cartItems,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
    syncHeaderBadge();
  },
  { deep: true }
);

function syncHeaderBadge() {
  if (typeof document === 'undefined') return;
  const count = cartItems.value.reduce((s, i) => s + (Number(i.qty) || 1), 0);
  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

export function formatRub(num) {
  if (!num && num !== 0) return 'По запросу';
  return Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}

export function useCart() {
  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
  });

  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      return sum + (price * qty);
    }, 0);
  });

  function openCart() {
    isCartOpen.value = true;
  }

  function closeCart() {
    isCartOpen.value = false;
  }

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value;
  }

  function addToCart(arg1, arg2, arg3, arg4, arg5) {
    let item = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      item = { ...arg1 };
    } else if (typeof arg1 === 'number' && typeof arg2 === 'string' && typeof arg3 === 'number') {
      // addToCart(prod.id, prod.title, prod.price, prod.mainImage, qty)
      item = {
        id: String(arg1),
        title: arg2,
        price: arg3,
        img: arg4 || '',
        qty: Number(arg5) || 1
      };
    } else if (typeof arg1 === 'string' && typeof arg2 === 'number') {
      // addToCart(title, price, img, subtitle, qty)
      item = {
        id: arg1,
        title: arg1,
        price: arg2,
        img: arg3 || '',
        subtitle: typeof arg4 === 'string' ? arg4 : '',
        qty: Number(arg5) || (typeof arg4 === 'number' ? arg4 : 1)
      };
    } else {
      item = {
        id: String(arg1 || Date.now()),
        title: String(arg2 || arg1 || 'Товар'),
        price: Number(arg3 || arg2) || 0,
        img: arg4 || '',
        qty: Number(arg5) || 1
      };
    }

    const qtyToAdd = Math.max(1, Number(item.qty) || 1);
    const existing = cartItems.value.find(i => i.title === item.title);

    if (existing) {
      existing.qty = (Number(existing.qty) || 1) + qtyToAdd;
    } else {
      cartItems.value.push({
        id: item.id || Date.now().toString(),
        title: item.title,
        price: Number(item.price) || 0,
        img: item.img || 'assets/client_title_apeks_ap10.png',
        subtitle: item.subtitle || '',
        slug: item.slug || '',
        qty: qtyToAdd
      });
    }

    isCartOpen.value = true;
  }

  function changeQty(idOrTitle, delta) {
    const item = cartItems.value.find(i => i.id === idOrTitle || i.title === idOrTitle);
    if (item) {
      const nextQty = (Number(item.qty) || 1) + Number(delta);
      if (nextQty <= 0) {
        removeItem(idOrTitle);
      } else {
        item.qty = nextQty;
      }
    }
  }

  function setQty(idOrTitle, newQty) {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    if (qty <= 0) {
      removeItem(idOrTitle);
    } else {
      const item = cartItems.value.find(i => i.id === idOrTitle || i.title === idOrTitle);
      if (item) {
        item.qty = qty;
      }
    }
  }

  function removeItem(idOrTitle) {
    cartItems.value = cartItems.value.filter(i => i.id !== idOrTitle && i.title !== idOrTitle);
  }

  function clearCart() {
    cartItems.value = [];
  }

  return {
    cartItems,
    isCartOpen,
    totalCount,
    totalPrice,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    changeQty,
    setQty,
    removeItem,
    clearCart,
    formatRub
  };
}
