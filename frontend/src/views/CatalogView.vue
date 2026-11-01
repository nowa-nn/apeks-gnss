<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { products } from '../data/products.js';

const route = useRoute();
const router = useRouter();

// Categories
const categories = [
  { id: 'all', name: 'Все товары' },
  { id: 'gnss', name: 'ГНСС-приёмники', rawName: 'ГНСС-приёмники' },
  { id: 'controllers', name: 'Контроллеры и планшеты', rawName: 'Контроллеры и планшеты' },
  { id: 'software', name: 'Полевое ПО', rawName: 'Полевое ПО' },
  { id: 'radio', name: 'Радиосвязь', rawName: 'Радиосвязь' }
];

const selectedCategory = ref('all');
const searchQuery = ref('');
const priceMin = ref(null);
const priceMax = ref(null);
const selectedManufacturers = ref([]);
const filterLaser = ref(false);
const filterCamera = ref(false);
const filterImu = ref(false);
const filterRadio = ref(false);
const filterInStock = ref(false);
const sortBy = ref('default');

const showMobileFilters = ref(false);

// Initialize from route query
function initFromQuery() {
  if (route.query.category) {
    const qCat = String(route.query.category).toLowerCase().replace(/ё/g, 'е');
    const found = categories.find(c => 
      c.id.toLowerCase() === qCat || 
      (c.rawName && c.rawName.toLowerCase().replace(/ё/g, 'е') === qCat)
    );
    if (found) {
      selectedCategory.value = found.id;
    } else {
      selectedCategory.value = 'all';
    }
  } else {
    selectedCategory.value = 'all';
  }
  if (route.query.q) {
    searchQuery.value = route.query.q;
  }
}

function getManufacturerCount(brand) {
  return products.filter(p => p.manufacturer === brand).length;
}

onMounted(() => {
  initFromQuery();
});

watch(() => route.query, () => {
  initFromQuery();
});

function selectCategory(id) {
  selectedCategory.value = id;
  router.replace({
    path: '/catalog',
    query: {
      ...route.query,
      category: id === 'all' ? undefined : id
    }
  });
}

function toggleManufacturer(brand) {
  const idx = selectedManufacturers.value.indexOf(brand);
  if (idx === -1) {
    selectedManufacturers.value.push(brand);
  } else {
    selectedManufacturers.value.splice(idx, 1);
  }
}

function resetFilters() {
  selectedCategory.value = 'all';
  searchQuery.value = '';
  priceMin.value = null;
  priceMax.value = null;
  selectedManufacturers.value = [];
  filterLaser.value = false;
  filterCamera.value = false;
  filterImu.value = false;
  filterRadio.value = false;
  filterInStock.value = false;
  sortBy.value = 'default';
  router.replace({ path: '/catalog' });
}

const hasActiveFilters = computed(() => {
  return (
    selectedCategory.value !== 'all' ||
    searchQuery.value.trim() !== '' ||
    priceMin.value !== null && priceMin.value !== '' ||
    priceMax.value !== null && priceMax.value !== '' ||
    selectedManufacturers.value.length > 0 ||
    filterLaser.value ||
    filterCamera.value ||
    filterImu.value ||
    filterRadio.value ||
    filterInStock.value
  );
});

function getCategoryCount(catId) {
  if (catId === 'all') return products.length;
  const catObj = categories.find(c => c.id === catId);
  if (!catObj) return 0;
  return products.filter(p => p.category === catObj.rawName).length;
}

const filteredProducts = computed(() => {
  const list = products.filter(p => {
    // Category
    if (selectedCategory.value !== 'all') {
      const catObj = categories.find(c => c.id === selectedCategory.value);
      if (catObj && p.category !== catObj.rawName) return false;
    }

    // Search query
    if (searchQuery.value && searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchArticle = p.article && p.article.toLowerCase().includes(q);
      const matchDesc = p.shortDesc && p.shortDesc.toLowerCase().includes(q);
      if (!matchTitle && !matchArticle && !matchDesc) return false;
    }

    // Manufacturer
    if (selectedManufacturers.value.length > 0) {
      if (!selectedManufacturers.value.includes(p.manufacturer)) return false;
    }

    // Price
    if (priceMin.value !== null && priceMin.value !== '' && !isNaN(priceMin.value)) {
      if (p.price < Number(priceMin.value)) return false;
    }
    if (priceMax.value !== null && priceMax.value !== '' && !isNaN(priceMax.value)) {
      if (p.price > Number(priceMax.value)) return false;
    }

    // Feature flags
    if (filterLaser.value && !p.hasLaser) return false;
    if (filterCamera.value && !p.hasCamera) return false;
    if (filterImu.value && !p.hasImu) return false;
    if (filterRadio.value && !p.hasRadio) return false;
    if (filterInStock.value && !p.inStock) return false;

    return true;
  });

  if (sortBy.value === 'price_asc') return [...list].sort((a, b) => a.price - b.price);
  if (sortBy.value === 'price_desc') return [...list].sort((a, b) => b.price - a.price);
  if (sortBy.value === 'name_asc') return [...list].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  return list;
});

