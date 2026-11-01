<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';

const router = useRouter();

function formatRub(num) {
  if (!num) return '0 ₽';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}

function toggleDropdown(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenuDrawer');
  if (menu) menu.classList.toggle('hidden');
}

function toggleMobileCatalog() {
  const dropdown = document.getElementById('mobileCatalogDropdown');
  const arrow = document.getElementById('mobileCatalogArrow');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
    if (arrow) {
      arrow.classList.toggle('rotate-180');
    }
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function scrollToContacts(subject) {
  const el = document.getElementById('contacts');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else {
    router.push({ path: '/', hash: '#contacts' });
  }
  if (subject) {
    setTimeout(() => {
      const input = document.getElementById('consultModelInput');
      if (input) {
        input.value = subject;
        input.focus();
      }
    }, 400);
  }
}

function filterStoreProducts(query) {
  const q = query.trim().toLowerCase();
  const items = document.querySelectorAll('.product-item');
  items.forEach(el => {
    const text = el.innerText.toLowerCase();
    if (!q || text.includes(q)) {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

onMounted(() => {
  window.formatRub = formatRub;
  window.toggleDropdown = toggleDropdown;
  window.toggleMobileMenu = toggleMobileMenu;
  window.toggleMobileCatalog = toggleMobileCatalog;
  window.closeModal = closeModal;
  window.scrollToContacts = scrollToContacts;
  window.filterStoreProducts = filterStoreProducts;
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Identical Global Header across all pages -->
    <AppHeader />

    <!-- Router View (HomeView, ProductView, etc.) -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Identical Global Footer across all pages -->
    <AppFooter />

    <!-- Slide-Over Mobile Menu Drawer -->
    <div id="mobileMenuDrawer" class="fixed inset-0 z-50 bg-black/50 flex justify-end hidden">
      <div class="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div class="p-4 border-b border-neutral-border flex items-center justify-between bg-neutral-bg">
            <span class="font-bold text-base text-neutral-dark">Меню</span>
            <button @click="toggleMobileMenu" class="text-neutral-muted hover:text-neutral-dark p-1 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="p-4 border-b border-neutral-border">
            <div class="relative flex items-center">
              <svg class="w-4 h-4 text-neutral-muted absolute left-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input type="text" @keyup="filterStoreProducts($event.target.value)" placeholder="Поиск по каталогу..." 
                class="w-full bg-[#F4F6F9] text-neutral-dark border border-neutral-border rounded-lg pl-10 pr-4 py-2 text-xs placeholder-neutral-muted focus:outline-none focus:border-brand">
            </div>
          </div>

          <div class="py-2">
            <div>
              <button type="button" @click="toggleMobileCatalog" class="w-full px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand flex items-center justify-between transition focus:outline-none cursor-pointer">
                <span>Каталог</span>
                <svg id="mobileCatalogArrow" class="w-4 h-4 text-neutral-muted transition-transform duration-200 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <div id="mobileCatalogDropdown" class="hidden pl-8 pr-4 py-1.5 space-y-0.5 bg-[#F8FAFC] border-y border-neutral-border/60">
                <router-link to="/" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-bold text-brand hover:text-brand-dark transition">Смотреть все</router-link>
                <router-link to="/product/ap40-laser-plus" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-medium text-neutral-dark hover:text-brand transition">ГНСС-приемники</router-link>
                <router-link to="/product/ap80-pro" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-medium text-neutral-dark hover:text-brand transition">База-ровер</router-link>
                <router-link to="/product/ap10" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-medium text-neutral-dark hover:text-brand transition">Контроллеры</router-link>
                <router-link to="/" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-medium text-neutral-dark hover:text-brand transition">Тахеометры</router-link>
                <router-link to="/" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-medium text-neutral-dark hover:text-brand transition">Радиосвязь</router-link>
                <router-link to="/" @click="toggleMobileMenu" class="block py-2 text-xs sm:text-sm font-medium text-neutral-dark hover:text-brand transition">Аксессуары</router-link>
              </div>
            </div>

            <router-link to="/" @click="toggleMobileMenu" class="block px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand transition">Акции</router-link>
            <router-link to="/" @click="toggleMobileMenu" class="block px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand transition">Услуги и сервис</router-link>
            <router-link to="/" @click="toggleMobileMenu" class="block px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand transition">Инструкции и ПО</router-link>
            <router-link to="/" @click="toggleMobileMenu" class="block px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand transition">Партнерам</router-link>
            <router-link to="/" @click="toggleMobileMenu" class="block px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand transition">О компании</router-link>
            <a href="#contacts" @click="toggleMobileMenu(); scrollToContacts('')" class="block px-4 py-2.5 text-sm font-semibold text-neutral-dark hover:text-brand transition">Контакты</a>
          </div>
        </div>

        <div class="p-4 border-t border-neutral-border bg-neutral-bg space-y-3">
          <a href="tel:+78005554025" class="block text-center py-2.5 px-4 rounded-lg bg-brand text-white font-bold text-sm hover:bg-brand-dark transition">
            8 (800) 555-40-25
          </a>
          <div class="text-[11px] text-neutral-muted text-center space-y-1">
            <div>Пн–Пт 09:00–18:00 (МСК)</div>
            <div><a href="mailto:info@apeksgnss.ru" class="text-brand hover:underline">info@apeksgnss.ru</a></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
