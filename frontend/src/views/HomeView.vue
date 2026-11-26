<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useFormValidation } from '../composables/useFormValidation.js';
import { useRouter } from 'vue-router';
import { resolveAsset } from '../utils/assets.js';
import { getProductBySlug } from '../data/products.js';
import { formatRub } from '../composables/useCart.js';
import { useHomepage } from '../composables/useHomepage.js';

const router = useRouter();
const {
  homepage,
  isEditMode,
  isPreviewMode,
  isAuthenticated,
  activeTarget,
  selectTarget,
} = useHomepage();

const showOverlays = computed(
  () => isEditMode.value && isAuthenticated.value && !isPreviewMode.value
);

function editOutline(section, index = null) {
  if (!showOverlays.value) return '';
  const isSelected =
    activeTarget.value?.section === section &&
    (index === null || activeTarget.value?.index === index);
  return isSelected
    ? 'relative ring-2 ring-brand ring-offset-2 cursor-pointer'
    : 'relative ring-1 ring-transparent hover:ring-2 hover:ring-brand/70 hover:ring-offset-1 cursor-pointer transition';
}

function handleBlockClick(event, section, index = null) {
  if (!showOverlays.value) return;
  event.preventDefault();
  event.stopPropagation();
  selectTarget(section, index);
}

// ============================================================
// Hero Slider Functionality
// ============================================================
const currentHeroSlide = ref(0);
let heroInterval = null;

const heroSlides = computed(() => homepage.value.heroSlides || []);

function showHeroSlide(index) {
  const len = heroSlides.value.length;
  if (!len) return;
  currentHeroSlide.value = ((index % len) + len) % len;
}

function nextHeroSlide() {
  showHeroSlide(currentHeroSlide.value + 1);
}

function prevHeroSlide() {
  showHeroSlide(currentHeroSlide.value - 1);
}

function goToHeroSlide(index) {
  showHeroSlide(index);
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  if (showOverlays.value) return;
  heroInterval = setInterval(nextHeroSlide, 6500);
}

function stopHeroAutoplay() {
  if (heroInterval) {
    clearInterval(heroInterval);
    heroInterval = null;
  }
}

watch(
  () => [activeTarget.value?.section, activeTarget.value?.index, showOverlays.value],
  ([section, idx, overlays]) => {
    if (overlays) {
      stopHeroAutoplay();
      if (section === 'hero' && typeof idx === 'number') {
        showHeroSlide(idx);
      }
    } else {
      startHeroAutoplay();
    }
  }
);

watch(
  () => heroSlides.value.length,
  (len) => {
    if (len > 0 && currentHeroSlide.value >= len) {
      currentHeroSlide.value = len - 1;
    }
  }
);

function navigateOrUrl(url) {
  if (!url) return;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    router.push(url);
  }
}

function featuredProduct(item) {
  return getProductBySlug(item?.slug) || {};
}

function featuredPrice(item) {
  const prod = featuredProduct(item);
  return formatRub(typeof prod?.price === 'number' ? prod.price : 0);
}

function featuredImage(item) {
  if (item?.customImage) return resolveAsset(item.customImage);
  const prod = featuredProduct(item);
  return resolveAsset(prod?.mainImage || 'assets/client_title_apeks_ap10.png');
}

function handleVideoClick(vid) {
  if (vid?.videoUrl) {
    navigateOrUrl(vid.videoUrl);
  } else {
    scrollToContacts(vid?.contactSubject || vid?.title || '');
  }
}