function formatRub(num) {
  if (!num) return 'По запросу';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}

function handleAddToCart(prod, event) {
  if (event) event.stopPropagation();
  if (window.addToCart) {
    window.addToCart(prod.id, prod.title, prod.price, prod.mainImage);
  }
}

function goToProduct(slug) {
  router.push(`/product/${slug}`);
}
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
        <span class="text-neutral-dark font-medium">Каталог оборудования</span>
      </nav>
    </div>

    <!-- Main Catalog Section -->
    <section class="pt-2 pb-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Header -->
        <div class="mb-6 sm:mb-8 pb-4 border-b border-neutral-border flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight">
              Каталог оборудования
            </h1>
            <p class="text-xs sm:text-sm text-neutral-muted mt-1">
              Профессиональное спутниковое, оптическое и геодезическое оборудование с официальной гарантией
            </p>
          </div>

          <!-- Quick Search in Catalog -->
          <div class="relative w-full md:w-72">
            <svg class="w-4 h-4 text-neutral-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск по названию или артикулу..."
              class="w-full h-9 pl-9 pr-3 text-xs bg-[#F4F6F9] hover:bg-[#EEF1F6] focus:bg-white border border-neutral-border focus:border-brand rounded-lg text-neutral-dark focus:outline-none transition"
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-neutral-dark text-xs p-1 cursor-pointer"
              title="Очистить"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Category Pills (Multi-row on mobile, no horizontal scroll) -->
        <div class="flex flex-wrap items-center gap-2 mb-6">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectCategory(cat.id)"
            :class="[
              'px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5',
              selectedCategory === cat.id
                ? 'bg-brand text-white shadow-xs'
                : 'bg-white border border-neutral-border text-neutral-dark hover:border-neutral-muted hover:bg-[#F8FAFC]'
            ]"
          >
            <span>{{ cat.name }}</span>
            <span :class="selectedCategory === cat.id ? 'opacity-80 text-[10px]' : 'text-neutral-muted text-[10px]'">
              ({{ getCategoryCount(cat.id) }})
            </span>
          </button>
        </div>

        <!-- Mobile Controls Bar: Filters Button + Sort Dropdown on the same horizontal row (No "Сортировка:" label) -->
        <div class="lg:hidden mb-4 flex items-center justify-between gap-3">
          <button 
            @click="showMobileFilters = !showMobileFilters" 
            class="inline-flex items-center gap-2 px-3.5 py-2 border border-neutral-border rounded-lg bg-white text-xs font-semibold text-neutral-dark hover:border-brand cursor-pointer shadow-xs"
          >
            <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span>Фильтры</span>
            <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-brand"></span>
          </button>

          <!-- Mobile Sort Dropdown (without "Сортировка:" text) -->
          <div class="relative">
            <select 
              v-model="sortBy"
              class="h-9 pl-3 pr-8 text-xs bg-white border border-neutral-border rounded-lg text-neutral-dark focus:border-brand focus:outline-none cursor-pointer appearance-none shadow-xs"
              aria-label="Сортировка товаров"
            >
              <option value="default">По умолчанию</option>
              <option value="price_asc">Сначала дешевле</option>
              <option value="price_desc">Сначала дороже</option>
              <option value="name_asc">По названию (А–Я)</option>
            </select>
            <svg class="w-3.5 h-3.5 text-neutral-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Main Layout: Sidebar (col-span-3) + Grid (col-span-9) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT SIDEBAR: FILTERS (Sticky on scroll) -->
          <aside 
            :class="[
              'lg:col-span-3 space-y-6 lg:sticky lg:top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar',
              showMobileFilters ? 'block' : 'hidden lg:block'
            ]"
          >
            <div class="p-5 border border-neutral-border rounded-xl bg-white space-y-6">
              
              <!-- Filter Header -->
              <div class="flex items-center justify-between pb-3 border-b border-neutral-border">
                <span class="text-sm font-bold text-neutral-dark">Фильтры</span>
                <button 
                  v-if="hasActiveFilters" 
                  @click="resetFilters" 
                  class="text-xs text-brand hover:underline font-medium cursor-pointer"
                >
                  Сбросить всё
                </button>
              </div>

              <!-- Price Filter -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-neutral-dark block">
                  Цена, ₽
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <input 
                    v-model.number="priceMin" 
                    type="number" 
                    placeholder="от 25 000" 
                    class="w-full h-8 px-2.5 text-xs bg-[#F4F6F9] border border-neutral-border rounded text-neutral-dark focus:bg-white focus:border-brand focus:outline-none transition"
                  />
                  <input 
                    v-model.number="priceMax" 
                    type="number" 
                    placeholder="до 250 000" 
                    class="w-full h-8 px-2.5 text-xs bg-[#F4F6F9] border border-neutral-border rounded text-neutral-dark focus:bg-white focus:border-brand focus:outline-none transition"
                  />
                </div>
              </div>

              <!-- Manufacturer Filter -->
              <div class="space-y-2.5 pt-2 border-t border-neutral-border/60">
                <span class="text-xs font-bold text-neutral-dark block">
                  Производитель
                </span>
                <div class="space-y-1.5">
                  <label class="flex items-center gap-2 text-xs text-neutral-dark cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      value="APEKS" 
                      :checked="selectedManufacturers.includes('APEKS')" 
                      @change="toggleManufacturer('APEKS')" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer"
                    />
                    <span>APEKS</span>
                    <span class="text-neutral-muted ml-auto text-[11px]">({{ getManufacturerCount('APEKS') }})</span>
                  </label>
                </div>
              </div>

              <!-- Technology & Hardware Options -->
              <div class="space-y-2.5 pt-2 border-t border-neutral-border/60">
                <span class="text-xs font-bold text-neutral-dark block">
                  Технологии (для GNSS)
                </span>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-xs text-neutral-dark cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      v-model="filterImu" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer"
                    />
                    <span>Компенсация наклона (IMU)</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs text-neutral-dark cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      v-model="filterLaser" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer"
                    />
                    <span>Лазерный дальномер</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs text-neutral-dark cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      v-model="filterCamera" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer"
                    />
                    <span>Камера (AR / фотограмметрия)</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs text-neutral-dark cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      v-model="filterRadio" 
                      class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer"
                    />
                    <span>УКВ радиомодем</span>
                  </label>
                </div>
              </div>

              <!-- Availability Filter -->
              <div class="space-y-2 pt-2 border-t border-neutral-border/60">
                <label class="flex items-center gap-2 text-xs text-neutral-dark cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    v-model="filterInStock" 
                    class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] cursor-pointer"
                  />
                  <span>Только в наличии</span>
                </label>
              </div>

              <!-- Reset Button at bottom of sidebar -->
              <div v-if="hasActiveFilters" class="pt-2">
                <button 
                  @click="resetFilters" 
                  class="w-full py-2 rounded-lg border border-neutral-border hover:border-neutral-muted text-xs text-neutral-dark font-medium transition cursor-pointer"
                >
                  Очистить фильтры
                </button>
              </div>

            </div>
          </aside>

          <!-- RIGHT MAIN: SORTING BAR & PRODUCTS GRID -->
          <main class="lg:col-span-9 space-y-5">
            
            <!-- Desktop Top Controls Bar: "Найдено: X товаров" + "Сортировка:" + Dropdown on the same horizontal row -->
            <div class="hidden lg:flex items-center justify-between gap-4 pb-3 border-b border-neutral-border/60">
              <div class="text-xs text-neutral-muted">
                Найдено: <b class="text-neutral-dark">{{ filteredProducts.length }}</b> товаров
              </div>

              <!-- Sorting Dropdown with Label -->
              <div class="flex items-center gap-2">
                <label for="catalogSortDesktop" class="text-xs text-neutral-muted whitespace-nowrap">Сортировка:</label>
                <div class="relative">
                  <select 
                    id="catalogSortDesktop" 
                    v-model="sortBy"
                    class="h-9 pl-3 pr-8 text-xs bg-white border border-neutral-border rounded-lg text-neutral-dark focus:border-brand focus:outline-none cursor-pointer appearance-none shadow-xs"
                  >
                    <option value="default">По умолчанию</option>
                    <option value="price_asc">Сначала дешевле</option>
                    <option value="price_desc">Сначала дороже</option>
                    <option value="name_asc">По названию (А–Я)</option>
                  </select>
                  <svg class="w-3.5 h-3.5 text-neutral-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Active Filter Badges Bar -->
            <div v-if="hasActiveFilters" class="flex items-center gap-2 flex-wrap text-xs">
              <span class="text-neutral-muted text-[11px]">Активные фильтры:</span>
              
              <span 
                v-if="selectedCategory !== 'all'" 
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>{{ categories.find(c => c.id === selectedCategory)?.name }}</span>
                <button @click="selectCategory('all')" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <span 
                v-for="brand in selectedManufacturers" 
                :key="brand"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>{{ brand }}</span>
                <button @click="toggleManufacturer(brand)" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <span 
                v-if="filterLaser" 
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>Лазер</span>
                <button @click="filterLaser = false" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <span 
                v-if="filterCamera" 
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>Камера</span>
                <button @click="filterCamera = false" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <span 
                v-if="filterImu" 
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>IMU</span>
                <button @click="filterImu = false" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <span 
                v-if="filterRadio" 
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>УКВ</span>
                <button @click="filterRadio = false" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <span 
                v-if="priceMin || priceMax" 
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F6F9] border border-neutral-border text-neutral-dark text-[11px]"
              >
                <span>Цена: {{ priceMin ? 'от ' + priceMin : '' }} {{ priceMax ? 'до ' + priceMax : '' }} ₽</span>
                <button @click="priceMin = null; priceMax = null" class="hover:text-brand cursor-pointer">×</button>
              </span>

              <button 
                @click="resetFilters" 
                class="text-brand hover:underline text-[11px] font-medium ml-1 cursor-pointer"
              >
                Сбросить все
              </button>
            </div>

            <!-- Products Grid -->
            <div 
              v-if="filteredProducts.length > 0" 
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div 
                v-for="prod in filteredProducts" 
                :key="prod.id"
                @click="goToProduct(prod.slug)"
                class="bg-white rounded-xl border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer"
              >
                <div>
                  
                  <!-- Image Box -->
                  <div class="h-44 sm:h-48 flex items-center justify-center p-3 product-img-box rounded-lg mb-3.5 relative overflow-hidden">
                    <img 
                      :src="prod.mainImage" 
                      :alt="prod.title" 
                      class="max-h-36 sm:max-h-40 w-auto object-contain group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>

                  <!-- Article (Без подложки) -->
                  <div class="text-[11px] text-neutral-muted">
                    Артикул: {{ prod.article }}
                  </div>

                  <!-- Title -->
                  <h2 class="text-sm sm:text-base font-bold text-neutral-dark group-hover:text-brand transition mt-1 line-clamp-2 leading-snug">
                    {{ prod.title }}
                  </h2>

                </div>

                <!-- Footer with Price & Button -->
                <div class="pt-3 mt-2.5 border-t border-neutral-border flex items-center justify-between gap-3">
                  <div>
                    <span class="text-base sm:text-lg font-bold text-neutral-dark block leading-none">
                      {{ formatRub(prod.price) }}
                    </span>
                    <span class="text-[10px] text-neutral-muted mt-0.5 block">
                      {{ prod.inStock ? 'В наличии' : 'Под заказ' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button 
                      type="button"
                      @click="handleAddToCart(prod, $event)"
                      class="h-9 px-3 rounded-lg bg-[#016C8A] hover:bg-[#01556D] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="В корзину"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <span class="hidden sm:inline">В корзину</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-else 
              class="py-16 text-center border border-dashed border-neutral-border rounded-xl space-y-3"
            >
              <div class="w-12 h-12 mx-auto rounded-full bg-[#F4F6F9] flex items-center justify-center text-neutral-muted">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 class="text-base font-bold text-neutral-dark">
                Товары не найдены
              </h3>
              <p class="text-xs text-neutral-muted max-w-sm mx-auto">
                По заданным параметрам ничего не найдено. Попробуйте изменить параметры отбора или сбросить фильтры.
              </p>
              <button 
                @click="resetFilters" 
                class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer"
              >
                Сбросить фильтры
              </button>
            </div>

          </main>

        </div>

      </div>
    </section>

  </div>
</template>
