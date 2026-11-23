<script setup>
import { computed, onMounted } from 'vue';
import { resolveAsset } from '../utils/assets.js';

const props = defineProps({
  // Allows direct injection of page data from Directus CMS API or parent view
  page: {
    type: Object,
    default: null
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Helper to resolve media URLs: handles Directus file UUIDs, absolute URLs, or local assets
function resolveMedia(media) {
  if (!media) return '';
  if (typeof media === 'object' && media.id) {
    return `/assets/${media.id}`;
  }
  return resolveAsset(media);
}

// File download action
function downloadFile(file) {
  const link = document.createElement('a');
  link.href = resolveMedia(file.url || file.file);
  link.download = file.filename || file.name || 'document';
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Default page data structure, mapped 1-to-1 to Directus collections / M2A blocks
const defaultPage = {
  title: 'Универсальный шаблон страницы APEKS',
  subtitle: 'Модульный шаблон для публикации тематических статей, обзоров технологий, инструкций и корпоративных материалов через Directus CMS.',
  breadcrumbs: [
    { label: 'Главная', path: '/' },
    { label: 'Шаблон страницы', path: '' }
  ],
  // Standard Directus Block types: 'text' (WYSIWYG/HTML), 'image', 'video', 'downloads'
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      heading: 'Введение в технологию и обзор решения',
      content: `<p class="text-base sm:text-lg font-medium text-neutral-dark mb-4">
        Современные геодезические задачи требуют высокой скорости сбора пространственных данных при сохранении миллиметровой точности. В данном материале представлены ключевые методики применения оборудования APEKS.
      </p>
      <p class="mb-3.5">
        Спутниковые геодезические приемники и смарт-тахеометры APEKS разрабатываются с учетом жестких условий эксплуатации на строительных площадках и в полевых изысканиях. Использование многочастотных платформ GNSS (1408 каналов) позволяет уверенно работать в условиях плотной городской застройки и залесенной местности.
      </p>
      <p class="mb-3.5">
        Интеграция оптических и спутниковых измерений в едином полевом программном обеспечении ApekSurv обеспечивает сквозную передачу данных в CAD- и GIS-системы без потери атрибутивной информации.
      </p>
      <blockquote class="my-5 p-4 sm:p-5 border-l-4 border-brand bg-[#F8FAFC] rounded-r-lg font-medium text-neutral-dark italic">
        «Точность и надежность геодезического инструмента — основа безопасности любого строительного объекта.»
      </blockquote>`
    },
    {
      id: 'block-2',
      type: 'image',
      src: 'assets/banner-1-2-1.webp',
      alt: 'Спутниковое геодезическое оборудование APEKS в полевых условиях',
      caption: 'Рис. 1 — Полевые испытания флагманского GNSS-приемника APEKS на объекте инфраструктурного строительства.'
    },
    {
      id: 'block-3',
      type: 'text',
      heading: 'Ключевые эксплуатационные преимущества',
      content: `<p class="mb-3.5">
        Благодаря встроенным инерциальным модулям компенсации наклона вехи (IMU до 60°) геодезист может выполнять съемку труднодоступных точек — углов зданий, краев глубоких котлованов и подземных коммуникаций — без необходимости строгого удержания вехи по уровню.
      </p>
      <p class="mb-3.5">
        Встроенные радиомодемы мощностью до 2 Вт в сочетании с внешними модемами ADL35 (до 35 Вт) гарантируют стабильный УКВ-канал передачи поправок на дистанциях до 15 км в условиях отсутствия сотовой связи.
      </p>`
    },
    {
      id: 'block-4',
      type: 'video',
      heading: 'Видеоматериал: Практика работы с оборудованием',
      title: 'Полевой видеообзор и демонстрация лазерного центрирования',
      description: 'Наглядная демонстрация работы лазерного модуля и съемки фасадов зданий с компенсацией угла наклона вехи.',
      poster: 'assets/video_preview_lineup.jpg',
      videoUrl: '',
      caption: 'Видеозапись полевого тестирования на полигоне'
    },
    {
      id: 'block-5',
      type: 'downloads',
      heading: 'Материалы и файлы для скачивания',
      description: 'Официальные методические указания, технические спецификации и шаблоны отчетов.',
      files: [
        {
          id: 'file-1',
          name: 'Методика выполнения спутниковых измерений в RTK',
          format: 'PDF',
          size: '2,4 МБ',
          url: 'assets/AM02_брошюра_RU.pdf',
          filename: 'Methodology_RTK_Survey_APEKS.pdf'
        },
        {
          id: 'file-2',
          name: 'Инструкция по настройке базовых станций и радиоканала ADL35',
          format: 'PDF',
          size: '3,7 МБ',
          url: 'assets/AM02i_брошюра_RU.pdf',
          filename: 'ADL35_Setup_Guide_APEKS.pdf'
        }
      ]
    }
  ]
};

const activePage = computed(() => props.page || defaultPage);
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- Breadcrumbs (Max-w-7xl — одинаковая ширина с сеткой всего сайта) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-3 bg-white">
      <nav class="flex items-center gap-2 text-xs text-neutral-muted flex-wrap">
        <router-link to="/" class="hover:text-brand transition flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Главная</span>
        </router-link>
        <span class="text-neutral-300">/</span>
        <span class="text-neutral-dark font-medium">{{ activePage.title }}</span>
      </nav>
    </div>

    <!-- Main Content (Max-w-7xl — одинаковая ширина с сеткой всего сайта) -->
    <article class="pt-2 pb-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Header Block -->
        <header class="mb-10 pb-5 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-4xl font-extrabold text-[#0B2530] tracking-tight leading-tight">
            {{ activePage.title }}
          </h1>
          <p v-if="activePage.subtitle" class="text-sm sm:text-base text-neutral-muted mt-3 leading-relaxed">
            {{ activePage.subtitle }}
          </p>
        </header>

        <!-- Dynamic Content Blocks (Directus M2A / JSON) -->
        <div class="space-y-12 w-full">
          
          <template v-for="block in activePage.blocks" :key="block.id">
            
            <!-- 1. TEXT BLOCK (Прямой вывод HTML из Directus WYSIWYG) -->
            <section v-if="block.type === 'text'" class="space-y-3">
              <h2 v-if="block.heading" class="text-xl sm:text-2xl font-bold text-neutral-dark mb-3">
                {{ block.heading }}
              </h2>

              <div 
                v-if="block.content" 
                v-html="block.content"
                class="text-xs sm:text-sm text-neutral-muted leading-relaxed prose prose-neutral max-w-none"
              ></div>
            </section>

            <!-- 2. IMAGE BLOCK -->
            <section v-else-if="block.type === 'image'" class="space-y-2.5">
              <div class="rounded-xl overflow-hidden border border-neutral-border bg-white shadow-xs">
                <img 
                  :src="resolveMedia(block.src || block.image)" 
                  :alt="block.alt || activePage.title"
                  class="w-full h-auto max-h-[520px] object-cover"
                />
              </div>
              <p v-if="block.caption" class="text-[11px] sm:text-xs text-neutral-muted text-center italic">
                {{ block.caption }}
              </p>
            </section>

            <!-- 3. VIDEO BLOCK -->
            <section v-else-if="block.type === 'video'" class="space-y-3">
              <h2 v-if="block.heading" class="text-xl sm:text-2xl font-bold text-neutral-dark">
                {{ block.heading }}
              </h2>

              <div class="relative rounded-xl overflow-hidden border border-neutral-border bg-neutral-900 shadow-xs aspect-video flex items-center justify-center group">
                <img 
                  v-if="block.poster"
                  :src="resolveMedia(block.poster)" 
                  :alt="block.title"
                  class="w-full h-full object-cover opacity-80"
                />
                
                <!-- Play Overlay Button -->
                <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/30">
                  <div class="w-16 h-16 rounded-full bg-white/95 text-brand flex items-center justify-center shadow-lg transition duration-200">
                    <svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <h3 v-if="block.title" class="text-white text-base sm:text-lg font-bold mt-4 max-w-lg drop-shadow">
                    {{ block.title }}
                  </h3>
                  <p v-if="block.description" class="text-white/80 text-xs mt-1 max-w-md hidden sm:block drop-shadow">
                    {{ block.description }}
                  </p>
                </div>
              </div>

              <p v-if="block.caption" class="text-[11px] sm:text-xs text-neutral-muted text-center italic">
                {{ block.caption }}
              </p>
            </section>

            <!-- 4. DOWNLOADS BLOCK -->
            <section v-else-if="block.type === 'downloads'" class="space-y-4">
              <div>
                <h2 v-if="block.heading" class="text-xl sm:text-2xl font-bold text-neutral-dark">
                  {{ block.heading }}
                </h2>
                <p v-if="block.description" class="text-xs sm:text-sm text-neutral-muted mt-1">
                  {{ block.description }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  v-for="file in block.files" 
                  :key="file.id"
                  class="p-4 rounded-xl border border-neutral-border bg-white shadow-xs flex items-center justify-between gap-4 hover:border-brand transition"
                >
                  <div class="flex items-center gap-3 truncate">
                    <div class="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-neutral-border/60 flex items-center justify-center shrink-0 text-brand">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div class="truncate">
                      <h4 class="text-xs sm:text-sm font-bold text-neutral-dark truncate" :title="file.name">
                        {{ file.name }}
                      </h4>
                      <p class="text-[11px] text-neutral-muted">
                        {{ file.format }} • {{ file.size }}
                      </p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    @click="downloadFile(file)"
                    class="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer shrink-0 shadow-xs"
                    title="Скачать файл"
                  >
                    Скачать
                  </button>
                </div>
              </div>
            </section>

          </template>

        </div>

      </div>
    </article>
  </div>
</template>
