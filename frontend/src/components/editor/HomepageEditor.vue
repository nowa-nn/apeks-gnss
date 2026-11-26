<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useHomepage } from '../../composables/useHomepage.js';
import { useNews } from '../../composables/useNews.js';
import { products } from '../../data/products.js';
import { resolveAsset } from '../../utils/assets.js';

const router = useRouter();

const {
  homepage,
  publishedMeta: homepageMeta,
  history: homepageHistory,
  isDirty: isHomepageDirty,
  isSaving: isHomepageSaving,
  isEditMode,
  isPreviewMode,
  isAuthenticated,
  activePageKey,
  activeTarget,
  editorError,
  editorNotice,
  loginEditor,
  logoutEditor,
  exitEditMode,
  publishChanges: publishHomepage,
  rollbackToVersion: rollbackHomepage,
  discardChanges: discardHomepage,
  resetToTemplateDefaults: resetHomepageDefaults,
  uploadMedia,
  selectTarget,
} = useHomepage();

const {
  newsData,
  newsPublishedMeta,
  newsHistory,
  isNewsDirty,
  isNewsSaving,
  publishNews,
  rollbackNews,
  discardNews,
  resetNewsToDefaults,
  addNewsItem,
} = useNews();

const editablePages = [
  { key: 'homepage', label: 'Главная', path: '/' },
  { key: 'news', label: 'Новости', path: '/news' },
];

const email = ref('admin@apeks.local');
const password = ref('');
const loginError = ref('');
const isLoggingIn = ref(false);
const showHistory = ref(false);
const uploadingField = ref('');
const uploadError = ref('');

const pageSectionLabels = {
  homepage: {
    hero: 'Hero-слайдер',
    catalog: 'Каталог оборудования',
    services: 'Услуги и сервис',
    featured: 'Лучшие предложения',
    about: 'О компании',
    videos: 'APEKS в работе (Видео)',
    downloads: 'Центр загрузок',
    news: 'Выбор новостей на главной',
    contacts: 'Контакты и форма',
  },
  news: {
    newsHeader: 'Заголовок раздела новостей',
    newsItem: 'Статьи и новости',
  },
};

const currentSectionLabels = computed(() => pageSectionLabels[activePageKey.value] || pageSectionLabels.homepage);

const activeDoc = computed(() => {
  if (activePageKey.value === 'news') {
    return {
      key: 'news',
      label: 'Новости',
      meta: newsPublishedMeta.value,
      history: newsHistory.value,
      isDirty: isNewsDirty.value,
      isSaving: isNewsSaving.value,
      publish: publishNews,
      rollback: rollbackNews,
      discard: discardNews,
      reset: resetNewsToDefaults,
    };
  }
  return {
    key: 'homepage',
    label: 'Главная',
    meta: homepageMeta.value,
    history: homepageHistory.value,
    isDirty: isHomepageDirty.value,
    isSaving: isHomepageSaving.value,
    publish: publishHomepage,
    rollback: rollbackHomepage,
    discard: discardHomepage,
    reset: resetHomepageDefaults,
  };
});

const activeSection = computed(() => activeTarget.value?.section || '');
const activeIndex = computed(() =>
  typeof activeTarget.value?.index === 'number' ? activeTarget.value.index : 0
);

watch(activeTarget, () => {
  uploadError.value = '';
});

function switchEditorPage(pagePath) {
  showHistory.value = false;
  router.push({ path: pagePath, query: { edit: '1' } });
}

function toggleNewsSelection(newsId) {
  if (!Array.isArray(homepage.value.newsSection.selectedIds)) {
    homepage.value.newsSection.selectedIds = [];
  }
  const list = homepage.value.newsSection.selectedIds;
  const idx = list.indexOf(newsId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(newsId);
  }
}

function isNewsSelected(newsId) {
  return Array.isArray(homepage.value.newsSection.selectedIds) &&
    homepage.value.newsSection.selectedIds.includes(newsId);
}

const selectedNewsObjects = computed(() => {
  const ids = homepage.value.newsSection.selectedIds || [];
  const all = newsData.value.items || [];
  return ids.map((id) => all.find((n) => n.id === id)).filter(Boolean);
});

const currentNewsItem = computed(() => {
  if (activeSection.value !== 'newsItem') return null;
  const items = newsData.value.items || [];
  return items[activeIndex.value] || items[0] || null;
});

function removeNewsItemAt(idx) {
  const items = newsData.value.items || [];
  if (!items.length) return;
  const [removed] = items.splice(idx, 1);
  if (removed?.id && Array.isArray(homepage.value.newsSection.selectedIds)) {
    homepage.value.newsSection.selectedIds = homepage.value.newsSection.selectedIds.filter(
      (id) => id !== removed.id
    );
  }
  if (items.length > 0) {
    selectTarget('newsItem', Math.max(0, idx - 1), 'news');
  } else {
    activeTarget.value = null;
  }
}

