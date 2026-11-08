<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { products, getProductBySlug } from '../data/products.js';

const route = useRoute();
const router = useRouter();

// Find current product from route param
const product = computed(() => {
  return getProductBySlug(route.params.slug) || products[0];
});

const categorySlugMap = {
  'ГНСС-приёмники': 'gnss',
  'Контроллеры и планшеты': 'controllers',
  'Полевые контроллеры и планшеты': 'controllers',
  'Электронные тахеометры': 'total-stations',
  'Нивелиры и уровни': 'levels',
  'Оптические нивелиры': 'levels',
  'Радиосвязь': 'radio',
  'Аксессуары': 'accessories',
  'Полевое ПО': 'software'
};

const categorySlug = computed(() => {
  if (!product.value || !product.value.category) return '';
  return categorySlugMap[product.value.category] || '';
});

// Related products from the series
const relatedProducts = computed(() => {
  return products.filter(p => p.slug !== product.value.slug);
});

// Active image in gallery
const activeImage = ref(product.value.mainImage);

// Quantity selector
const quantity = ref(1);

// Kit options selection
const includeSoftware = ref(false);
const includeController = ref(false);

const totalPrice = computed(() => {
  let total = product.value.price || 0;
  if (includeSoftware.value && product.value.kitOptions?.software) {
    total += product.value.kitOptions.software.price;
  }
  if (includeController.value && product.value.kitOptions?.controller) {
    total += product.value.kitOptions.controller.price;
  }
  return total;
});

const isFullKit = computed(() => {
  return includeSoftware.value && includeController.value;
});

function decrementQty() {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
}

function incrementQty() {
  quantity.value += 1;
}

// Gallery navigation
function selectImage(img) {
  activeImage.value = img;
}

function nextImage() {
  const gallery = product.value.gallery || [product.value.mainImage];
  const currentIdx = gallery.indexOf(activeImage.value);
  const nextIdx = (currentIdx + 1) % gallery.length;
  activeImage.value = gallery[nextIdx];
}

function prevImage() {
  const gallery = product.value.gallery || [product.value.mainImage];
  const currentIdx = gallery.indexOf(activeImage.value);
  const prevIdx = (currentIdx - 1 + gallery.length) % gallery.length;
  activeImage.value = gallery[prevIdx];
}

// Format currency
function formatRub(num) {
  if (!num) return '0 ₽';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}

// Add to cart with current quantity and selected kit options
function handleAddToCart() {
  if (window.addToCart) {
    let configuredTitle = product.value.title;
    const optionsList = [];
    if (includeSoftware.value && product.value.kitOptions?.software) {
      optionsList.push(product.value.kitOptions.software.name);
    }
    if (includeController.value && product.value.kitOptions?.controller) {
      optionsList.push(product.value.kitOptions.controller.name);
    }
    if (isFullKit.value) {
      optionsList.push('веха 2.2 м в подарок');
    }
    if (optionsList.length > 0) {
      configuredTitle += ` [${optionsList.join(', ')}]`;
    }

    window.addToCart(
      configuredTitle,
      totalPrice.value,
      product.value.mainImage,
      product.value.subtitle,
      quantity.value
    );
  }
}

function goToProduct(slug) {
  router.push(`/product/${slug}`);
}

