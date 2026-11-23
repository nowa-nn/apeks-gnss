<script setup>
import { ref, onMounted } from 'vue';
import { instructions } from '../data/instructions.js';
import { resolveAsset } from '../utils/assets.js';

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const downloadedItem = ref(null);
const showNotification = ref(false);

function triggerDownload(item) {
  downloadedItem.value = item;
  showNotification.value = true;
  
  // Use anchor download
  const link = document.createElement('a');
  link.href = resolveAsset(item.downloadUrl);
  link.download = item.fileName || 'document.pdf';
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    showNotification.value = false;
  }, 4000);
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-3 bg-white">
      <nav class="flex items-center gap-2 text-xs text-neutral-muted flex-wrap">
        <router-link to="/" class="hover:text-brand transition flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Главная</span>
        </router-link>
        <span class="text-neutral-300">/</span>
        <span class="text-neutral-dark font-medium">Инструкции и программное обеспечение</span>
      </nav>
    </div>

    <!-- Main Content -->
    <section class="pt-2 pb-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Header -->
        <div class="mb-8 pb-4 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight">
            Инструкции и программное обеспечение APEKS
          </h1>
          <p class="text-xs sm:text-sm text-neutral-muted mt-2 max-w-3xl leading-relaxed">
            Официальная техническая документация, руководства пользователя, установочные пакеты полевого ПО и актуальные калибровочные файлы для оборудования APEKS GNSS.
          </p>
        </div>

        <!-- Download Notification Toast -->
        <div 
          v-if="showNotification" 
          class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-4 transition-all"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>
              Загрузка файла <strong class="font-semibold">{{ downloadedItem?.title }}</strong> началась.
            </span>
          </div>
          <button @click="showNotification = false" class="text-emerald-600 hover:text-emerald-900 font-bold p-1">
            ✕
          </button>
        </div>

        <!-- Instructions Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div 
            v-for="item in instructions" 
            :key="item.id"
            class="p-6 rounded-xl border border-neutral-border bg-white flex flex-col justify-between hover:border-brand transition shadow-xs"
          >
            <div>
              <!-- Category and Format Row -->
              <div class="mb-3">
                <span class="text-[11px] font-medium text-neutral-muted uppercase tracking-wider">
                  {{ item.category }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="text-base sm:text-lg font-bold text-neutral-dark mb-2.5">
                {{ item.title }}
              </h2>

              <!-- Description -->
              <p class="text-xs text-neutral-muted leading-relaxed mb-6">
                {{ item.description }}
              </p>
            </div>

            <!-- Card Bottom Meta & Download Button -->
            <div class="pt-4 border-t border-neutral-border/60 space-y-3.5">
              <div class="flex items-center justify-between text-[11px] text-neutral-muted">
                <span>Версия: <strong class="text-neutral-dark font-medium">{{ item.version }}</strong></span>
                <span>{{ item.fileSize }}</span>
              </div>

              <button 
                type="button"
                @click="triggerDownload(item)"
                class="w-full py-2.5 px-4 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span>Скачать</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
