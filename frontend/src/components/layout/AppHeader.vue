<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function toggleDropdown(id) {
  if (window.toggleDropdown) window.toggleDropdown(id);
}

function toggleMobileMenu() {
  if (window.toggleMobileMenu) window.toggleMobileMenu();
}

function scrollToContacts(subject) {
  if (window.scrollToContacts) window.scrollToContacts(subject);
}

function filterStoreProducts(val) {
  if (window.filterStoreProducts) window.filterStoreProducts(val);
}

function handleSearch(e) {
  const val = e.target.value.trim();
  if (val) {
    router.push({ path: '/catalog', query: { q: val } });
  } else {
    router.push({ path: '/catalog' });
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
    <!-- Top Layer: Clean white with company info, search & contacts -->
    <div class="bg-white border-b border-neutral-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-6">
        
        <!-- Brand Logo with animated SVG linking to Home -->
        <router-link to="/" class="brand flex items-center shrink-0 nav-logo-anim cursor-pointer" aria-label="APEKS GNSS">
          <span class="brand-mark brand-mark--svg" role="img" aria-label="APEKS">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 96" class="svg-anim-svg h-7 sm:h-8 w-auto" role="img" focusable="false" aria-label="APEKS">
              <title>APEKS</title>
              <g class="svg-p letter l1" style="--i:0"><path class="letter l1" fill="#016C8A" fill-rule="evenodd" d="M1.08 94.84 C0.99 94.62 1.05 94.25 1.21 94.03 C1.37 93.81 1.56 93.46 1.64 93.25 C1.71 93.04 1.99 92.42 2.24 91.88 C4.11 87.88 5.00 85.95 5.00 85.88 C5.00 85.80 5.74 84.18 8.17 79.00 C8.65 77.97 9.33 76.51 9.68 75.75 C10.02 74.99 10.68 73.59 11.14 72.62 C13.10 68.47 14.31 65.87 16.12 61.88 C17.18 59.54 18.61 56.44 19.30 55.00 C19.98 53.56 20.89 51.64 21.30 50.75 C21.72 49.86 22.42 48.34 22.87 47.38 C24.84 43.16 26.44 39.70 27.24 37.88 C28.10 35.94 29.88 32.10 32.01 27.62 C32.92 25.71 33.30 24.89 35.85 19.42 C36.48 18.07 37.00 16.92 37.00 16.87 C37.00 16.80 37.67 15.33 40.11 10.12 C40.56 9.16 41.29 7.59 41.74 6.62 C42.19 5.66 42.88 4.21 43.28 3.40 C43.68 2.58 44.00 1.82 44.00 1.70 C44.00 1.58 44.25 1.15 44.55 0.74 L45.09 -0.00 L60.49 -0.00 L75.88 0.00 L76.18 0.56 C76.64 1.46 77.37 2.99 78.23 4.88 C78.67 5.84 79.14 6.83 79.28 7.08 C79.41 7.33 79.96 8.51 80.48 9.70 C81.81 12.72 83.71 16.80 86.31 22.25 C87.06 23.83 87.91 25.63 88.19 26.25 C88.46 26.87 89.11 28.27 89.63 29.38 C90.14 30.48 90.99 32.35 91.52 33.55 C92.04 34.74 92.59 35.92 92.73 36.17 C92.87 36.42 93.34 37.41 93.77 38.38 C94.20 39.34 95.01 41.08 95.55 42.25 C97.68 46.77 98.00 47.45 99.08 49.75 C99.70 51.06 100.79 53.42 101.51 55.00 C102.22 56.58 103.14 58.61 103.55 59.50 C103.96 60.39 104.52 61.63 104.79 62.25 C105.06 62.87 105.39 63.54 105.52 63.75 C105.65 63.96 105.82 64.29 105.89 64.50 C106.09 65.02 107.03 67.05 107.29 67.50 C107.41 67.71 107.63 68.16 107.78 68.50 C108.12 69.25 109.13 71.45 110.31 74.00 C110.79 75.03 111.36 76.27 111.58 76.76 C113.27 80.54 114.85 83.96 116.12 86.62 C118.06 90.71 119.00 92.75 119.00 92.88 C119.00 92.96 119.24 93.35 119.54 93.75 C119.99 94.36 120.03 94.54 119.75 94.87 C119.46 95.23 118.16 95.26 108.02 95.20 L96.62 95.12 L93.88 92.41 C87.56 86.17 80.20 81.94 72.26 79.97 C63.54 77.81 54.49 78.07 46.00 80.72 C43.14 81.61 42.30 81.95 39.38 83.41 C36.65 84.78 36.59 84.81 34.28 86.38 C33.27 87.06 32.18 87.80 31.86 88.01 C30.68 88.80 28.32 90.92 26.30 92.99 L24.23 95.12 L12.73 95.19 C2.30 95.24 1.22 95.21 1.08 94.84 Z M82.00 61.50 C82.00 61.26 81.83 60.92 81.62 60.75 C81.42 60.58 81.25 60.30 81.25 60.13 C81.25 59.85 80.68 58.57 77.96 52.75 C76.63 49.92 75.65 47.83 74.77 45.94 C74.37 45.08 73.45 43.14 72.74 41.62 C72.02 40.11 71.01 37.92 70.50 36.75 C69.98 35.58 69.16 33.78 68.68 32.75 C68.20 31.72 67.50 30.20 67.12 29.38 C66.75 28.55 65.88 26.69 65.19 25.25 C63.51 21.72 62.04 18.57 61.56 17.50 C61.35 17.02 61.10 16.46 61.00 16.25 C60.90 16.04 60.63 15.88 60.39 15.88 C59.99 15.88 59.43 16.96 56.21 24.00 C55.92 24.62 55.27 26.02 54.75 27.12 C53.07 30.67 51.22 34.60 50.76 35.62 C50.51 36.17 49.84 37.61 49.28 38.81 C48.71 40.01 48.25 41.05 48.25 41.12 C48.25 41.19 47.76 42.29 47.15 43.56 C46.55 44.83 45.70 46.66 45.25 47.62 C44.05 50.26 43.04 52.40 41.99 54.62 C39.26 60.38 38.75 61.50 38.75 61.76 C38.75 62.13 39.68 61.98 42.62 61.14 C49.22 59.26 57.34 58.46 64.82 58.96 C70.42 59.33 77.38 60.59 80.23 61.75 C81.46 62.25 82.00 62.17 82.00 61.50 Z"></path></g>
              <g class="svg-p letter l2" style="--i:1"><path class="letter l2" fill="#0B2530" fill-rule="evenodd" d="M123.69 94.98 C123.27 94.74 123.25 92.23 123.25 47.93 C123.26 22.19 123.32 0.87 123.41 0.56 L123.56 0.00 L150.85 0.00 C174.63 0.00 178.21 0.05 178.67 0.37 C178.96 0.58 179.92 0.85 180.79 0.97 C186.64 1.81 194.04 6.21 198.25 11.34 C200.01 13.49 202.00 16.42 202.00 16.86 C202.00 17.04 202.22 17.47 202.50 17.82 C202.78 18.17 203.00 18.58 203.00 18.74 C203.00 18.90 203.21 19.44 203.47 19.95 C204.88 22.70 205.75 27.37 205.74 32.00 C205.73 33.99 205.63 36.13 205.51 36.75 C204.96 39.74 204.70 40.79 204.37 41.43 C204.17 41.81 204.00 42.31 204.00 42.53 C204.00 43.62 201.18 48.74 199.12 51.38 C194.97 56.72 189.27 60.54 182.62 62.46 C179.25 63.43 177.73 63.50 160.65 63.50 C145.29 63.50 144.04 63.53 143.89 63.92 C143.80 64.16 143.73 71.13 143.73 79.42 L143.73 94.48 L143.19 94.87 C142.72 95.19 141.30 95.25 133.38 95.24 C127.56 95.24 123.96 95.14 123.69 94.98 Z M164.12 44.18 L176.88 44.12 L178.25 43.51 C181.09 42.27 183.37 40.29 184.81 37.83 C185.94 35.89 186.35 33.84 186.19 30.87 C186.08 28.77 185.96 28.27 185.17 26.68 C183.49 23.33 179.87 20.38 176.86 19.92 C175.24 19.67 144.20 19.70 143.95 19.95 C143.82 20.08 143.72 25.30 143.72 32.02 C143.72 41.90 143.78 43.90 144.07 44.12 C144.28 44.27 145.81 44.35 147.90 44.31 C149.81 44.28 157.11 44.22 164.12 44.18 Z"></path></g>
              <g class="svg-p letter l3" style="--i:2"><path class="letter l3" fill="#0B2530" fill-rule="evenodd" d="M212.81 94.99 L212.25 94.77 L212.25 48.16 C212.25 22.53 212.32 1.21 212.41 0.78 L212.56 0.00 L249.28 0.00 L286.01 0.00 L285.94 9.81 L285.88 19.62 L259.15 19.69 C239.91 19.73 232.33 19.83 232.09 20.03 C231.82 20.26 231.75 21.98 231.75 28.76 C231.75 36.14 231.80 37.26 232.15 37.61 C232.50 37.97 235.20 38.01 259.18 38.00 C273.83 37.99 285.86 38.02 285.90 38.07 C286.06 38.22 286.03 56.99 285.88 57.24 C285.78 57.40 276.45 57.49 259.08 57.49 C239.48 57.49 232.35 57.57 232.09 57.78 C231.81 58.01 231.75 59.63 231.75 66.42 C231.75 71.71 231.85 74.96 232.01 75.27 C232.26 75.74 232.83 75.75 258.99 75.75 C275.59 75.75 285.78 75.84 285.87 75.99 C285.95 76.12 286.02 80.41 286.02 85.53 C286.03 92.93 285.96 94.87 285.70 95.03 C285.25 95.32 213.52 95.28 212.81 94.99 Z"></path></g>
              <g class="svg-p letter l4" style="--i:3"><path class="letter l4" fill="#0B2530" fill-rule="evenodd" d="M297.19 94.98 C296.77 94.74 296.75 92.23 296.75 47.93 C296.76 22.19 296.82 0.87 296.91 0.56 L297.06 0.00 L307.00 0.00 L316.94 0.00 L317.09 0.78 C317.18 1.20 317.25 22.48 317.25 48.06 C317.25 81.99 317.17 94.67 316.97 94.91 C316.74 95.19 314.85 95.25 307.16 95.24 C301.15 95.24 297.46 95.14 297.19 94.98 Z M351.66 94.43 C351.03 93.76 348.32 90.06 346.00 86.67 C345.79 86.37 343.94 83.79 341.88 80.94 C339.81 78.08 337.00 74.17 335.62 72.24 C334.25 70.31 332.68 68.12 332.12 67.38 C331.57 66.63 330.87 65.65 330.55 65.20 C329.95 64.33 329.16 63.22 326.54 59.58 C325.67 58.37 323.63 55.52 322.00 53.25 C320.37 50.98 318.81 48.83 318.52 48.46 C317.52 47.18 317.04 48.00 324.74 37.96 C326.04 36.26 327.95 33.79 328.99 32.47 C330.83 30.11 333.31 26.91 339.12 19.38 C340.71 17.31 342.18 15.42 342.39 15.17 C342.77 14.72 345.07 11.73 348.40 7.35 C349.35 6.10 351.02 3.94 352.12 2.55 L354.12 0.01 L367.31 0.01 L380.49 0.00 L380.24 0.66 C380.10 1.02 378.33 3.28 376.31 5.68 C374.28 8.08 371.89 10.91 371.00 11.98 C367.53 16.12 365.53 18.48 363.25 21.15 C361.94 22.68 359.81 25.20 358.50 26.76 C357.19 28.32 355.68 30.12 355.12 30.76 C354.57 31.40 353.62 32.53 353.00 33.26 C352.38 33.99 351.76 34.70 351.62 34.85 C351.48 35.00 349.69 37.15 347.63 39.62 C345.58 42.10 343.36 44.71 342.70 45.42 C342.04 46.14 341.50 46.92 341.50 47.17 C341.50 47.42 344.06 50.85 347.19 54.80 C350.32 58.74 356.31 66.32 360.50 71.64 C374.24 89.06 378.08 93.87 378.29 93.96 C378.65 94.10 378.52 94.94 378.10 95.10 C377.89 95.18 372.03 95.25 365.08 95.25 L352.45 95.25 L351.66 94.43 Z"></path></g>
              <g class="svg-p letter l5" style="--i:4"><path class="letter l5" fill="#0B2530" fill-rule="evenodd" d="M388.63 94.75 C388.42 94.42 388.43 76.47 388.64 75.93 C388.73 75.69 388.99 75.50 389.21 75.50 C389.44 75.49 400.99 75.49 414.88 75.49 C444.57 75.49 443.37 75.58 446.46 73.25 C447.32 72.60 449.00 70.45 449.00 69.99 C449.00 69.84 449.18 69.38 449.39 68.96 C449.93 67.92 449.90 65.43 449.32 63.88 C448.38 61.33 447.02 59.80 444.50 58.47 L443.38 57.88 L428.25 57.73 C414.13 57.59 412.97 57.55 410.88 57.07 C405.07 55.73 400.93 53.44 396.75 49.25 C393.22 45.73 391.05 42.22 389.66 37.82 C388.76 34.97 388.52 33.17 388.49 29.25 C388.46 23.97 389.21 20.37 391.17 16.38 C393.20 12.25 397.07 7.78 400.75 5.32 C403.89 3.22 409.20 1.01 411.13 1.00 C411.54 1.00 412.66 0.78 413.62 0.50 C415.33 0.01 416.12 0.00 442.69 0.00 L470.00 0.00 L470.00 9.99 L470.00 19.99 L442.69 20.06 L415.38 20.13 L414.00 20.71 C410.42 22.23 408.26 25.38 408.25 29.12 C408.25 32.57 410.59 35.91 413.95 37.23 C415.22 37.73 415.70 37.75 427.95 37.76 C441.96 37.76 445.57 37.95 448.79 38.85 C450.65 39.37 453.98 40.82 455.62 41.83 C457.68 43.09 458.64 43.85 460.78 45.93 C463.92 48.98 465.75 51.64 467.64 55.88 C468.42 57.64 469.50 62.63 469.50 64.49 C469.50 64.89 469.62 65.30 469.77 65.39 C470.05 65.56 470.02 65.90 469.52 68.88 C469.38 69.70 469.16 71.11 469.04 72.00 C468.78 73.84 468.19 75.89 467.48 77.40 C467.22 77.97 467.00 78.49 467.00 78.57 C467.00 78.95 464.74 82.61 463.47 84.28 C459.78 89.14 454.11 92.73 447.50 94.40 L445.12 94.99 L416.95 95.00 C398.62 95.00 388.73 94.91 388.63 94.75 Z"></path></g>
            </svg>
          </span>
        </router-link>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-md lg:max-w-lg xl:max-w-xl hidden md:block">
          <div class="relative flex items-center">
            <svg class="w-4 h-4 text-neutral-muted absolute left-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input 
              type="text" 
              id="storeSearch" 
              @keyup="filterStoreProducts($event.target.value)" 
              @keydown.enter="handleSearch($event)"
              placeholder="Поиск по каталогу оборудования..." 
              class="w-full h-10 bg-[#F4F6F9] hover:bg-[#EEF1F6] focus:bg-white text-neutral-dark border border-neutral-border focus:border-brand rounded-lg pl-11 pr-4 text-xs sm:text-[13px] placeholder-neutral-muted focus:outline-none transition"
            />
          </div>
        </div>

        <!-- Right Side: 'Заказать звонок', Phone + Email & Mobile Burger -->
        <div class="flex items-center gap-3 sm:gap-4 lg:gap-5 shrink-0">
          
          <button 
            @click="scrollToContacts('Заказ обратного звонка')" 
            class="hidden md:inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#016C8A] hover:bg-[#01556D] text-white border border-[#016C8A] hover:border-[#01556D] text-xs sm:text-[13px] font-semibold transition whitespace-nowrap shadow-xs cursor-pointer"
          >
            Заказать звонок
          </button>

          <!-- Direct Phone with Email underneath -->
          <div class="hidden md:flex flex-col items-end justify-center">
            <a href="tel:+78005554025" class="text-neutral-dark font-bold text-sm lg:text-[15px] hover:text-brand transition whitespace-nowrap leading-tight">
              8 (800) 555-40-25
            </a>
            <a href="mailto:info@apeksgnss.ru" class="text-[11px] text-neutral-muted hover:text-brand transition whitespace-nowrap mt-0.5 leading-tight">
              info@apeksgnss.ru
            </a>
          </div>

          <!-- Cart Icon (Without drawer menu) -->
          <button 
            @click="scrollToContacts('Оформление заказа')" 
            class="text-neutral-dark hover:text-brand transition p-2 focus:outline-none rounded-lg hover:bg-neutral-bg cursor-pointer" 
            title="Корзина"
            aria-label="Корзина"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </button>

          <!-- Burger Menu Button -->
          <button 
            @click="toggleMobileMenu" 
            class="md:hidden text-neutral-dark hover:text-brand p-2 focus:outline-none transition rounded-lg hover:bg-neutral-bg cursor-pointer" 
            aria-label="Меню"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

        </div>

      </div>
    </div>

    <!-- Bottom Layer: Desktop Navigation -->
    <nav class="hidden md:block bg-white border-b border-neutral-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-10">
        
        <!-- Left: 'Каталог' button -->
        <div class="relative">
          <button 
            @click="toggleDropdown('catalogDropdown')" 
            class="flex items-center gap-2.5 font-bold text-sm text-neutral-dark hover:text-brand transition py-1 focus:outline-none cursor-pointer"
          >
            <svg class="w-5 h-5 text-[#016C8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span class="text-neutral-dark hover:text-brand">Каталог</span>
          </button>

          <!-- Dropdown Menu -->
          <div id="catalogDropdown" class="hidden absolute left-0 top-full mt-1 w-64 bg-white text-neutral-dark rounded-md shadow-xl border border-neutral-border py-2 z-50">
            <router-link to="/catalog?category=gnss" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2.5 text-sm font-medium hover:bg-brand-light hover:text-brand">ГНСС-приёмники RTK</router-link>
            <router-link to="/catalog?category=controllers" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2.5 text-sm font-medium hover:bg-brand-light hover:text-brand">Полевые контроллеры и планшеты</router-link>
            <router-link to="/catalog?category=total-stations" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2.5 text-sm font-medium hover:bg-brand-light hover:text-brand">Электронные тахеометры</router-link>
            <router-link to="/catalog?category=levels" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2.5 text-sm font-medium hover:bg-brand-light hover:text-brand">Оптические нивелиры</router-link>
            <router-link to="/catalog?category=radio" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2.5 text-sm font-medium hover:bg-brand-light hover:text-brand">Радиосвязь и модемы</router-link>
            <router-link to="/catalog?category=sensors" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2.5 text-sm font-medium hover:bg-brand-light hover:text-brand">GNSS-датчики и антенны</router-link>
            <div class="border-t border-neutral-border my-1"></div>
            <router-link to="/catalog" @click="toggleDropdown('catalogDropdown')" class="block px-4 py-2 text-xs font-bold text-brand hover:bg-brand-light">Весь каталог оборудования &rarr;</router-link>
          </div>
        </div>

        <!-- Right: Menu links -->
        <div class="flex items-center gap-6 sm:gap-8 text-xs sm:text-[13px] font-semibold text-neutral-dark overflow-x-auto no-scrollbar py-1">
          <router-link to="/" class="hover:text-brand transition whitespace-nowrap">Акции</router-link>
          <router-link to="/" class="hover:text-brand transition whitespace-nowrap">Услуги</router-link>
          <router-link to="/" class="hover:text-brand transition whitespace-nowrap">Инструкции</router-link>
          <router-link to="/" class="hover:text-brand transition whitespace-nowrap">Партнерам</router-link>
          <router-link to="/" class="hover:text-brand transition whitespace-nowrap">О компании</router-link>
          <a href="#contacts" @click="scrollToContacts('')" class="hover:text-brand transition whitespace-nowrap">Контакты</a>
        </div>

      </div>
    </nav>
  </header>
</template>
