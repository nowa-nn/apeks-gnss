<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNews } from '../composables/useNews.js';
import { resolveAsset } from '../utils/assets.js';

const route = useRoute();
const router = useRouter();
const {
  newsData,
  publishedNews,
  showOverlays,
  activeTarget,
  selectTarget,
  addNewsItem,
  loadPublicNews,
} = useNews();

const selectedCategory = ref('all');

onMounted(() => {
  loadPublicNews();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(
  () => [route.params.slug, route.query.article],
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
);

const allItems = computed(() =>
  showOverlays.value ? (newsData.value.items || []) : publishedNews.value
);

const activeSlug = computed(() => {
  if (route.params.slug) return String(route.params.slug);
  if (route.query.article) return String(route.query.article);
  return '';
});

const activeArticleIndex = computed(() => {
  if (!activeSlug.value) return -1;
  return (newsData.value.items || []).findIndex(
    (item) => item.slug === activeSlug.value || item.id === activeSlug.value
  );
});

const activeArticle = computed(() => {
  const idx = activeArticleIndex.value;
  if (idx < 0) return null;
  const item = newsData.value.items[idx];
  if (!showOverlays.value && item?.published === false) return null;
  return item;
});

const categories = computed(() => {
  const set = new Set();
  for (const item of allItems.value) {
    if (item.category) set.add(item.category);
  }
  return ['all', ...set];
});

const filteredItems = computed(() => {
  if (selectedCategory.value === 'all') return allItems.value;
  return allItems.value.filter((item) => item.category === selectedCategory.value);
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function editOutline(section, index = null) {
  if (!showOverlays.value) return '';
  const isSelected =
    activeTarget.value?.pageKey === 'news' &&
    activeTarget.value?.section === section &&
    (index === null || activeTarget.value?.index === index);
  return isSelected
    ? 'relative ring-2 ring-brand ring-offset-2 cursor-pointer'
    : 'relative ring-1 ring-transparent hover:ring-2 hover:ring-brand/70 hover:ring-offset-1 cursor-pointer transition';
}

function handleEditClick(event, section, index = null) {
  if (!showOverlays.value) return;
  event.preventDefault();
  event.stopPropagation();
  selectTarget(section, index, 'news');
}

function openArticle(item, idx) {
  if (showOverlays.value) {
    selectTarget('newsItem', idx, 'news');
    return;
  }
  if (item.linkUrl) {
    if (item.linkUrl.startsWith('http://') || item.linkUrl.startsWith('https://')) {
      window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.linkUrl);
    }
    return;
  }
  router.push({ path: '/news', query: { article: item.slug || item.id } });
}

function backToList() {
  const nextQuery = showOverlays.value ? { edit: '1' } : {};
  router.push({ path: '/news', query: nextQuery });
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
        <button
          v-if="activeArticle"
          type="button"
          @click="backToList"
          class="hover:text-brand transition cursor-pointer"
        >
          {{ newsData.title }}
        </button>
        <span v-else class="text-neutral-dark font-medium">{{ newsData.title }}</span>
        <template v-if="activeArticle">
          <span class="text-neutral-300">/</span>
          <span class="text-neutral-dark font-medium truncate max-w-xs sm:max-w-md">{{ activeArticle.title }}</span>
        </template>
      </nav>
    </div>

    <!-- ARTICLE DETAIL VIEW -->
    <section v-if="activeArticle" class="pt-2 pb-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-8">
        <article
          @click.capture="handleEditClick($event, 'newsItem', activeArticleIndex)"
          :class="['space-y-6', editOutline('newsItem', activeArticleIndex)]"
        >
          <span
            v-if="showOverlays"
            class="inline-block px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
          >
            ✎ Нажмите для редактирования новости
          </span>

          <div class="space-y-3">
            <div class="flex items-center gap-3 text-xs text-neutral-muted">
              <span v-if="activeArticle.category" class="px-2.5 py-0.5 rounded-full bg-brand/10 text-brand font-semibold">
                {{ activeArticle.category }}
              </span>
              <span v-if="activeArticle.date">{{ formatDate(activeArticle.date) }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight leading-tight">
              {{ activeArticle.title }}
            </h1>
            <p v-if="activeArticle.summary" class="text-sm sm:text-base text-neutral-muted leading-relaxed">
              {{ activeArticle.summary }}
            </p>
          </div>

          <div v-if="activeArticle.image" class="rounded-2xl overflow-hidden border border-neutral-border bg-neutral-dark max-h-[440px]">
            <img :src="resolveAsset(activeArticle.image)" :alt="activeArticle.title" class="w-full h-full object-cover">
          </div>

          <div class="space-y-4 text-sm sm:text-base text-neutral-dark leading-relaxed whitespace-pre-line">
            {{ activeArticle.content || activeArticle.summary }}
          </div>

          <div class="pt-6 border-t border-neutral-border flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              @click="backToList"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-border hover:border-brand text-xs font-semibold text-neutral-dark hover:text-brand transition cursor-pointer"
            >
              ← Все новости
            </button>
            <router-link
              to="/#contacts"
              class="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition shadow-xs"
            >
              Связаться с отделом продаж
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <!-- NEWS LIST VIEW -->
    <section v-else class="pt-2 pb-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <!-- Header -->
        <div
          @click.capture="handleEditClick($event, 'newsHeader', 0)"
          :class="['mb-8 pb-4 border-b border-neutral-border flex flex-col sm:flex-row sm:items-end justify-between gap-4', editOutline('newsHeader')]"
        >
          <div>
            <span
              v-if="showOverlays"
              class="inline-block mb-2 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
            >
              ✎ Заголовок раздела новостей
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight">
              {{ newsData.title }}
            </h1>
            <p class="text-xs sm:text-sm text-neutral-muted mt-2 max-w-3xl leading-relaxed">
              {{ newsData.subtitle }}
            </p>
          </div>

          <button
            v-if="showOverlays"
            type="button"
            @click.stop="addNewsItem"
            class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
          >
            + Добавить новость
          </button>
        </div>

        <!-- Category tabs -->
        <div v-if="categories.length > 2" class="flex flex-wrap items-center gap-2 mb-8">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            @click="selectedCategory = cat"
            :class="[
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer',
              selectedCategory === cat
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-neutral-dark border-neutral-border hover:border-brand'
            ]"
          >
            {{ cat === 'all' ? 'Все новости' : cat }}
          </button>
        </div>

        <!-- News grid -->
        <div v-if="filteredItems.length === 0" class="py-12 text-center text-sm text-neutral-muted border border-dashed border-neutral-border rounded-xl">
          В этом разделе пока нет новостей.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="item in filteredItems"
            :key="item.id || item.slug"
            @click="openArticle(item, newsData.items.indexOf(item))"
            :class="[
              'bg-white rounded-xl border border-neutral-border hover:border-brand transition overflow-hidden flex flex-col justify-between shadow-xs cursor-pointer group',
              item.published === false ? 'opacity-65' : '',
              editOutline('newsItem', newsData.items.indexOf(item))
            ]"
          >
            <div>
              <div class="relative h-52 overflow-hidden bg-neutral-dark">
                <img :src="resolveAsset(item.image)" :alt="item.title" class="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]">
                <span
                  v-if="item.published === false"
                  class="absolute top-3 left-3 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold"
                >
                  Скрыта
                </span>
                <span
                  v-if="item.category"
                  class="absolute bottom-3 left-3 px-2.5 py-0.5 rounded bg-black/70 text-white text-[11px] font-medium"
                >
                  {{ item.category }}
                </span>
              </div>
              <div class="p-5">
                <div v-if="item.date" class="text-[11px] text-neutral-muted mb-1.5">
                  {{ formatDate(item.date) }}
                </div>
                <h2 class="font-bold text-sm sm:text-base text-neutral-dark leading-snug mb-2 group-hover:text-brand transition">
                  {{ item.title }}
                </h2>
                <p class="text-xs text-neutral-muted leading-relaxed line-clamp-3">
                  {{ item.summary }}
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:underline">
                <span>{{ item.buttonText || 'Подробнее' }}</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