function handleDownload(dl) {
  if (dl && typeof dl === 'object' && dl.fileUrl) {
    const a = document.createElement('a');
    a.href = resolveAsset(dl.fileUrl);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = dl.title || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  const label = typeof dl === 'string' ? dl : dl?.contactSubject || dl?.title || '';
  scrollToContacts(label);
}

function handleNewsClick(item) {
  if (item?.linkUrl) {
    navigateOrUrl(item.linkUrl);
  } else {
    scrollToContacts(item?.contactSubject || item?.title || '');
  }
}

// ==========================================
// News Carousel
// ==========================================
function scrollNews(direction) {
  const track = document.getElementById('newsCarousel');
  if (!track) return;
  const card = track.querySelector('article');
  const step = card ? card.offsetWidth + 24 : 360;
  track.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
}

function goToNewsSlide(index) {
  const track = document.getElementById('newsCarousel');
  const dots = document.querySelectorAll('.news-dot');
  if (!track || !dots.length) return;
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= 0) return;
  const targetScroll = (index / Math.max(1, dots.length - 1)) * maxScroll;
  track.scrollTo({ left: targetScroll, behavior: 'smooth' });
}

function updateNewsDots() {
  const track = document.getElementById('newsCarousel');
  const dots = document.querySelectorAll('.news-dot');
  const prevBtn = document.getElementById('newsPrevBtn');
  const nextBtn = document.getElementById('newsNextBtn');
  if (!track || !dots.length) return;

  const scrollLeft = track.scrollLeft;
  const maxScroll = track.scrollWidth - track.clientWidth;

  if (maxScroll > 5 && dots.length > 1) {
    const ratio = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const activeIdx = Math.round(ratio * (dots.length - 1));

    dots.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.className = 'news-dot w-6 h-1.5 rounded-full bg-brand transition-all cursor-pointer';
      } else {
        dot.className = 'news-dot w-2 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all cursor-pointer';
      }
    });

    if (prevBtn) prevBtn.disabled = scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = scrollLeft >= maxScroll - 2;
  } else {
    dots.forEach((dot, idx) => {
      dot.className = idx === 0
        ? 'news-dot w-6 h-1.5 rounded-full bg-brand transition-all cursor-pointer'
        : 'news-dot w-2 h-1.5 rounded-full bg-neutral-300 transition-all cursor-pointer';
    });
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
  }
}

const {
  onPhoneKeyDown,
  onPhoneInput,
  validatePhoneNumber,
} = useFormValidation();

const contactForm = ref({
  name: '',
  phone: '',
  city: '',
  model: '',
  comment: '',
  agree: false,
});

const contactErrors = ref({});
const contactSuccess = ref(false);

function validateContactPhone() {
  const err = validatePhoneNumber(contactForm.value.phone);
  if (err) contactErrors.value.phone = err;
  else delete contactErrors.value.phone;
  return !err;
}

function handleContactPhoneKeyDown(e) {
  const phoneRef = {
    get value() { return contactForm.value.phone; },
    set value(v) { contactForm.value.phone = v; },
  };
  onPhoneKeyDown(e, phoneRef, () => {
    if (contactErrors.value.phone) validateContactPhone();
  });
}

function handleContactPhoneInput(e) {
  const phoneRef = {
    get value() { return contactForm.value.phone; },
    set value(v) { contactForm.value.phone = v; },
  };
  onPhoneInput(e, phoneRef, () => {
    if (contactErrors.value.phone) validateContactPhone();
  });
}

function submitContactForm(e) {
  if (e) e.preventDefault();
  if (showOverlays.value) return;
  const errs = {};
  if (!contactForm.value.name.trim()) {
    errs.name = 'Укажите ваше имя';
  }
  const pErr = validatePhoneNumber(contactForm.value.phone);
  if (pErr) errs.phone = pErr;

  if (!contactForm.value.agree) {
    errs.agree = 'Необходимо согласие на обработку персональных данных';
  }

  contactErrors.value = errs;
  if (Object.keys(errs).length > 0) return;

  contactSuccess.value = true;
  contactForm.value = {
    name: '',
    phone: '',
    city: '',
    model: '',
    comment: '',
    agree: false,
  };
  setTimeout(() => {
    contactSuccess.value = false;
  }, 7000);
}

