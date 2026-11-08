<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCart, formatRub } from '../../composables/useCart.js';

const router = useRouter();
const {
  cartItems,
  isCartOpen,
  totalCount,
  totalPrice,
  closeCart,
  changeQty,
  removeItem,
  clearCart
} = useCart();

// Lock background scroll when drawer is open
watch(isCartOpen, (isOpen) => {
  if (typeof document === 'undefined') return;
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

function handleKeydown(e) {
  if (e.key === 'Escape' && isCartOpen.value) {
    closeCart();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});

function goToCatalog() {
  closeCart();
  router.push('/catalog');
}

function goToCheckout() {
  closeCart();
  router.push('/checkout');
}
</script>

<template>
  <!-- Teleport to body for top-level z-index stack -->
  <teleport to="body">
    <!-- Backdrop Overlay -->
    <transition
      enter-active-class="transition-opacity ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isCartOpen" 
        @click="closeCart" 
        class="fixed inset-0 bg-black/40 z-50 transition-opacity"
        aria-hidden="true"
      ></div>
    </transition>

    <!-- Slide-over Drawer Panel -->
    <transition
      enter-active-class="transition-transform ease-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform ease-in duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside 
        v-if="isCartOpen"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-neutral-border focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartDrawerTitle"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-white shrink-0">
          <div class="flex items-center gap-2.5">
            <h2 id="cartDrawerTitle" class="text-base sm:text-lg font-bold text-neutral-dark">
              Корзина
            </h2>
            <span 
              v-if="totalCount > 0" 
              class="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded bg-[#F4F6F9] text-neutral-dark border border-neutral-border"
            >
              {{ totalCount }} {{ totalCount === 1 ? 'товар' : totalCount < 5 ? 'товара' : 'товаров' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              v-if="cartItems.length > 0"
              @click="clearCart" 
              class="text-xs text-neutral-muted hover:text-red-600 transition px-2 py-1 cursor-pointer font-medium"
              title="Очистить всю корзину"
            >
              Очистить
            </button>
            <button 
              @click="closeCart" 
              class="w-8 h-8 rounded-lg text-neutral-muted hover:text-neutral-dark hover:bg-[#F4F6F9] transition flex items-center justify-center cursor-pointer"
              aria-label="Закрыть корзину"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Items List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-neutral-border/60">
          
          <!-- Empty State -->
          <div 
            v-if="cartItems.length === 0" 
            class="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-4"
          >
            <div class="w-16 h-16 rounded-full bg-[#F4F6F9] flex items-center justify-center text-neutral-muted">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="space-y-1.5 max-w-xs">
              <h3 class="text-base font-bold text-neutral-dark">В корзине пока пусто</h3>
              <p class="text-xs text-neutral-muted leading-relaxed">
                Выберите необходимое геодезическое оборудование и комплектующие в каталоге
              </p>
            </div>
            <button 
              @click="goToCatalog"
              class="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Перейти в каталог
            </button>
          </div>

          <!-- Items Cards -->
          <div 
            v-for="item in cartItems" 
            :key="item.id || item.title"
            class="pt-3 first:pt-0 flex gap-3 sm:gap-4 items-start"
          >
            <!-- Thumbnail -->
            <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#F4F6F9] rounded-lg border border-neutral-border p-1.5 flex items-center justify-center">
              <img 
                :src="item.img || 'assets/client_title_apeks_ap10.png'" 
                :alt="item.title"
                class="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <!-- Info & Controls -->
            <div class="flex-1 min-w-0 flex flex-col justify-between self-stretch">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-xs sm:text-sm font-bold text-neutral-dark leading-snug line-clamp-2">
                    {{ item.title }}
                  </h4>
                  <button 
                    @click="removeItem(item.id || item.title)"
                    class="text-neutral-muted hover:text-red-600 transition p-1 cursor-pointer shrink-0"
                    title="Удалить из корзины"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                <p v-if="item.subtitle" class="text-[11px] text-neutral-muted mt-0.5 line-clamp-1">
                  {{ item.subtitle }}
                </p>
              </div>

              <!-- Price & Quantity Stepper -->
              <div class="flex items-center justify-between gap-3 mt-2.5">
                <!-- Quantity Stepper -->
                <div class="inline-flex items-center border border-neutral-border rounded-lg bg-white shadow-xs overflow-hidden">
                  <button 
                    @click="changeQty(item.id || item.title, -1)" 
                    class="w-7 h-7 flex items-center justify-center text-neutral-muted hover:text-neutral-dark hover:bg-[#F4F6F9] transition text-xs font-semibold cursor-pointer"
                    aria-label="Уменьшить количество"
                  >
                    −
                  </button>
                  <span class="w-8 text-center text-xs font-bold text-neutral-dark select-none">
                    {{ item.qty }}
                  </span>
                  <button 
                    @click="changeQty(item.id || item.title, 1)" 
                    class="w-7 h-7 flex items-center justify-center text-neutral-muted hover:text-neutral-dark hover:bg-[#F4F6F9] transition text-xs font-semibold cursor-pointer"
                    aria-label="Увеличить количество"
                  >
                    +
                  </button>
                </div>

                <!-- Price -->
                <div class="text-right">
                  <div class="text-xs sm:text-sm font-bold text-neutral-dark">
                    {{ formatRub(item.price * item.qty) }}
                  </div>
                  <div v-if="item.qty > 1" class="text-[10px] text-neutral-muted">
                    {{ formatRub(item.price) }} / шт.
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Sticky Footer -->
        <div v-if="cartItems.length > 0" class="p-5 border-t border-neutral-border bg-white space-y-3 shrink-0">
          
          <!-- Summary info -->
          <div class="space-y-1.5 pb-2">
            <div class="flex items-center justify-between text-xs text-neutral-muted">
              <span>Товары ({{ totalCount }} шт.):</span>
              <span class="font-medium text-neutral-dark">{{ formatRub(totalPrice) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-neutral-muted">
              <span>Доставка по РФ:</span>
              <span class="font-bold text-brand">Бесплатно</span>
            </div>
            <div class="flex items-baseline justify-between pt-2 border-t border-neutral-border/60">
              <span class="text-sm font-bold text-neutral-dark">Итого к оплате:</span>
              <span class="text-lg sm:text-xl font-extrabold text-neutral-dark">
                {{ formatRub(totalPrice) }}
              </span>
            </div>
          </div>

          <!-- Checkout Primary Button -->
          <button 
            @click="goToCheckout"
            class="w-full h-11 sm:h-12 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Перейти к оформлению</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>

          <!-- Continue Shopping Button -->
          <button 
            @click="closeCart"
            class="w-full py-1.5 text-xs text-center text-neutral-muted hover:text-neutral-dark font-medium transition cursor-pointer"
          >
            Продолжить покупки
          </button>

        </div>

      </aside>
    </transition>
  </teleport>
</template>