// Reset view on route change
watch(
  () => product.value,
  (newProd) => {
    if (newProd) {
      activeImage.value = newProd.mainImage;
      quantity.value = 1;
      includeSoftware.value = false;
      includeController.value = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="bg-white min-h-screen">
    
    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-3 bg-white">
      <nav class="flex items-center gap-2 text-xs text-neutral-muted flex-wrap">
        <router-link to="/" class="hover:text-brand transition flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Главная</span>
        </router-link>
        <span class="text-neutral-300">/</span>
        <router-link to="/catalog" class="hover:text-brand transition">
          Каталог
        </router-link>
        <template v-if="product.category">
          <span class="text-neutral-300">/</span>
          <router-link 
            :to="{ path: '/catalog', query: categorySlug ? { category: categorySlug } : undefined }" 
            class="hover:text-brand transition"
          >
            {{ product.category }}
          </router-link>
        </template>
        <span class="text-neutral-300">/</span>
        <span class="text-neutral-dark font-medium">{{ product.title }}</span>
      </nav>
    </div>

    <!-- Main Showcase Layout: 2 Columns on Desktop (Белый фон, без разделителя) -->
    <section class="pt-2 pb-10 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <!-- LEFT COLUMN: Gallery (col-span-7, sticky desktop scroll) -->
          <div class="lg:col-span-7 lg:sticky lg:top-28 space-y-4">
            
            <!-- Main Image Viewport with Vignette -->
            <div class="relative w-full product-img-box rounded-xl border border-neutral-border p-6 sm:p-10 flex items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] select-none group">
              
              <!-- Fullscreen Link in Top-Right: Без подложки, только чистый текст и иконка -->
              <a 
                :href="activeImage" 
                target="_blank"
                class="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 text-xs text-neutral-muted hover:text-brand transition select-none cursor-pointer"
                title="Открыть изображение в полном размере"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                <span>В полный экран</span>
              </a>

              <!-- Previous Image Arrow (без подложки/кружков) -->
              <button 
                v-if="product.gallery && product.gallery.length > 1"
                type="button"
                @click.stop="prevImage"
                class="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 text-neutral-400 hover:text-brand transition focus:outline-none cursor-pointer"
                aria-label="Предыдущее фото"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <!-- Main Instrument Image -->
              <img 
                :src="activeImage" 
                :alt="product.title" 
                class="max-h-[320px] sm:max-h-[400px] lg:max-h-[440px] w-auto max-w-full object-contain transition-all duration-300"
              />

              <!-- Next Image Arrow (без подложки/кружков) -->
              <button 
                v-if="product.gallery && product.gallery.length > 1"
                type="button"
                @click.stop="nextImage"
                class="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 text-neutral-400 hover:text-brand transition focus:outline-none cursor-pointer"
                aria-label="Следующее фото"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

            </div>

            <!-- Thumbnail Strip Under Main Photo -->
            <div 
              v-if="product.gallery && product.gallery.length > 1"
              class="flex items-center gap-3 overflow-x-auto pb-1"
            >
              <button 
                v-for="(img, idx) in product.gallery" 
                :key="idx"
                type="button"
                @click="selectImage(img)"
                :class="[
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-lg p-2 border transition flex items-center justify-center bg-white shrink-0 focus:outline-none cursor-pointer',
                  activeImage === img ? 'border-brand ring-2 ring-brand/20' : 'border-neutral-border hover:border-neutral-muted'
                ]"
                :aria-label="'Фото ' + (idx + 1)"
              >
                <img :src="img" :alt="product.title + ' миниатюра ' + (idx + 1)" class="max-h-full max-w-full object-contain" />
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: Commercial Details & Purchase Block (col-span-5) -->
          <div class="lg:col-span-5 space-y-5">
            
            <!-- Title & Article (Артикул без подложки) -->
            <div class="space-y-1.5">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight leading-tight">
                {{ product.title }}
              </h1>
              <p class="text-xs text-neutral-muted">
                Артикул: {{ product.article }}
              </p>
            </div>

            <!-- Price (Размер меньше H1, без кругов, без старых цен, без НДС-строки) -->
            <div class="flex items-baseline gap-2">
              <span class="text-xl sm:text-2xl font-bold text-neutral-dark">
                {{ formatRub(totalPrice) }}
              </span>
              <span v-if="includeSoftware || includeController" class="text-xs text-neutral-muted">
                (базовая: {{ formatRub(product.price) }})
              </span>
            </div>

            <!-- Short Overview Text -->
            <div class="text-xs sm:text-sm text-neutral-muted leading-relaxed">
              <p>{{ product.shortDesc }}</p>
            </div>

            <!-- Выбор опций комплекта (миниатюрный, без дублирования) -->
            <div v-if="product.kitOptions" class="space-y-2 pt-1 pb-1">
              <div class="text-xs font-semibold text-neutral-dark">
                Комплектация:
              </div>

              <div class="space-y-1.5">
                <!-- Опция 1: ПО -->
                <label 
                  :class="[
                    'flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer select-none transition',
                    includeSoftware ? 'border-brand bg-brand/5 text-neutral-dark font-medium' : 'border-neutral-border hover:border-neutral-muted bg-white text-neutral-dark'
                  ]"
                >
                  <span class="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      v-model="includeSoftware" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer shrink-0" 
                    />
                    <span>{{ product.kitOptions.software.name }}</span>
                  </span>
                  <span class="text-neutral-muted shrink-0 pl-2 font-semibold">+{{ formatRub(product.kitOptions.software.price) }}</span>
                </label>

                <!-- Опция 2: Контроллер -->
                <label 
                  :class="[
                    'flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer select-none transition',
                    includeController ? 'border-brand bg-brand/5 text-neutral-dark font-medium' : 'border-neutral-border hover:border-neutral-muted bg-white text-neutral-dark'
                  ]"
                >
                  <span class="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      v-model="includeController" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer shrink-0" 
                    />
                    <span>{{ product.kitOptions.controller.name }}</span>
                  </span>
                  <span class="text-neutral-muted shrink-0 pl-2 font-semibold">+{{ formatRub(product.kitOptions.controller.price) }}</span>
                </label>
              </div>

              <!-- Бонусная карбоновая веха при покупке полного комплекта в одну строку на десктопе (12px) -->
              <div class="text-[12px] pt-0.5 leading-snug">
                <span v-if="isFullKit" class="text-brand font-medium inline-flex items-center gap-1.5 lg:whitespace-nowrap">
                  <svg class="w-3.5 h-3.5 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm-8 4h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9zm-1-4h18a1 1 0 011 1v3H2V9a1 1 0 011-1z"/>
                  </svg>
                  <span>✓ В комплекте: карбоновая веха 2.2 м в подарок</span>
                </span>
                <span v-else class="text-neutral-muted inline-flex items-center gap-1.5 lg:whitespace-nowrap">
                  <svg class="w-3.5 h-3.5 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm-8 4h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9zm-1-4h18a1 1 0 011 1v3H2V9a1 1 0 011-1z"/>
                  </svg>
                  <span>В комплекте (ПО + контроллер): карбоновая веха 2.2 м в подарок</span>
                </span>
              </div>
            </div>

            <!-- Stepper & Кнопка «В корзину» (Строго под описанием) -->
            <div class="space-y-3 pt-1">
              <div class="flex items-center gap-3">
                
                <!-- Quantity Stepper -->
                <div class="flex items-center border border-neutral-border rounded-lg bg-[#F4F6F9] px-2 h-11 shrink-0">
                  <button 
                    type="button"
                    @click="decrementQty"
                    class="w-7 h-7 flex items-center justify-center text-neutral-muted hover:text-neutral-dark rounded hover:bg-white text-base font-bold transition focus:outline-none cursor-pointer"
                    aria-label="Уменьшить количество"
                  >
                    -
                  </button>
                  <span class="px-3 text-sm font-bold text-neutral-dark min-w-[28px] text-center select-none">
                    {{ quantity }}
                  </span>
                  <button 
                    type="button"
                    @click="incrementQty"
                    class="w-7 h-7 flex items-center justify-center text-neutral-muted hover:text-neutral-dark rounded hover:bg-white text-base font-bold transition focus:outline-none cursor-pointer"
                    aria-label="Увеличить количество"
                  >
                    +
                  </button>
                </div>

                <!-- Primary CTA: Add to Cart -->
                <button 
                  type="button"
                  @click="handleAddToCart"
                  class="flex-1 h-11 px-6 rounded-lg bg-brand hover:bg-[#01556D] text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>Добавить в корзину</span>
                </button>

              </div>

              <!-- Или позвоните в отдел продаж (строго под кнопкой добавить в корзину) -->
              <div class="text-xs text-neutral-muted pt-0.5">
                <span>Или позвоните в отдел продаж: </span>
                <a href="tel:+79269730003" class="text-neutral-dark font-semibold hover:text-brand transition whitespace-nowrap">+7 (926) 973-00-03</a>
              </div>
            </div>

            <!-- Service Points: Размещены под кнопкой «В корзину», без карточек внутри карточки -->
            <div class="border-t border-neutral-border pt-5 divide-y divide-neutral-border space-y-3.5">
              
              <!-- 1. Быстрая доставка по всей России -->
              <div class="flex items-start gap-3 pt-3.5 first:pt-0">
                <svg class="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                <div>
                  <div class="text-xs font-bold text-neutral-dark">Быстрая доставка по всей России</div>
                  <div class="text-[11px] text-neutral-muted mt-0.5 leading-relaxed">
                    Осуществляем безопасную доставку в любую точку России и ближнего зарубежья. Условия доставки согласуем индивидуально.
                  </div>
                </div>
              </div>

              <!-- 2. Официальная гарантия и поддержка -->
              <div class="flex items-start gap-3 pt-3.5">
                <svg class="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <div>
                  <div class="text-xs font-bold text-neutral-dark">Официальная гарантия и поддержка</div>
                  <div class="text-[11px] text-neutral-muted mt-0.5 leading-relaxed">
                    Единственный официальный представитель APEKS в РФ. Поддержка высокой квалификации на всех этапах сотрудничества.
                  </div>
                </div>
              </div>

              <!-- 3. Честный Trade-in и консультация -->
              <div class="flex items-start gap-3 pt-3.5">
                <svg class="w-5 h-5 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                <div>
                  <div class="text-xs font-bold text-neutral-dark">Честный Trade-in и консультация</div>
                  <div class="text-[11px] text-neutral-muted mt-0.5 leading-relaxed">
                    Выгодные условия обмена старого оборудования на новое, экспертная помощь специалистов в подборе прибора под ваши задачи.
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>

    <!-- Technical Advantages: Технические преимущества (Только заголовки и текст, без картинок, выше характеристик) -->
    <section v-if="product.promoFeatures && product.promoFeatures.length" class="py-8 sm:py-10 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Заголовок «Технические преимущества» (одного размера с характеристиками) -->
        <div class="mb-6 sm:mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-xl sm:text-2xl font-bold text-neutral-dark">
            Технические преимущества
          </h2>
        </div>

        <!-- Сетка преимуществ: только заголовки и текст (без картинок) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 sm:gap-y-8">
          <div 
            v-for="(feature, idx) in product.promoFeatures" 
            :key="idx"
            class="space-y-1.5"
          >
            <h3 class="text-base sm:text-lg font-bold text-neutral-dark leading-snug">
              {{ feature.title }}
            </h3>
            <p class="text-xs sm:text-sm text-neutral-muted leading-relaxed">
              {{ feature.text }}
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- Technical Specifications: Технические характеристики (Статичный формат, заголовок одного размера) -->
    <section v-if="product.specs && product.specs.length" class="py-8 sm:py-10 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Заголовок «Технические характеристики» (одного размера с преимуществами) -->
        <div class="mb-6 sm:mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-xl sm:text-2xl font-bold text-neutral-dark">
            Технические характеристики
          </h2>
        </div>

        <!-- Статичная таблица параметров -->
        <div class="space-y-8">
          <div v-for="(group, gIdx) in product.specs" :key="gIdx">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-dark mb-2 pb-1 border-b border-neutral-border/60">
              {{ group.group }}
            </h3>
            <div class="divide-y divide-neutral-border/60">
              <div 
                v-for="(item, iIdx) in group.items" 
                :key="iIdx"
                class="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-xs"
              >
                <span class="text-neutral-muted sm:w-1/3">{{ item.name }}</span>
                <span class="font-medium text-neutral-dark sm:w-2/3">{{ item.val }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Brochure Download Section: Под блоком Технические характеристики на всю ширину сетки страницы -->
    <section v-if="product.brochureUrl" class="py-8 sm:py-10 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Заголовок того же размера, что и Технические характеристики -->
        <div class="mb-6 sm:mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-xl sm:text-2xl font-bold text-neutral-dark">
            Узнайте больше о технических возможностях устройства
          </h2>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p class="text-xs sm:text-sm text-neutral-muted max-w-2xl leading-relaxed">
            Скачайте официальный буклет APEKS с полными метрологическими характеристиками, схемами подключения и результатами полевых тестов.
          </p>
          <a 
            :href="product.brochureUrl" 
            :download="product.brochureFileName || 'brochure.pdf'"
            target="_blank" 
            rel="noopener"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white font-medium text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-xs"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Скачать брошюру</span>
          </a>
        </div>

      </div>
    </section>

    <!-- Related Products: «Другие модели из серии» (Чистый белый фон, без межблочного разделителя) -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="mb-8 pb-3 border-b border-neutral-border flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-neutral-dark">
            Другие модели из серии
          </h2>
          <router-link to="/catalog" class="text-xs sm:text-[13px] font-semibold text-brand hover:text-brand-dark transition">
            Весь каталог &rarr;
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="rel in relatedProducts.slice(0, 3)" 
            :key="rel.id"
            class="product-item bg-white rounded-lg border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer"
            @click="goToProduct(rel.slug)"
          >
            <div>
              <div class="h-44 flex items-center justify-center p-3 product-img-box rounded-md mb-4">
                <img 
                  :src="rel.mainImage" 
                  :alt="rel.title" 
                  class="max-h-36 w-auto object-contain group-hover:scale-105 transition duration-300"
                />
              </div>
              <div class="text-[11px] text-neutral-muted">Артикул: {{ rel.article }}</div>
              <h3 class="text-base font-bold text-neutral-dark mt-0.5 group-hover:text-brand transition">
                {{ rel.title }}
              </h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed line-clamp-2">
                {{ rel.shortDesc }}
              </p>
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-border">
              <div class="mb-3">
                <span class="text-base font-bold text-neutral-dark">{{ formatRub(rel.price) }}</span>
              </div>
              <button 
                type="button"
                @click.stop="goToProduct(rel.slug)"
                class="block w-full py-2.5 rounded bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition text-center cursor-pointer"
              >
                Подробнее
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>