async function handleLogin() {
  loginError.value = '';
  isLoggingIn.value = true;
  try {
    await loginEditor(email.value, password.value);
    password.value = '';
  } catch (err) {
    loginError.value = err.message || 'Не удалось войти';
  } finally {
    isLoggingIn.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function handleFileUpload(event, onDone, key = 'file') {
  const file = event.target?.files?.[0];
  if (!file) return;
  uploadingField.value = key;
  uploadError.value = '';
  try {
    const url = await uploadMedia(file);
    onDone(url);
  } catch (err) {
    uploadError.value = err.message || 'Ошибка загрузки файла';
  } finally {
    uploadingField.value = '';
    if (event.target) event.target.value = '';
  }
}

function moveItem(arr, index, delta) {
  const next = index + delta;
  if (!Array.isArray(arr) || next < 0 || next >= arr.length) return index;
  const [item] = arr.splice(index, 1);
  arr.splice(next, 0, item);
  return next;
}

function addHeroSlide() {
  homepage.value.heroSlides.push({
    id: `slide-${Date.now()}`,
    title: 'Новый слайд APEKS',
    description: 'Краткое описание оборудования или акции',
    buttonText: 'Смотреть в каталоге',
    buttonLink: '/catalog',
    bgColor: '#080d1c',
    desktopImage: 'assets/banner-1-2-1.png',
    desktopWebp: '',
    mobileImage: 'assets/banner-1-2-1.png',
    mobileWebp: '',
  });
  selectTarget('hero', homepage.value.heroSlides.length - 1);
}

function removeHeroSlide(idx) {
  if (homepage.value.heroSlides.length <= 1) return;
  homepage.value.heroSlides.splice(idx, 1);
  selectTarget('hero', Math.max(0, idx - 1));
}

function setHeroDesktopImage(slide, url) {
  slide.desktopImage = url;
  slide.desktopWebp = '';
  if (!slide.mobileImage || slide.mobileImage === slide.desktopImage) {
    slide.mobileImage = url;
    slide.mobileWebp = '';
  }
}

function setHeroMobileImage(slide, url) {
  slide.mobileImage = url;
  slide.mobileWebp = '';
}

function addListItem(section, list, template) {
  list.push({ ...template, id: `${section}-${Date.now()}` });
  selectTarget(section, list.length - 1);
}

function removeListItem(section, list, idx) {
  if (list.length <= 1) return;
  list.splice(idx, 1);
  selectTarget(section, Math.max(0, idx - 1));
}

const currentSlide = computed(() => {
  if (activeSection.value !== 'hero') return null;
  const slides = homepage.value.heroSlides;
  return slides[activeIndex.value] || slides[0] || null;
});

function setSelectedIndex(idx) {
  if (!activeTarget.value) return;
  activeTarget.value = {
    pageKey: activeTarget.value.pageKey || activePageKey.value,
    section: activeTarget.value.section,
    index: idx,
  };
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isEditMode" class="font-sans">
      <!-- LOGIN MODAL IF NOT AUTHENTICATED -->
      <div
        v-if="!isAuthenticated"
        class="fixed inset-0 z-[90] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="w-full max-w-md bg-white rounded-2xl border border-neutral-border shadow-2xl p-6 space-y-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-extrabold text-neutral-dark">Визуальный редактор сайта</h2>
              <p class="text-xs text-neutral-muted mt-1">
                Войдите под учётной записью администратора Medusa, чтобы редактировать блоки прямо на странице.
              </p>
            </div>
            <button
              type="button"
              @click="exitEditMode"
              class="text-neutral-muted hover:text-neutral-dark p-1 cursor-pointer"
              title="Закрыть режим редактора"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">Логин (email)</label>
              <input
                v-model="email"
                type="email"
                required
                class="w-full h-10 px-3 rounded-lg border border-neutral-border text-sm focus:outline-none focus:border-brand"
                placeholder="admin@apeks.local"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">Пароль</label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full h-10 px-3 rounded-lg border border-neutral-border text-sm focus:outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            <p v-if="loginError || editorError" class="text-xs text-red-600 font-medium">
              {{ loginError || editorError }}
            </p>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                @click="exitEditMode"
                class="px-4 py-2 rounded-lg border border-neutral-border text-xs font-semibold text-neutral-dark hover:bg-neutral-50 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                :disabled="isLoggingIn"
                class="px-5 py-2 rounded-lg bg-brand hover:bg-[#01556D] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
              >
                {{ isLoggingIn ? 'Вход...' : 'Войти и редактировать' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- TOP EDITOR TOOLBAR (WHEN AUTHENTICATED) -->
      <div v-else>
        <div class="fixed top-0 inset-x-0 z-[80] bg-[#0B1520] text-white border-b border-white/15 shadow-lg">
          <div class="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2 py-0.5 rounded bg-brand text-white text-[11px] font-bold uppercase tracking-wide shrink-0">
                Редактор
              </span>
              <div class="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg shrink-0">
                <button
                  v-for="pg in editablePages"
                  :key="pg.key"
                  type="button"
                  @click="switchEditorPage(pg.path)"
                  :class="[
                    'px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer flex items-center gap-1',
                    activePageKey === pg.key ? 'bg-white text-neutral-dark shadow-xs' : 'text-slate-200 hover:text-white'
                  ]"
                >
                  <span>{{ pg.label }}</span>
                  <span
                    v-if="(pg.key === 'homepage' && isHomepageDirty) || (pg.key === 'news' && isNewsDirty)"
                    class="w-1.5 h-1.5 rounded-full bg-amber-400"
                    title="Есть несохранённые изменения"
                  ></span>
                </button>
              </div>
              <span v-if="activeDoc.isDirty" class="hidden md:inline text-xs font-semibold text-amber-300 truncate">
                Есть несохранённые изменения
              </span>
              <span v-else-if="activeDoc.meta" class="hidden md:inline text-xs text-emerald-300 truncate">
                Опубликовано v{{ activeDoc.meta.version }} ({{ formatDate(activeDoc.meta.saved_at) }})
              </span>
              <span v-else class="hidden md:inline text-xs text-slate-300 truncate">
                По умолчанию · Нажмите на блок
              </span>
            </div>

            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div class="relative hidden sm:block">
                <select
                  :value="activeSection"
                  @change="selectTarget($event.target.value, 0)"
                  class="h-8 px-2.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="" disabled class="text-neutral-dark">Выбрать блок...</option>
                  <option
                    v-for="(label, key) in currentSectionLabels"
                    :key="key"
                    :value="key"
                    class="text-neutral-dark"
                  >
                    {{ label }}
                  </option>
                </select>
              </div>

              <button
                type="button"
                @click="isPreviewMode = !isPreviewMode"
                :class="[
                  'h-8 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer',
                  isPreviewMode
                    ? 'bg-white text-neutral-dark border-white'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                ]"
              >
                {{ isPreviewMode ? 'К правкам' : 'Просмотр' }}
              </button>

              <div class="relative">
                <button
                  type="button"
                  @click="showHistory = !showHistory"
                  class="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold cursor-pointer"
                >
                  История ({{ activeDoc.history.length }})
                </button>
                <div
                  v-if="showHistory"
                  class="absolute right-0 mt-2 w-72 bg-white text-neutral-dark rounded-xl border border-neutral-border shadow-2xl p-3 space-y-2 z-[95]"
                >
                  <div class="flex items-center justify-between pb-1.5 border-b border-neutral-border">
                    <span class="text-xs font-bold">Версии: {{ activeDoc.label }}</span>
                    <button type="button" @click="showHistory = false" class="text-xs text-neutral-muted cursor-pointer">✕</button>
                  </div>
                  <div v-if="!activeDoc.history.length" class="text-[11px] text-neutral-muted py-2">
                    Предыдущих версий пока нет.
                  </div>
                  <div v-else class="max-h-60 overflow-y-auto divide-y divide-neutral-border/70">
                    <div
                      v-for="item in activeDoc.history"
                      :key="item.version"
                      class="py-2 flex items-center justify-between gap-2"
                    >
                      <div class="text-[11px]">
                        <div class="font-bold">Версия v{{ item.version }}</div>
                        <div class="text-neutral-muted">{{ formatDate(item.saved_at) }}</div>
                      </div>
                      <button
                        type="button"
                        :disabled="activeDoc.isSaving"
                        @click="activeDoc.rollback(item.version); showHistory = false"
                        class="px-2.5 py-1 rounded bg-neutral-100 hover:bg-brand hover:text-white text-[11px] font-semibold transition cursor-pointer"
                      >
                        Откатить
                      </button>
                    </div>
                  </div>
                  <div class="pt-1 border-t border-neutral-border">
                    <button
                      type="button"
                      @click="activeDoc.reset(); showHistory = false"
                      class="w-full py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold cursor-pointer"
                    >
                      Сбросить к исходному шаблону
                    </button>
                  </div>
                </div>
              </div>

              <button
                v-if="activeDoc.isDirty"
                type="button"
                @click="activeDoc.discard()"
                class="hidden sm:inline-flex h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold cursor-pointer"
              >
                Отменить
              </button>

              <button
                type="button"
                :disabled="activeDoc.isSaving || !activeDoc.isDirty"
                @click="activeDoc.publish()"
                class="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-45 text-white text-xs font-bold transition cursor-pointer"
              >
                {{ activeDoc.isSaving ? 'Сохранение...' : 'Опубликовать' }}
              </button>

              <button
                type="button"
                @click="logoutEditor(); exitEditMode()"
                class="h-8 px-2.5 rounded-lg bg-white/10 hover:bg-red-500/80 border border-white/15 text-xs font-semibold cursor-pointer"
                title="Выйти из режима редактирования"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>

        <!-- Spacer for fixed toolbar -->
        <div class="h-14"></div>

        <!-- Floating Notice / Error toast -->
        <div
          v-if="editorNotice || editorError"
          class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[95] px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold"
          :class="editorError ? 'bg-red-600 text-white' : 'bg-[#0B1520] text-white border border-white/15'"
        >
          {{ editorError || editorNotice }}
        </div>

        <!-- RIGHT SIDE INSPECTOR DRAWER -->
        <aside
          v-if="activeTarget && !isPreviewMode"
          class="fixed top-14 right-0 bottom-0 w-full sm:w-[420px] z-[85] bg-white border-l border-neutral-border shadow-2xl flex flex-col"
        >
          <div class="px-5 py-3.5 border-b border-neutral-border flex items-center justify-between bg-[#F8FAFC] shrink-0">
            <div>
              <div class="text-[11px] text-brand font-bold uppercase tracking-wider">Редактирование блока</div>
              <h3 class="text-sm font-extrabold text-neutral-dark">
                {{ currentSectionLabels[activeSection] || activeSection }}
              </h3>
            </div>
            <button
              type="button"
              @click="activeTarget = null"
              class="w-8 h-8 rounded-lg hover:bg-neutral-200/70 text-neutral-muted hover:text-neutral-dark flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            <p v-if="uploadError" class="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
              {{ uploadError }}
            </p>

            <!-- 1. HERO SLIDER -->
            <template v-if="activeSection === 'hero' && currentSlide">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-neutral-dark">Слайды ({{ homepage.heroSlides.length }})</span>
                  <button
                    type="button"
                    @click="addHeroSlide"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить слайд
                  </button>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(slide, idx) in homepage.heroSlides"
                    :key="slide.id || idx"
                    type="button"
                    @click="setSelectedIndex(idx)"
                    :class="[
                      'px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition',
                      idx === activeIndex
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-neutral-dark border-neutral-border hover:border-brand'
                    ]"
                  >
                    Слайд {{ idx + 1 }}
                  </button>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    :disabled="activeIndex <= 0"
                    @click="setSelectedIndex(moveItem(homepage.heroSlides, activeIndex, -1))"
                    class="px-2.5 py-1 rounded border border-neutral-border disabled:opacity-40 cursor-pointer"
                  >
                    ← Влево
                  </button>
                  <button
                    type="button"
                    :disabled="activeIndex >= homepage.heroSlides.length - 1"
                    @click="setSelectedIndex(moveItem(homepage.heroSlides, activeIndex, 1))"
                    class="px-2.5 py-1 rounded border border-neutral-border disabled:opacity-40 cursor-pointer"
                  >
                    Вправо →
                  </button>
                  <button
                    type="button"
                    :disabled="homepage.heroSlides.length <= 1"
                    @click="removeHeroSlide(activeIndex)"
                    class="ml-auto px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 cursor-pointer"
                  >
                    Удалить слайд
                  </button>
                </div>
              </div>

              <div class="space-y-3 pt-2 border-t border-neutral-border">
                <div>
                  <label class="block font-semibold text-neutral-dark mb-1">Заголовок</label>
                  <input v-model="currentSlide.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label class="block font-semibold text-neutral-dark mb-1">Описание</label>
                  <textarea v-model="currentSlide.description" rows="3" class="w-full p-2.5 rounded-lg border border-neutral-border focus:outline-none focus:border-brand" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold text-neutral-dark mb-1">Текст кнопки</label>
                    <input v-model="currentSlide.buttonText" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label class="block font-semibold text-neutral-dark mb-1">Цвет фона</label>
                    <div class="flex items-center gap-2">
                      <input v-model="currentSlide.bgColor" type="color" class="w-9 h-9 rounded border border-neutral-border cursor-pointer p-0.5" />
                      <input v-model="currentSlide.bgColor" type="text" class="flex-1 h-9 px-2.5 rounded-lg border border-neutral-border font-mono text-[11px]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block font-semibold text-neutral-dark mb-1">Ссылка кнопки</label>
                  <input v-model="currentSlide.buttonLink" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border focus:outline-none focus:border-brand" placeholder="/product/ap10" />
                  <select
                    @change="$event.target.value && (currentSlide.buttonLink = $event.target.value)"
                    class="mt-1.5 w-full h-8 px-2.5 rounded-lg border border-neutral-border bg-[#F8FAFC] text-[11px]"
                  >
                    <option value="">Быстро выбрать товар или раздел...</option>
                    <option value="/catalog">Весь каталог (/catalog)</option>
                    <option v-for="p in products" :key="p.slug" :value="`/product/${p.slug}`">
                      {{ p.title }} (/product/{{ p.slug }})
                    </option>
                  </select>
                </div>

                <!-- Desktop image -->
                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-border space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-neutral-dark">Фото баннера (Десктоп)</span>
                    <label class="px-2.5 py-1 rounded bg-brand hover:bg-[#01556D] text-white font-semibold cursor-pointer">
                      {{ uploadingField === 'hero-desktop' ? 'Загрузка...' : 'Загрузить фото' }}
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileUpload($event, (url) => setHeroDesktopImage(currentSlide, url), 'hero-desktop')"
                      />
                    </label>
                  </div>
                  <img
                    v-if="currentSlide.desktopImage"
                    :src="resolveAsset(currentSlide.desktopImage)"
                    class="w-full h-24 object-cover rounded border border-neutral-border"
                    :style="{ backgroundColor: currentSlide.bgColor }"
                  />
                  <input
                    :value="currentSlide.desktopImage"
                    @input="setHeroDesktopImage(currentSlide, $event.target.value)"
                    type="text"
                    class="w-full h-8 px-2.5 rounded border border-neutral-border text-[11px]"
                    placeholder="assets/... или /static/..."
                  />
                </div>

                <!-- Mobile image -->
                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-border space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-neutral-dark">Фото баннера (Мобильное)</span>
                    <label class="px-2.5 py-1 rounded bg-brand hover:bg-[#01556D] text-white font-semibold cursor-pointer">
                      {{ uploadingField === 'hero-mobile' ? 'Загрузка...' : 'Загрузить фото' }}
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileUpload($event, (url) => setHeroMobileImage(currentSlide, url), 'hero-mobile')"
                      />
                    </label>
                  </div>
                  <img
                    v-if="currentSlide.mobileImage"
                    :src="resolveAsset(currentSlide.mobileImage)"
                    class="w-full h-20 object-cover rounded border border-neutral-border"
                    :style="{ backgroundColor: currentSlide.bgColor }"
                  />
                  <input
                    :value="currentSlide.mobileImage"
                    @input="setHeroMobileImage(currentSlide, $event.target.value)"
                    type="text"
                    class="w-full h-8 px-2.5 rounded border border-neutral-border text-[11px]"
                    placeholder="assets/... или /static/..."
                  />
                </div>
              </div>
            </template>

            <!-- 2. CATALOG SECTION -->
            <template v-else-if="activeSection === 'catalog'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок блока</label>
                  <input v-model="homepage.catalogSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1">Кнопка «Смотреть все»</label>
                    <input v-model="homepage.catalogSection.buttonText" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                  </div>
                  <div>
                    <label class="block font-semibold mb-1">Ссылка кнопки</label>
                    <input v-model="homepage.catalogSection.buttonLink" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-neutral-border space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-neutral-dark">Категории</span>
                  <button
                    type="button"
                    @click="addListItem('catalog', homepage.catalogSection.categories, { title: 'Новая категория', image: 'assets/ap40_laser.png', link: '/catalog' })"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить
                  </button>
                </div>
                <div
                  v-for="(cat, idx) in homepage.catalogSection.categories"
                  :key="cat.id || idx"
                  :class="['p-3 rounded-xl border space-y-2', idx === activeIndex ? 'border-brand bg-brand/5' : 'border-neutral-border']"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-bold">{{ idx + 1 }}. {{ cat.title }}</span>
                    <div class="flex items-center gap-1">
                      <button type="button" :disabled="idx === 0" @click="moveItem(homepage.catalogSection.categories, idx, -1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↑</button>
                      <button type="button" :disabled="idx === homepage.catalogSection.categories.length - 1" @click="moveItem(homepage.catalogSection.categories, idx, 1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↓</button>
                      <button type="button" :disabled="homepage.catalogSection.categories.length <= 1" @click="removeListItem('catalog', homepage.catalogSection.categories, idx)" class="px-1.5 py-0.5 text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                  <input v-model="cat.title" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Название" />
                  <input v-model="cat.link" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="/catalog?category=..." />
                  <div class="flex items-center gap-2">
                    <img :src="resolveAsset(cat.image)" class="w-10 h-10 object-contain rounded border bg-white p-1 shrink-0" />
                    <input v-model="cat.image" type="text" class="flex-1 h-8 px-2 rounded border border-neutral-border bg-white text-[11px]" />
                    <label class="px-2 py-1 rounded bg-brand text-white text-[11px] font-semibold cursor-pointer shrink-0">
                      {{ uploadingField === `cat-${idx}` ? '...' : 'Фото' }}
                      <input type="file" accept="image/*" class="hidden" @change="handleFileUpload($event, (u) => { cat.image = u; }, `cat-${idx}`)" />
                    </label>
                  </div>
                </div>
              </div>
            </template>

            <!-- 3. SERVICES SECTION -->
            <template v-else-if="activeSection === 'services'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок блока</label>
                  <input v-model="homepage.servicesSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1">Текст ссылки</label>
                    <input v-model="homepage.servicesSection.allLinkText" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                  </div>
                  <div>
                    <label class="block font-semibold mb-1">URL ссылки</label>
                    <input v-model="homepage.servicesSection.allLinkUrl" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                  </div>
                </div>
              </div>
              <div class="pt-3 border-t border-neutral-border space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold">Карточки услуг</span>
                  <button
                    type="button"
                    @click="addListItem('services', homepage.servicesSection.items, { title: 'Новая услуга', description: 'Описание услуги', buttonText: 'Оставить заявку', contactSubject: 'Заявка на услугу' })"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить
                  </button>
                </div>
                <div
                  v-for="(srv, idx) in homepage.servicesSection.items"
                  :key="srv.id || idx"
                  :class="['p-3 rounded-xl border space-y-2', idx === activeIndex ? 'border-brand bg-brand/5' : 'border-neutral-border']"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold">{{ idx + 1 }}. {{ srv.title }}</span>
                    <div class="flex items-center gap-1">
                      <button type="button" :disabled="idx === 0" @click="moveItem(homepage.servicesSection.items, idx, -1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↑</button>
                      <button type="button" :disabled="idx === homepage.servicesSection.items.length - 1" @click="moveItem(homepage.servicesSection.items, idx, 1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↓</button>
                      <button type="button" :disabled="homepage.servicesSection.items.length <= 1" @click="removeListItem('services', homepage.servicesSection.items, idx)" class="px-1.5 py-0.5 text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                  <input v-model="srv.title" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Заголовок" />
                  <textarea v-model="srv.description" rows="2" class="w-full p-2 rounded border border-neutral-border bg-white" placeholder="Описание" />
                  <div class="grid grid-cols-2 gap-2">
                    <input v-model="srv.buttonText" type="text" class="h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Кнопка" />
                    <input v-model="srv.contactSubject" type="text" class="h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Тема в форму" />
                  </div>
                </div>
              </div>
            </template>

            <!-- 4. FEATURED PRODUCTS -->
            <template v-else-if="activeSection === 'featured'">
              <div>
                <label class="block font-semibold mb-1">Заголовок блока</label>
                <input v-model="homepage.featuredSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
              </div>
              <div class="pt-3 border-t border-neutral-border space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold">Товары в подборке (цены из Medusa)</span>
                  <button
                    type="button"
                    @click="addListItem('featured', homepage.featuredSection.items, { slug: products[0]?.slug || 'ap10', description: products[0]?.shortDesc || '', customImage: '', buttonText: 'Подробнее' })"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить
                  </button>
                </div>
                <div
                  v-for="(item, idx) in homepage.featuredSection.items"
                  :key="item.id || idx"
                  :class="['p-3 rounded-xl border space-y-2', idx === activeIndex ? 'border-brand bg-brand/5' : 'border-neutral-border']"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold">Карточка {{ idx + 1 }}</span>
                    <div class="flex items-center gap-1">
                      <button type="button" :disabled="idx === 0" @click="moveItem(homepage.featuredSection.items, idx, -1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↑</button>
                      <button type="button" :disabled="idx === homepage.featuredSection.items.length - 1" @click="moveItem(homepage.featuredSection.items, idx, 1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↓</button>
                      <button type="button" :disabled="homepage.featuredSection.items.length <= 1" @click="removeListItem('featured', homepage.featuredSection.items, idx)" class="px-1.5 py-0.5 text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                  <select v-model="item.slug" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white font-semibold">
                    <option v-for="p in products" :key="p.slug" :value="p.slug">
                      {{ p.title }} ({{ p.article }})
                    </option>
                  </select>
                  <textarea v-model="item.description" rows="2" class="w-full p-2 rounded border border-neutral-border bg-white" placeholder="Краткое описание (или оставьте стандартное)" />
                  <div class="flex items-center gap-2">
                    <input v-model="item.customImage" type="text" class="flex-1 h-8 px-2 rounded border border-neutral-border bg-white text-[11px]" placeholder="Своё фото (пусто = из товара)" />
                    <label class="px-2 py-1 rounded bg-brand text-white text-[11px] font-semibold cursor-pointer shrink-0">
                      {{ uploadingField === `feat-${idx}` ? '...' : 'Фото' }}
                      <input type="file" accept="image/*" class="hidden" @change="handleFileUpload($event, (u) => { item.customImage = u; }, `feat-${idx}`)" />
                    </label>
                  </div>
                </div>
              </div>
            </template>

            <!-- 5. ABOUT SECTION -->
            <template v-else-if="activeSection === 'about'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок</label>
                  <input v-model="homepage.aboutSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Основной текст</label>
                  <textarea v-model="homepage.aboutSection.description" rows="4" class="w-full p-2.5 rounded-lg border border-neutral-border" />
                </div>
              </div>
              <div class="pt-3 border-t border-neutral-border space-y-3">
                <span class="font-bold block">Карточки преимуществ</span>
                <div
                  v-for="(card, idx) in homepage.aboutSection.cards"
                  :key="card.id || idx"
                  :class="['p-3 rounded-xl border space-y-2', idx === activeIndex ? 'border-brand bg-brand/5' : 'border-neutral-border']"
                >
                  <select v-model="card.icon" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white">
                    <option value="location">Иконка: Геолокация</option>
                    <option value="tradein">Иконка: Обмен / Trade-In</option>
                    <option value="shield">Иконка: Гарантия / Щит</option>
                    <option value="truck">Иконка: Доставка / Логистика</option>
                  </select>
                  <input v-model="card.title" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" />
                  <textarea v-model="card.text" rows="2" class="w-full p-2 rounded border border-neutral-border bg-white" />
                </div>
              </div>
            </template>

            <!-- 6. VIDEOS SECTION -->
            <template v-else-if="activeSection === 'videos'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок</label>
                  <input v-model="homepage.videosSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Подзаголовок</label>
                  <textarea v-model="homepage.videosSection.subtitle" rows="2" class="w-full p-2 rounded-lg border border-neutral-border" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="homepage.videosSection.buttonText" type="text" class="h-8 px-2.5 rounded border border-neutral-border" placeholder="Кнопка" />
                  <input v-model="homepage.videosSection.contactSubject" type="text" class="h-8 px-2.5 rounded border border-neutral-border" placeholder="Тема в форму" />
                </div>
              </div>
              <div class="pt-3 border-t border-neutral-border space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold">Видеоролики</span>
                  <button
                    type="button"
                    @click="addListItem('videos', homepage.videosSection.items, { title: 'Новое видео', description: 'Описание видеообзора', duration: '1 мин', image: 'assets/video_preview_lineup.jpg', linkText: 'Смотреть', videoUrl: '', contactSubject: 'Видео APEKS' })"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить
                  </button>
                </div>
                <div
                  v-for="(vid, idx) in homepage.videosSection.items"
                  :key="vid.id || idx"
                  :class="['p-3 rounded-xl border space-y-2', idx === activeIndex ? 'border-brand bg-brand/5' : 'border-neutral-border']"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold">{{ idx + 1 }}. {{ vid.title }}</span>
                    <div class="flex items-center gap-1">
                      <button type="button" :disabled="idx === 0" @click="moveItem(homepage.videosSection.items, idx, -1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↑</button>
                      <button type="button" :disabled="idx === homepage.videosSection.items.length - 1" @click="moveItem(homepage.videosSection.items, idx, 1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↓</button>
                      <button type="button" :disabled="homepage.videosSection.items.length <= 1" @click="removeListItem('videos', homepage.videosSection.items, idx)" class="px-1.5 py-0.5 text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                  <input v-model="vid.title" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Название" />
                  <textarea v-model="vid.description" rows="2" class="w-full p-2 rounded border border-neutral-border bg-white" placeholder="Описание" />
                  <div class="grid grid-cols-2 gap-2">
                    <input v-model="vid.duration" type="text" class="h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Длительность (2 мин)" />
                    <input v-model="vid.linkText" type="text" class="h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Текст ссылки" />
                  </div>
                  <input v-model="vid.videoUrl" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Ссылка на видео (пусто = форма)" />
                  <div class="flex items-center gap-2">
                    <img :src="resolveAsset(vid.image)" class="w-12 h-8 object-cover rounded border bg-white shrink-0" />
                    <input v-model="vid.image" type="text" class="flex-1 h-8 px-2 rounded border border-neutral-border bg-white text-[11px]" />
                    <label class="px-2 py-1 rounded bg-brand text-white text-[11px] font-semibold cursor-pointer shrink-0">
                      {{ uploadingField === `vid-${idx}` ? '...' : 'Превью' }}
                      <input type="file" accept="image/*" class="hidden" @change="handleFileUpload($event, (u) => { vid.image = u; }, `vid-${idx}`)" />
                    </label>
                  </div>
                </div>
              </div>
            </template>

            <!-- 7. DOWNLOADS SECTION -->
            <template v-else-if="activeSection === 'downloads'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок</label>
                  <input v-model="homepage.downloadsSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Подзаголовок</label>
                  <input v-model="homepage.downloadsSection.subtitle" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
              </div>
              <div class="pt-3 border-t border-neutral-border space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold">Файлы для скачивания</span>
                  <button
                    type="button"
                    @click="addListItem('downloads', homepage.downloadsSection.items, { title: 'Новый файл', subtitle: 'Инструкция • PDF', buttonText: 'Скачать', fileUrl: '', contactSubject: 'Запрос файла' })"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить
                  </button>
                </div>
                <div
                  v-for="(dl, idx) in homepage.downloadsSection.items"
                  :key="dl.id || idx"
                  :class="['p-3 rounded-xl border space-y-2', idx === activeIndex ? 'border-brand bg-brand/5' : 'border-neutral-border']"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold">{{ idx + 1 }}. {{ dl.title }}</span>
                    <div class="flex items-center gap-1">
                      <button type="button" :disabled="idx === 0" @click="moveItem(homepage.downloadsSection.items, idx, -1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↑</button>
                      <button type="button" :disabled="idx === homepage.downloadsSection.items.length - 1" @click="moveItem(homepage.downloadsSection.items, idx, 1)" class="px-1.5 py-0.5 border rounded disabled:opacity-30 cursor-pointer">↓</button>
                      <button type="button" :disabled="homepage.downloadsSection.items.length <= 1" @click="removeListItem('downloads', homepage.downloadsSection.items, idx)" class="px-1.5 py-0.5 text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                  <input v-model="dl.title" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Название" />
                  <input v-model="dl.subtitle" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border bg-white" placeholder="Подпись (формат файла)" />
                  <div class="flex items-center gap-2">
                    <input v-model="dl.fileUrl" type="text" class="flex-1 h-8 px-2 rounded border border-neutral-border bg-white text-[11px]" placeholder="URL файла (пусто = форма)" />
                    <label class="px-2 py-1 rounded bg-brand text-white text-[11px] font-semibold cursor-pointer shrink-0">
                      {{ uploadingField === `dl-${idx}` ? '...' : 'Файл' }}
                      <input type="file" class="hidden" @change="handleFileUpload($event, (u) => { dl.fileUrl = u; }, `dl-${idx}`)" />
                    </label>
                  </div>
                </div>
              </div>
            </template>

            <!-- 8. HOMEPAGE NEWS SELECTOR (ONLY PICK EXISTING NEWS) -->
            <template v-else-if="activeSection === 'news'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок блока</label>
                  <input v-model="homepage.newsSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Подзаголовок</label>
                  <input v-model="homepage.newsSection.subtitle" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Текст ссылки на все новости</label>
                  <input v-model="homepage.newsSection.allLinkText" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
              </div>

              <div class="pt-3 border-t border-neutral-border space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-neutral-dark">Порядок на главной ({{ selectedNewsObjects.length }})</span>
                </div>
                <div v-if="!selectedNewsObjects.length" class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                  Ни одна новость не выбрана. Отметьте нужные новости ниже.
                </div>
                <div v-else class="space-y-1.5">
                  <div
                    v-for="(item, idx) in selectedNewsObjects"
                    :key="item.id"
                    class="p-2 rounded-lg border border-brand/40 bg-brand/5 flex items-center justify-between gap-2"
                  >
                    <span class="font-semibold text-[11px] truncate">{{ idx + 1 }}. {{ item.title }}</span>
                    <div class="flex items-center gap-1 shrink-0">
                      <button type="button" :disabled="idx === 0" @click="moveItem(homepage.newsSection.selectedIds, idx, -1)" class="px-1.5 py-0.5 border rounded bg-white disabled:opacity-30 cursor-pointer">↑</button>
                      <button type="button" :disabled="idx === selectedNewsObjects.length - 1" @click="moveItem(homepage.newsSection.selectedIds, idx, 1)" class="px-1.5 py-0.5 border rounded bg-white disabled:opacity-30 cursor-pointer">↓</button>
                      <button type="button" @click="toggleNewsSelection(item.id)" class="px-1.5 py-0.5 text-red-600 cursor-pointer" title="Убрать с главной">✕</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-neutral-border space-y-2.5">
                <span class="font-bold text-neutral-dark block">Существующие новости (отметьте нужные)</span>
                <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <label
                    v-for="item in newsData.items"
                    :key="item.id"
                    class="p-2.5 rounded-xl border border-neutral-border hover:border-brand flex items-start gap-2.5 cursor-pointer bg-white"
                  >
                    <input
                      type="checkbox"
                      :checked="isNewsSelected(item.id)"
                      @change="toggleNewsSelection(item.id)"
                      class="mt-0.5 w-4 h-4 accent-[#016C8A] cursor-pointer shrink-0"
                    />
                    <img :src="resolveAsset(item.image)" class="w-10 h-8 object-cover rounded border shrink-0" />
                    <div class="min-w-0">
                      <div class="font-semibold text-[11px] text-neutral-dark leading-snug line-clamp-2">{{ item.title }}</div>
                      <div class="text-[10px] text-neutral-muted mt-0.5">
                        {{ item.date || 'Без даты' }} <span v-if="item.published === false" class="text-amber-600 font-semibold">• Скрыта</span>
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  @click="switchEditorPage('/news')"
                  class="w-full py-2.5 px-3 rounded-lg bg-[#0B1520] hover:bg-brand text-white text-xs font-bold transition cursor-pointer"
                >
                  Добавить или изменить новости в разделе «Новости» →
                </button>
              </div>
            </template>

            <!-- NEWS PAGE: HEADER -->
            <template v-else-if="activeSection === 'newsHeader'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок страницы новостей</label>
                  <input v-model="newsData.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Подзаголовок</label>
                  <textarea v-model="newsData.subtitle" rows="3" class="w-full p-2.5 rounded-lg border border-neutral-border" />
                </div>
              </div>
            </template>

            <!-- NEWS PAGE: CRUD ITEMS -->
            <template v-else-if="activeSection === 'newsItem'">
              <div class="space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-neutral-dark">Все новости ({{ newsData.items.length }})</span>
                  <button
                    type="button"
                    @click="addNewsItem"
                    class="px-2.5 py-1 rounded bg-brand text-white font-semibold cursor-pointer"
                  >
                    + Добавить новость
                  </button>
                </div>

                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(item, idx) in newsData.items"
                    :key="item.id || idx"
                    type="button"
                    @click="setSelectedIndex(idx)"
                    :class="[
                      'px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition max-w-[160px] truncate',
                      idx === activeIndex
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-neutral-dark border-neutral-border hover:border-brand'
                    ]"
                  >
                    {{ idx + 1 }}. {{ item.title }}
                  </button>
                </div>
              </div>

              <div v-if="currentNewsItem" class="space-y-3 pt-3 border-t border-neutral-border">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    :disabled="activeIndex <= 0"
                    @click="setSelectedIndex(moveItem(newsData.items, activeIndex, -1))"
                    class="px-2.5 py-1 rounded border border-neutral-border disabled:opacity-40 cursor-pointer"
                  >
                    ↑ Выше
                  </button>
                  <button
                    type="button"
                    :disabled="activeIndex >= newsData.items.length - 1"
                    @click="setSelectedIndex(moveItem(newsData.items, activeIndex, 1))"
                    class="px-2.5 py-1 rounded border border-neutral-border disabled:opacity-40 cursor-pointer"
                  >
                    ↓ Ниже
                  </button>
                  <button
                    type="button"
                    @click="removeNewsItemAt(activeIndex)"
                    class="ml-auto px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
                  >
                    Удалить
                  </button>
                </div>

                <label class="flex items-center gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-neutral-border cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="currentNewsItem.published !== false"
                    @change="currentNewsItem.published = $event.target.checked"
                    class="w-4 h-4 accent-[#016C8A] cursor-pointer"
                  />
                  <span class="font-semibold text-neutral-dark">Опубликована на сайте</span>
                </label>

                <div>
                  <label class="block font-semibold mb-1">Заголовок новости</label>
                  <input v-model="currentNewsItem.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-semibold mb-1">Дата</label>
                    <input v-model="currentNewsItem.date" type="date" class="w-full h-9 px-2.5 rounded-lg border border-neutral-border" />
                  </div>
                  <div>
                    <label class="block font-semibold mb-1">Рубрика</label>
                    <input v-model="currentNewsItem.category" type="text" class="w-full h-9 px-2.5 rounded-lg border border-neutral-border" placeholder="Испытания" />
                  </div>
                </div>

                <div>
                  <label class="block font-semibold mb-1">Slug (для ссылки)</label>
                  <input v-model="currentNewsItem.slug" type="text" class="w-full h-8 px-2.5 rounded-lg border border-neutral-border font-mono text-[11px]" />
                </div>

                <div>
                  <label class="block font-semibold mb-1">Краткий анонс (для карточки)</label>
                  <textarea v-model="currentNewsItem.summary" rows="3" class="w-full p-2.5 rounded-lg border border-neutral-border" />
                </div>

                <div>
                  <label class="block font-semibold mb-1">Полный текст статьи</label>
                  <textarea v-model="currentNewsItem.content" rows="6" class="w-full p-2.5 rounded-lg border border-neutral-border" />
                </div>

                <div class="p-3 rounded-xl bg-[#F8FAFC] border border-neutral-border space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-neutral-dark">Обложка новости</span>
                    <label class="px-2.5 py-1 rounded bg-brand text-white text-[11px] font-semibold cursor-pointer">
                      {{ uploadingField === 'news-cover' ? 'Загрузка...' : 'Загрузить фото' }}
                      <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileUpload($event, (u) => { currentNewsItem.image = u; }, 'news-cover')"
                      />
                    </label>
                  </div>
                  <img v-if="currentNewsItem.image" :src="resolveAsset(currentNewsItem.image)" class="w-full h-24 object-cover rounded border bg-white" />
                  <input v-model="currentNewsItem.image" type="text" class="w-full h-8 px-2 rounded border border-neutral-border bg-white text-[11px]" />
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-semibold mb-1">Текст кнопки</label>
                    <input v-model="currentNewsItem.buttonText" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border" />
                  </div>
                  <div>
                    <label class="block font-semibold mb-1">Внешняя ссылка (опц.)</label>
                    <input v-model="currentNewsItem.linkUrl" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border" placeholder="Пусто = статья" />
                  </div>
                </div>
              </div>
            </template>

            <!-- 9. CONTACTS SECTION -->
            <template v-else-if="activeSection === 'contacts'">
              <div class="space-y-3">
                <div>
                  <label class="block font-semibold mb-1">Заголовок</label>
                  <input v-model="homepage.contactsSection.title" type="text" class="w-full h-9 px-3 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Подзаголовок</label>
                  <textarea v-model="homepage.contactsSection.subtitle" rows="3" class="w-full p-2 rounded-lg border border-neutral-border" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Пункты списка (по одному в строке)</label>
                  <textarea
                    :value="homepage.contactsSection.bullets.join('\n')"
                    @input="homepage.contactsSection.bullets = $event.target.value.split('\n').filter(Boolean)"
                    rows="3"
                    class="w-full p-2 rounded-lg border border-neutral-border"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-semibold mb-1">Телефон (текст)</label>
                    <input v-model="homepage.contactsSection.phone" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border" />
                  </div>
                  <div>
                    <label class="block font-semibold mb-1">Телефон (tel:)</label>
                    <input v-model="homepage.contactsSection.phoneHref" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border" />
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-1">Email</label>
                  <input v-model="homepage.contactsSection.email" type="text" class="w-full h-8 px-2.5 rounded border border-neutral-border" />
                </div>
              </div>
            </template>
          </div>
        </aside>
      </div>
    </div>
  </Teleport>
</template>