function scrollToContacts(presetMessage = '') {
  const el = document.getElementById('contacts');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    if (presetMessage && typeof presetMessage === 'string') {
      contactForm.value.model = presetMessage;
    }
  }
}

onMounted(() => {
  window.showHeroSlide = showHeroSlide;
  window.nextHeroSlide = nextHeroSlide;
  window.prevHeroSlide = prevHeroSlide;
  window.goToHeroSlide = goToHeroSlide;
  window.startHeroAutoplay = startHeroAutoplay;
  window.stopHeroAutoplay = stopHeroAutoplay;
  window.scrollNews = scrollNews;
  window.goToNewsSlide = goToNewsSlide;
  window.updateNewsDots = updateNewsDots;
  window.handleOrderSubmit = submitContactForm;
  window.submitContactForm = submitContactForm;

  startHeroAutoplay();

  const newsTrackEl = document.getElementById('newsCarousel');
  if (newsTrackEl) {
    newsTrackEl.addEventListener('scroll', updateNewsDots, { passive: true });
    window.addEventListener('resize', updateNewsDots);
    setTimeout(updateNewsDots, 200);
  }
});

onUnmounted(() => {
  stopHeroAutoplay();
  window.removeEventListener('resize', updateNewsDots);
});
</script>

<template>
  <div>
    <!-- ============================================================ -->
    <!-- 2. HERO PROMO SLIDER                                         -->
    <!-- ============================================================ -->
    <section class="bg-white pt-0 pb-3 md:pt-6 md:pb-4">
      <div class="w-full md:max-w-7xl md:mx-auto px-0 md:px-8">
        <div
          id="heroSlider"
          @mouseenter="stopHeroAutoplay"
          @mouseleave="startHeroAutoplay"
          @click.capture="handleBlockClick($event, 'hero', currentHeroSlide)"
          :class="[
            'hero-boxed-slider relative w-full overflow-hidden hero-banner-wrap rounded-none md:rounded-2xl h-[570px] xs:h-[600px] sm:h-[630px] md:h-auto shadow-sm md:shadow-md',
            editOutline('hero', currentHeroSlide)
          ]"
        >
          <span
            v-if="showOverlays"
            class="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-bold shadow-md pointer-events-none"
          >
            ✎ Слайд {{ currentHeroSlide + 1 }} — Нажмите для правки
          </span>

          <div
            v-for="(slide, idx) in heroSlides"
            :key="slide.id || idx"
            :class="[
              'hero-slide absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex flex-col md:flex-row md:items-center',
              idx === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            ]"
            :style="{ backgroundColor: slide.bgColor || '#080d1c' }"
          >
            <div class="relative w-full h-[290px] xs:h-[310px] sm:h-[340px] md:h-full md:absolute md:inset-0 pointer-events-none overflow-hidden flex md:justify-end">
              <picture class="w-full h-full block">
                <source v-if="slide.desktopWebp" media="(min-width: 768px)" type="image/webp" :srcset="resolveAsset(slide.desktopWebp)">
                <source v-if="slide.desktopImage" media="(min-width: 768px)" :srcset="resolveAsset(slide.desktopImage)">
                <source v-if="slide.mobileWebp" type="image/webp" :srcset="resolveAsset(slide.mobileWebp)">
                <img
                  :src="resolveAsset(slide.mobileImage || slide.desktopImage)"
                  :alt="slide.title"
                  width="1920"
                  height="800"
                  :fetchpriority="idx === 0 ? 'high' : undefined"
                  :loading="idx === 0 ? undefined : 'lazy'"
                  class="w-full h-full object-cover object-[80%_center] md:object-[right_center] hero-mask-mobile"
                >
              </picture>
              <div
                class="absolute inset-x-0 bottom-0 h-28 sm:h-32 pointer-events-none md:hidden"
                :style="{ background: `linear-gradient(to bottom, transparent, ${slide.bgColor || '#080d1c'})` }"
              ></div>
            </div>

            <div class="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-1 pb-10 md:py-0">
              <div class="max-w-md sm:max-w-lg space-y-3.5 md:space-y-4 text-white">
                <component
                  :is="idx === 0 ? 'h1' : 'h2'"
                  class="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight"
                >
                  {{ slide.title }}
                </component>
                <p class="text-slate-200 text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-sm sm:max-w-md">
                  {{ slide.description }}
                </p>
                <div class="pt-1 md:pt-2">
                  <router-link
                    :to="slide.buttonLink || '/catalog'"
                    class="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 rounded-md md:rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-xs md:text-sm transition shadow-sm"
                  >
                    <span>{{ slide.buttonText || 'Смотреть в каталоге' }}</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Dots -->
          <div class="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            <button
              v-for="(slide, idx) in heroSlides"
              :key="'dot-' + (slide.id || idx)"
              type="button"
              @click.stop="goToHeroSlide(idx)"
              :class="[
                'hero-dot rounded-full transition-all duration-300 focus:outline-none cursor-pointer',
                idx === currentHeroSlide ? 'w-8 h-2 bg-white shadow-sm' : 'w-2.5 h-2 bg-white/40 hover:bg-white/70'
              ]"
              :aria-label="'Слайд ' + (idx + 1)"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 3. КАТАЛОГ ОБОРУДОВАНИЯ                                      -->
    <!-- ============================================================ -->
    <section
      id="cat-grid"
      @click.capture="handleBlockClick($event, 'catalog', 0)"
      :class="['py-12 bg-white', editOutline('catalog')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: Каталог оборудования
        </span>

        <div class="mb-8 pb-3 border-b border-neutral-border flex items-center justify-between">
          <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.catalogSection.title }}</h2>
          <router-link
            :to="homepage.catalogSection.buttonLink || '/catalog'"
            class="hidden md:inline-flex items-center justify-center px-5 py-2 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-[13px] font-semibold border border-brand hover:border-[#01556D] transition shadow-xs"
          >
            {{ homepage.catalogSection.buttonText }}
          </router-link>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          <router-link
            :to="homepage.catalogSection.buttonLink || '/catalog'"
            class="md:hidden group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs"
          >
            <div class="h-28 flex items-center justify-center p-2">
              <img :src="resolveAsset('assets/image_2026-10-22_18-56-56.png')" :alt="homepage.catalogSection.buttonText" class="max-h-[70px] w-auto object-contain transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">
              {{ homepage.catalogSection.buttonText }}
            </h3>
          </router-link>

          <router-link
            v-for="(cat, idx) in homepage.catalogSection.categories"
            :key="cat.id || idx"
            :to="cat.link || '/catalog'"
            @click.capture="handleBlockClick($event, 'catalog', idx)"
            :class="[
              'group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs',
              editOutline('catalog', idx)
            ]"
          >
            <div class="h-28 flex items-center justify-center p-2">
              <img
                :src="resolveAsset(cat.image)"
                :alt="cat.title"
                :class="[
                  'w-auto object-contain transition',
                  cat.compactImage ? 'max-h-[72px] md:max-h-[76px]' : 'max-h-24',
                  cat.roundedImage ? 'rounded' : ''
                ]"
              >
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">{{ cat.title }}</h3>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 4. УСЛУГИ И СЕРВИС                                           -->
    <!-- ============================================================ -->
    <section
      id="services"
      @click.capture="handleBlockClick($event, 'services', 0)"
      :class="['py-12 bg-white', editOutline('services')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: Услуги и сервис
        </span>

        <div class="flex items-center justify-between mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.servicesSection.title }}</h2>
          <router-link
            :to="homepage.servicesSection.allLinkUrl || '/services'"
            class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline shrink-0"
          >
            <span>{{ homepage.servicesSection.allLinkText }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(srv, idx) in homepage.servicesSection.items"
            :key="srv.id || idx"
            @click.capture="handleBlockClick($event, 'services', idx)"
            :class="[
              'p-6 rounded-lg border border-neutral-border bg-white flex flex-col justify-between shadow-xs',
              editOutline('services', idx)
            ]"
          >
            <div>
              <h3 class="font-bold text-sm text-neutral-dark">{{ srv.title }}</h3>
              <p class="text-xs text-neutral-muted mt-2 leading-relaxed">
                {{ srv.description }}
              </p>
            </div>
            <button
              type="button"
              @click="scrollToContacts(srv.contactSubject || srv.title)"
              class="mt-4 text-xs font-semibold text-brand hover:underline text-left cursor-pointer"
            >
              {{ srv.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 4.1. ЛУЧШИЕ ПРЕДЛОЖЕНИЯ                                     -->
    <!-- ============================================================ -->
    <section
      id="all-products"
      @click.capture="handleBlockClick($event, 'featured', 0)"
      :class="['py-12 bg-white', editOutline('featured')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: Лучшие предложения
        </span>

        <div class="mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.featuredSection.title }}</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(item, idx) in homepage.featuredSection.items"
            :key="item.id || idx"
            @click.capture="handleBlockClick($event, 'featured', idx)"
            @click="!showOverlays && router.push(`/product/${item.slug}`)"
            :class="[
              'product-item bg-white rounded-lg border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer',
              editOutline('featured', idx)
            ]"
          >
            <div>
              <div class="h-48 flex items-center justify-center p-3 product-img-box rounded-md mb-4">
                <img :src="featuredImage(item)" :alt="featuredProduct(item).title" class="max-h-40 w-auto object-contain transition">
              </div>
              <div class="text-[11px] text-neutral-muted">Артикул: {{ featuredProduct(item).article }}</div>
              <h3 class="text-base font-bold text-neutral-dark mt-0.5 group-hover:text-brand transition">
                {{ featuredProduct(item).title }}
              </h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                {{ item.description || featuredProduct(item).shortDesc }}
              </p>
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-border">
              <div class="mb-3">
                <span class="text-lg font-bold text-neutral-dark">{{ featuredPrice(item) }}</span>
              </div>
              <router-link
                :to="`/product/${item.slug}`"
                class="block w-full py-2.5 rounded bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition text-center cursor-pointer"
              >
                {{ item.buttonText || 'Подробнее' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 5. ОФИЦИАЛЬНЫЙ ПРЕДСТАВИТЕЛЬ APEKS В РОССИИ                 -->
    <!-- ============================================================ -->
    <section
      @click.capture="handleBlockClick($event, 'about', 0)"
      :class="['py-14 bg-white', editOutline('about')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: О компании
        </span>

        <div class="max-w-3xl mb-10">
          <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.aboutSection.title }}</h2>
          <p class="text-neutral-muted text-xs sm:text-sm mt-3 leading-relaxed">
            {{ homepage.aboutSection.description }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(card, idx) in homepage.aboutSection.cards"
            :key="card.id || idx"
            @click.capture="handleBlockClick($event, 'about', idx)"
            :class="[
              'p-6 rounded-xl border border-neutral-border bg-white shadow-xs flex items-start gap-4',
              editOutline('about', idx)
            ]"
          >
            <svg v-if="card.icon === 'location'" class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="card.icon === 'tradein'" class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3.22 3.22h11.69a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="card.icon === 'shield'" class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.728-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z"/><path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.5-.922 1.5-1.812V11.87a2.25 2.25 0 00-.659-1.591l-2.613-2.613a2.25 2.25 0 00-1.591-.659h-1.537zM19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
            </svg>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-neutral-dark">{{ card.title }}</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                {{ card.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6. APEKS В РАБОТЕ (Видеообзоры)                              -->
    <!-- ============================================================ -->
    <section
      @click.capture="handleBlockClick($event, 'videos', 0)"
      :class="['py-14 bg-white', editOutline('videos')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: APEKS в работе (Видео)
        </span>

        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-3 border-b border-neutral-border">
          <div>
            <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.videosSection.title }}</h2>
            <p class="text-xs text-neutral-muted mt-1">{{ homepage.videosSection.subtitle }}</p>
          </div>
          <button
            type="button"
            @click="scrollToContacts(homepage.videosSection.contactSubject)"
            class="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand hover:bg-[#01556D] border border-brand hover:border-[#01556D] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            {{ homepage.videosSection.buttonText }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(vid, idx) in homepage.videosSection.items"
            :key="vid.id || idx"
            @click.capture="handleBlockClick($event, 'videos', idx)"
            @click="!showOverlays && handleVideoClick(vid)"
            :class="[
              'group cursor-pointer bg-white rounded-xl border border-neutral-border hover:border-brand transition shadow-xs overflow-hidden flex flex-col justify-between',
              editOutline('videos', idx)
            ]"
          >
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img :src="resolveAsset(vid.image)" :alt="vid.title" class="w-full h-full object-cover transition duration-500 opacity-90 group-hover:opacity-100">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-white/95 text-[#016C8A] group-hover:bg-brand group-hover:text-white flex items-center justify-center shadow-lg transition">
                    <svg class="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div v-if="vid.duration" class="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded">
                  {{ vid.duration }}
                </div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark group-hover:text-brand transition">{{ vid.title }}</h3>
                <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                  {{ vid.description }}
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <span class="text-xs font-semibold text-brand">{{ vid.linkText }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6. ЦЕНТР ЗАГРУЗОК                                            -->
    <!-- ============================================================ -->
    <section
      id="downloads"
      @click.capture="handleBlockClick($event, 'downloads', 0)"
      :class="['py-12 bg-white scroll-mt-20 sm:scroll-mt-24', editOutline('downloads')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: Центр загрузок
        </span>

        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-neutral-border">
          <div>
            <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.downloadsSection.title }}</h2>
            <p class="text-xs text-neutral-muted mt-1">{{ homepage.downloadsSection.subtitle }}</p>
          </div>

          <router-link
            :to="homepage.downloadsSection.allLinkUrl || '/instructions'"
            class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline shrink-0"
          >
            <span>{{ homepage.downloadsSection.allLinkText }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(dl, idx) in homepage.downloadsSection.items"
            :key="dl.id || idx"
            @click.capture="handleBlockClick($event, 'downloads', idx)"
            :class="[
              'p-4 rounded-lg bg-white border border-neutral-border flex items-center justify-between shadow-xs',
              editOutline('downloads', idx)
            ]"
          >
            <div>
              <h4 class="text-xs font-bold text-neutral-dark">{{ dl.title }}</h4>
              <p class="text-[11px] text-neutral-muted mt-0.5">{{ dl.subtitle }}</p>
            </div>
            <button
              type="button"
              @click="handleDownload(dl)"
              class="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              {{ dl.buttonText || 'Скачать' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6.5. НОВОСТИ КОМПАНИИ (Карусель)                              -->
    <!-- ============================================================ -->
    <section
      id="news"
      @click.capture="handleBlockClick($event, 'news', 0)"
      :class="['py-14 bg-white scroll-mt-20 sm:scroll-mt-24', editOutline('news')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand/10 text-brand text-[11px] font-bold"
        >
          ✎ Блок: Новости компании
        </span>

        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-3 border-b border-neutral-border">
          <div>
            <h2 class="text-2xl font-bold text-neutral-dark">{{ homepage.newsSection.title }}</h2>
            <p class="text-xs text-neutral-muted mt-1">{{ homepage.newsSection.subtitle }}</p>
          </div>

          <div class="flex items-center gap-1 shrink-0 self-start sm:self-end">
            <button type="button" @click.stop="scrollNews('prev')" id="newsPrevBtn" aria-label="Предыдущие новости"
              class="p-1.5 text-neutral-400 hover:text-brand transition cursor-pointer focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button type="button" @click.stop="scrollNews('next')" id="newsNextBtn" aria-label="Следующие новости"
              class="p-1.5 text-neutral-400 hover:text-brand transition cursor-pointer focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div id="newsCarousel" class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2" style="scrollbar-width: none; -ms-overflow-style: none;">
          <article
            v-for="(item, idx) in homepage.newsSection.items"
            :key="item.id || idx"
            @click.capture="handleBlockClick($event, 'news', idx)"
            :class="[
              'w-[88vw] xs:w-[320px] sm:w-[350px] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start bg-white rounded-xl border border-neutral-border overflow-hidden flex flex-col justify-between shadow-xs',
              editOutline('news', idx)
            ]"
          >
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img :src="resolveAsset(item.image)" :alt="item.title" class="w-full h-full object-cover">
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark leading-snug mb-2">
                  {{ item.title }}
                </h3>
                <p class="text-xs text-neutral-muted leading-relaxed line-clamp-3">
                  {{ item.summary }}
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <button
                type="button"
                @click="handleNewsClick(item)"
                class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                <span>{{ item.buttonText || 'Подробнее' }}</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </article>
        </div>

        <div class="flex items-center justify-center gap-2 mt-6" id="newsCarouselDots">
          <button
            v-for="(item, idx) in homepage.newsSection.items"
            :key="'ndot-' + (item.id || idx)"
            type="button"
            @click.stop="goToNewsSlide(idx)"
            class="news-dot w-2 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all cursor-pointer"
            :aria-label="'Слайд ' + (idx + 1)"
          ></button>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 7. КОНСУЛЬТАЦИЯ И ОБРАТНАЯ СВЯЗЬ                              -->
    <!-- ============================================================ -->
    <section
      id="contacts"
      @click.capture="handleBlockClick($event, 'contacts', 0)"
      :class="['bg-[#070A0F] text-slate-300 py-16 text-xs', editOutline('contacts')]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <span
          v-if="showOverlays"
          class="inline-block mb-3 px-2.5 py-0.5 rounded bg-brand text-white text-[11px] font-bold"
        >
          ✎ Блок: Консультация и контакты
        </span>

        <div class="rounded-2xl bg-[#070A0F] border border-[#1E293B] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl">
          <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div class="lg:col-span-5 space-y-4">
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {{ homepage.contactsSection.title }}
              </h3>
              <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {{ homepage.contactsSection.subtitle }}
              </p>

              <ul class="space-y-2.5 pt-2 text-xs text-slate-200">
                <li
                  v-for="(bullet, idx) in homepage.contactsSection.bullets"
                  :key="idx"
                  class="flex items-center gap-2.5"
                >
                  <svg class="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>{{ bullet }}</span>
                </li>
              </ul>

              <div class="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-white/10">
                <div>
                  <span class="block text-[10px] text-slate-500 uppercase tracking-wider">{{ homepage.contactsSection.phoneLabel }}</span>
                  <a :href="homepage.contactsSection.phoneHref || 'tel:+78005554025'" class="text-white font-bold hover:text-brand transition">
                    {{ homepage.contactsSection.phone }}
                  </a>
                </div>
                <div class="w-px h-6 bg-white/10 hidden sm:block"></div>
                <div>
                  <span class="block text-[10px] text-slate-500 uppercase tracking-wider">{{ homepage.contactsSection.emailLabel }}</span>
                  <a :href="'mailto:' + homepage.contactsSection.email" class="text-white font-bold hover:text-brand transition">
                    {{ homepage.contactsSection.email }}
                  </a>
                </div>
              </div>
            </div>

            <div class="lg:col-span-7">
              <form @submit.prevent="submitContactForm" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-medium text-slate-300 mb-1">
                      Ваше имя <span class="text-brand">*</span>
                    </label>
                    <input
                      v-model="contactForm.name"
                      type="text"
                      placeholder="Например: Алексей"
                      :class="[
                        'w-full h-10 px-3.5 rounded-lg bg-[#121824] border text-white text-xs placeholder-slate-500 focus:outline-none transition',
                        contactErrors.name ? 'border-red-400 focus:border-red-500' : 'border-[#232F42] focus:border-brand'
                      ]"
                    />
                    <p v-if="contactErrors.name" class="text-[11px] text-red-400 mt-1">{{ contactErrors.name }}</p>
                  </div>

                  <div>
                    <label class="block text-[11px] font-medium text-slate-300 mb-1">
                      Телефон <span class="text-brand">*</span>
                    </label>
                    <input
                      :value="contactForm.phone"
                      @keydown="handleContactPhoneKeyDown"
                      @input="handleContactPhoneInput"
                      @blur="validateContactPhone"
                      type="tel"
                      maxlength="18"
                      placeholder="+7 (___) ___-__-__"
                      :class="[
                        'w-full h-10 px-3.5 rounded-lg bg-[#121824] border text-white text-xs placeholder-slate-500 focus:outline-none transition',
                        contactErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-[#232F42] focus:border-brand'
                      ]"
                    />
                    <p v-if="contactErrors.phone" class="text-[11px] text-red-400 mt-1">{{ contactErrors.phone }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-medium text-slate-300 mb-1">
                      Ваш регион / город (необязательно)
                    </label>
                    <input
                      v-model="contactForm.city"
                      type="text"
                      placeholder="Например: Москва"
                      class="w-full h-10 px-3.5 rounded-lg bg-[#121824] border border-[#232F42] focus:border-brand focus:outline-none text-white text-xs placeholder-slate-500 transition"
                    />
                  </div>

                  <div>
                    <label class="block text-[11px] font-medium text-slate-300 mb-1 truncate">
                      Интересующая модель / услуга (необязательно)
                    </label>
                    <input
                      v-model="contactForm.model"
                      type="text"
                      id="consultModelInput"
                      placeholder="Например: AP40 Laser+ или Trade-In"
                      class="w-full h-10 px-3.5 rounded-lg bg-[#121824] border border-[#232F42] focus:border-brand focus:outline-none text-white text-xs placeholder-slate-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-medium text-slate-300 mb-1">
                    Ваш вопрос (необязательно)
                  </label>
                  <textarea
                    v-model="contactForm.comment"
                    rows="2"
                    placeholder="Опишите задачу, условия работы или требования к точности..."
                    class="w-full p-3 rounded-lg bg-[#121824] border border-[#232F42] focus:border-brand focus:outline-none text-white text-xs placeholder-slate-500 transition resize-none"
                  ></textarea>
                </div>

                <div v-if="contactSuccess" class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
                  Заявка принята! Менеджер отдела продаж свяжется с вами в течение 15 минут.
                </div>

                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div>
                    <label class="flex items-center gap-2.5 text-[11px] text-slate-400 cursor-pointer group">
                      <input
                        v-model="contactForm.agree"
                        type="checkbox"
                        class="w-4 h-4 rounded border-[#232F42] text-brand focus:ring-brand accent-[#016C8A] hover:border-brand transition cursor-pointer shrink-0 shadow-xs"
                      />
                      <span class="group-hover:text-slate-300 transition">Я согласен на обработку моих персональных данных в соответствии с <router-link to="/privacy" class="text-brand hover:underline font-semibold transition" @click.stop>политикой конфиденциальности</router-link></span>
                    </label>
                    <p v-if="contactErrors.agree" class="text-[11px] text-red-400 mt-1 pl-6.5">{{ contactErrors.agree }}</p>
                  </div>

                  <button
                    type="submit"
                    class="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-brand hover:bg-[#01556D] text-white font-semibold text-xs tracking-wide transition shadow-md whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Оставить заявку
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
