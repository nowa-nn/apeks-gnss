<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useFormValidation } from '../composables/useFormValidation.js';
import { useRouter } from 'vue-router';

const router = useRouter();

// ============================================================
// Hero Slider Functionality
// ============================================================
let currentHeroSlide = 0;
let heroInterval = null;

function showHeroSlide(index) {
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  if (!heroSlides.length) return;

  currentHeroSlide = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach((slide, i) => {
    if (i === currentHeroSlide) {
      slide.classList.remove('opacity-0', 'pointer-events-none');
      slide.classList.add('opacity-100', 'z-10');
    } else {
      slide.classList.remove('opacity-100', 'z-10');
      slide.classList.add('opacity-0', 'pointer-events-none');
    }
  });

  heroDots.forEach((dot, i) => {
    if (i === currentHeroSlide) {
      dot.className = 'hero-dot w-8 h-2 rounded-full transition-all duration-300 bg-white shadow-sm focus:outline-none';
    } else {
      dot.className = 'hero-dot w-2.5 h-2 rounded-full transition-all duration-300 bg-white/40 hover:bg-white/70 focus:outline-none';
    }
  });
}

function nextHeroSlide() {
  showHeroSlide(currentHeroSlide + 1);
}

function prevHeroSlide() {
  showHeroSlide(currentHeroSlide - 1);
}

function goToHeroSlide(index) {
  showHeroSlide(index);
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  heroInterval = setInterval(nextHeroSlide, 6500);
}

function stopHeroAutoplay() {
  if (heroInterval) {
    clearInterval(heroInterval);
    heroInterval = null;
  }
}

// ==========================================
// News Carousel
// ==========================================
function scrollNews(direction) {
  const track = document.getElementById('newsCarousel');
  if (!track) return;
  const card = track.querySelector('article');
  const step = card ? (card.offsetWidth + 24) : 360;
  track.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
}

function goToNewsSlide(index) {
  const track = document.getElementById('newsCarousel');
  const dots = document.querySelectorAll('.news-dot');
  if (!track || !dots.length) return;
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= 0) return;
  const targetScroll = (index / (dots.length - 1)) * maxScroll;
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

  if (maxScroll > 5) {
    const ratio = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const activeIdx = Math.round(ratio * (dots.length - 1));

    dots.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.className = 'news-dot w-6 h-1.5 rounded-full bg-brand transition-all';
      } else {
        dot.className = 'news-dot w-2 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all';
      }
    });

    if (prevBtn) prevBtn.disabled = scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = scrollLeft >= maxScroll - 2;
  } else {
    dots.forEach((dot, idx) => {
      dot.className = (idx === 0) ? 'news-dot w-6 h-1.5 rounded-full bg-brand transition-all' : 'news-dot w-2 h-1.5 rounded-full bg-neutral-300 transition-all';
    });
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
  }
}

const {
  onPhoneKeyDown,
  onPhoneInput,
  validatePhoneNumber
} = useFormValidation();

const contactForm = ref({
  name: '',
  phone: '',
  city: '',
  model: '',
  comment: '',
  agree: false
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
    set value(v) { contactForm.value.phone = v; }
  };
  onPhoneKeyDown(e, phoneRef, () => {
    if (contactErrors.value.phone) validateContactPhone();
  });
}

function handleContactPhoneInput(e) {
  const phoneRef = {
    get value() { return contactForm.value.phone; },
    set value(v) { contactForm.value.phone = v; }
  };
  onPhoneInput(e, phoneRef, () => {
    if (contactErrors.value.phone) validateContactPhone();
  });
}

function submitContactForm(e) {
  if (e) e.preventDefault();
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
    agree: false
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
  // Expose to window for inline HTML onclick handlers
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
});
</script>

<template>
  <div>
    <!-- ============================================================ -->
    <!-- 2. HERO PROMO SLIDER                                         -->
    <!-- ============================================================ -->
    <section class="bg-white pt-0 pb-3 md:pt-6 md:pb-4">
      <div class="w-full md:max-w-7xl md:mx-auto px-0 md:px-8">
        <div id="heroSlider" @mouseenter="stopHeroAutoplay" @mouseleave="startHeroAutoplay" class="hero-boxed-slider relative w-full overflow-hidden hero-banner-wrap rounded-none md:rounded-2xl h-[570px] xs:h-[600px] sm:h-[630px] md:h-auto shadow-sm md:shadow-md">

          <!-- SLIDE 1: APEKS AP30 Laser -->
          <div class="hero-slide absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out opacity-100 z-10 flex flex-col md:flex-row md:items-center bg-[#080d1c]">
            <div class="relative w-full h-[290px] xs:h-[310px] sm:h-[340px] md:h-full md:absolute md:inset-0 pointer-events-none overflow-hidden flex md:justify-end">
              <picture class="w-full h-full block">
                <source type="image/webp" srcset="assets/banner-1-2-1.webp">
                <img src="assets/banner-1-2-1.png" alt="APEKS AP30 Laser" width="1920" height="800" fetchpriority="high" class="w-full h-full object-cover object-[80%_center] md:object-[right_center] hero-mask-mobile">
              </picture>
              <div class="absolute inset-x-0 bottom-0 h-28 sm:h-32 bg-gradient-to-b from-transparent via-[#080d1c]/80 to-[#080d1c] pointer-events-none md:hidden"></div>
            </div>

            <div class="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-1 pb-10 md:py-0">
              <div class="max-w-md sm:max-w-lg space-y-3.5 md:space-y-4 text-white">
                <h1 class="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  APEKS AP30 Laser
                </h1>
                <p class="text-slate-200 text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-sm sm:max-w-md">
                  Компактный GNSS RTK-приемник с зеленым лазерным дальномером до 10 метров, визуальной AR-разбивкой и IMU 120°. Высокоточные измерения недоступных объектов без вехи в любых полевых условиях.
                </p>
                <div class="pt-1 md:pt-2">
                  <router-link to="/product/apeks_ap30" class="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 rounded-md md:rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-xs md:text-sm transition shadow-sm">
                    <span>Смотреть в каталоге</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- SLIDE 2: APEKS AP10 -->
          <div class="hero-slide absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out opacity-0 pointer-events-none flex flex-col md:flex-row md:items-center bg-[#060608]">
            <div class="relative w-full h-[290px] xs:h-[310px] sm:h-[340px] md:h-full md:absolute md:inset-0 pointer-events-none overflow-hidden flex md:justify-end">
              <picture class="w-full h-full block">
                <source media="(min-width: 768px)" type="image/webp" srcset="assets/image_2026-10-22_19-50-55.webp">
                <source media="(min-width: 768px)" srcset="assets/image_2026-10-22_19-50-55.png">
                <source type="image/webp" srcset="assets/image_2026-10-22_18-07-40.webp">
                <img src="assets/image_2026-10-22_18-07-40.png" alt="APEKS AP10" width="2560" height="1173" loading="lazy" class="w-full h-full object-cover object-center md:object-[right_center] hero-mask-mobile">
              </picture>
              <div class="absolute inset-x-0 bottom-0 h-28 sm:h-32 bg-gradient-to-b from-transparent via-[#060608]/80 to-[#060608] pointer-events-none md:hidden"></div>
            </div>

            <div class="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-1 pb-10 md:py-0">
              <div class="max-w-md sm:max-w-lg space-y-3.5 md:space-y-4 text-white">
                <h2 class="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  APEKS AP10
                </h2>
                <p class="text-slate-200 text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-sm sm:max-w-md">
                  Компактный многоканальный GNSS-приемник на передовой аппаратной платформе. Поддержка всех спутниковых созвездий, IMU 120° без калибровки и стабильный сантиметровый RTK в любых полевых условиях.
                </p>
                <div class="pt-1 md:pt-2">
                  <router-link to="/product/ap10" class="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 rounded-md md:rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-xs md:text-sm transition shadow-sm">
                    <span>Смотреть в каталоге</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- SLIDE 3: APEKS AP80 PRO -->
          <div class="hero-slide absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out opacity-0 pointer-events-none flex flex-col md:flex-row md:items-center bg-[#0d1d4d]">
            <div class="relative w-full h-[290px] xs:h-[310px] sm:h-[340px] md:h-full md:absolute md:inset-0 pointer-events-none overflow-hidden flex md:justify-end">
              <picture class="w-full h-full block">
                <source type="image/webp" srcset="assets/dddeb846-d345-4862-b238-c5db85fb56a9.webp">
                <img src="assets/dddeb846-d345-4862-b238-c5db85fb56a9.png" alt="APEKS AP80 PRO" width="1920" height="800" loading="lazy" class="w-full h-full object-cover object-[80%_center] md:object-[right_center] hero-mask-mobile">
              </picture>
              <div class="absolute inset-x-0 bottom-0 h-28 sm:h-32 bg-gradient-to-b from-transparent via-[#0d1d4d]/80 to-[#0d1d4d] pointer-events-none md:hidden"></div>
            </div>

            <div class="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-1 pb-10 md:py-0">
              <div class="max-w-md sm:max-w-lg space-y-3.5 md:space-y-4 text-white">
                <h2 class="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  APEKS AP80 PRO
                </h2>
                <p class="text-slate-200 text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-sm sm:max-w-md">
                  Флагманский спутниковый GNSS-приемник с системой двойных камер, фотограмметрией и лазерным дальномером. Съемка в дополненной реальности AR и 3D-моделирование объектов.
                </p>
                <div class="pt-1 md:pt-2">
                  <router-link to="/product/ap80-pro" class="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 rounded-md md:rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-xs md:text-sm transition shadow-sm">
                    <span>Смотреть в каталоге</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Dots -->
          <div class="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            <button onclick="goToHeroSlide(0)" class="hero-dot w-8 h-2 rounded-full transition-all duration-300 bg-white shadow-sm focus:outline-none" aria-label="Слайд 1"></button>
            <button onclick="goToHeroSlide(1)" class="hero-dot w-2.5 h-2 rounded-full transition-all duration-300 bg-white/40 hover:bg-white/70 focus:outline-none" aria-label="Слайд 2"></button>
            <button onclick="goToHeroSlide(2)" class="hero-dot w-2.5 h-2 rounded-full transition-all duration-300 bg-white/40 hover:bg-white/70 focus:outline-none" aria-label="Слайд 3"></button>
          </div>

        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 3. КАТАЛОГ ОБОРУДОВАНИЯ                                      -->
    <!-- ============================================================ -->
    <section id="cat-grid" class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="mb-8 pb-3 border-b border-neutral-border flex items-center justify-between">
          <h2 class="text-2xl font-bold text-neutral-dark">Каталог оборудования</h2>
          <router-link to="/catalog" class="hidden md:inline-flex items-center justify-center px-5 py-2 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-[13px] font-semibold border border-brand hover:border-[#01556D] transition shadow-xs">
            Смотреть все
          </router-link>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          <!-- 1. Смотреть все (только для мобильных устройств, в верхнем ряду слева, одинакового размера с остальными) -->
          <router-link to="/catalog" class="md:hidden group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/image_2026-10-22_18-56-56.png" alt="Смотреть все" class="max-h-[70px] w-auto object-contain group-hover:scale-105 transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Смотреть все</h3>
          </router-link>
          
          <!-- 2. ГНСС-приемники -->
          <router-link to="/catalog?category=ГНСС-приёмники" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/ap40_laser.png" alt="ГНСС-приемники" class="max-h-24 w-auto object-contain group-hover:scale-105 transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">ГНСС-приемники</h3>
          </router-link>

          <!-- 3. Нивелиры и уровни -->
          <router-link to="/catalog?category=levels" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/3-Photoroom (1).png" alt="Нивелиры и уровни" class="max-h-20 w-auto object-contain group-hover:scale-105 transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Нивелиры и уровни</h3>
          </router-link>

          <!-- 4. Контроллеры -->
          <router-link to="/catalog?category=Контроллеры и планшеты" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/cs3i_controller.png" alt="Контроллеры" class="max-h-24 w-auto object-contain group-hover:scale-105 transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Контроллеры</h3>
          </router-link>

          <!-- 5. Тахеометры -->
          <router-link to="/catalog?category=Тахеометры" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/total_station.jpg" alt="Тахеометры" class="max-h-24 w-auto object-contain group-hover:scale-105 transition rounded">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Тахеометры</h3>
          </router-link>

          <!-- 6. Радиосвязь -->
          <router-link to="/catalog?category=Радиосвязь" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/adl35_radio.png" alt="Радиосвязь" class="max-h-24 w-auto object-contain group-hover:scale-105 transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Радиосвязь</h3>
          </router-link>

          <!-- 7. Аксессуары -->
          <router-link to="/catalog?category=GNSS-датчики и антенны" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/accessories_prism.jpg" alt="Геодезические аксессуары" class="max-h-24 w-auto object-contain group-hover:scale-105 transition rounded">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Аксессуары</h3>
          </router-link>

          <!-- 8. Полевое ПО (для десктопа в ряд справа, для мобильных в нижний ряд справа) -->
          <router-link to="/catalog?category=Полевое ПО" class="group p-3 sm:p-4 rounded-lg border border-neutral-border hover:border-brand transition bg-white text-center flex flex-col justify-between hover:shadow-xs">
            <div class="h-28 flex items-center justify-center p-2">
              <img src="assets/client_title_software_apeksurv_cut.png" alt="Полевое ПО" class="max-h-[72px] md:max-h-[76px] w-auto object-contain group-hover:scale-105 transition">
            </div>
            <h3 class="text-xs font-semibold text-neutral-dark group-hover:text-brand transition mt-2">Полевое ПО</h3>
          </router-link>
        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 4. УСЛУГИ И СЕРВИС                                           -->
    <!-- ============================================================ -->
    <section id="services" class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-2xl font-bold text-neutral-dark">Услуги и сервис</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="p-6 rounded-lg border border-neutral-border bg-white flex flex-col justify-between shadow-xs">
            <div>
              <h3 class="font-bold text-sm text-neutral-dark">Бесплатный тест-драйв</h3>
              <p class="text-xs text-neutral-muted mt-2 leading-relaxed">
                Предоставление оборудования на 3 дня на ваш реальный объект для проверки точности.
              </p>
            </div>
            <button @click="scrollToContacts('Заявка на бесплатный тест-драйв')" class="mt-4 text-xs font-semibold text-brand hover:underline text-left cursor-pointer">
              Заказать выезд
            </button>
          </div>

          <div class="p-6 rounded-lg border border-neutral-border bg-white flex flex-col justify-between shadow-xs">
            <div>
              <h3 class="font-bold text-sm text-neutral-dark">Сервисное обслуживание</h3>
              <p class="text-xs text-neutral-muted mt-2 leading-relaxed">
                Ремонт и обслуживание геодезического оборудования любой сложности.
              </p>
            </div>
            <button @click="scrollToContacts('Заявка на сервисное обслуживание')" class="mt-4 text-xs font-semibold text-brand hover:underline text-left cursor-pointer">
              Сдать на диагностику
            </button>
          </div>

          <div class="p-6 rounded-lg border border-neutral-border bg-white flex flex-col justify-between shadow-xs">
            <div>
              <h3 class="font-bold text-sm text-neutral-dark">Выгодный Trade-In</h3>
              <p class="text-xs text-neutral-muted mt-2 leading-relaxed">
                Обмен устаревших приборов любых брендов со скидкой на новое оборудование APEKS.
              </p>
            </div>
            <button @click="scrollToContacts('Заявка на оценку Trade-In')" class="mt-4 text-xs font-semibold text-brand hover:underline text-left cursor-pointer">
              Оценить прибор
            </button>
          </div>

          <div class="p-6 rounded-lg border border-neutral-border bg-white flex flex-col justify-between shadow-xs">
            <div>
              <h3 class="font-bold text-sm text-neutral-dark">Кредит и рассрочка</h3>
              <p class="text-xs text-neutral-muted mt-2 leading-relaxed">
                Программы для ИП, физических и юридических лиц
              </p>
            </div>
            <button @click="scrollToContacts('Заявка на кредит и рассрочку')" class="mt-4 text-xs font-semibold text-brand hover:underline text-left cursor-pointer">
              Рассчитать график
            </button>
          </div>

        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 4.1. ЛУЧШИЕ ПРЕДЛОЖЕНИЯ (С прямыми ссылками на товары)        -->
    <!-- ============================================================ -->
    <section id="all-products" class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="mb-8 pb-3 border-b border-neutral-border">
          <h2 class="text-2xl font-bold text-neutral-dark">Лучшие предложения</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <!-- Card 1: AP80 PRO -->
          <div 
            @click="router.push('/product/ap80-pro')" 
            class="product-item bg-white rounded-lg border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer"
          >
            <div>
              <div class="h-48 flex items-center justify-center p-3 product-img-box rounded-md mb-4">
                <img src="assets/client_title_apeks_ap80.png" alt="APEKS AP80 PRO" class="max-h-40 w-auto object-contain group-hover:scale-105 transition">
              </div>
              <div class="text-[11px] text-neutral-muted">Артикул: AP-80-PRO</div>
              <h3 class="text-base font-bold text-neutral-dark mt-0.5 group-hover:text-brand transition">APEKS AP80 PRO</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Флагманский RTK-приемник с фотограмметрией, лазерным дальномером и компенсацией наклона IMU 120°.
              </p>
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-border">
              <div class="mb-3">
                <span class="text-lg font-bold text-neutral-dark">249 000 ₽</span>
              </div>
              <router-link to="/product/ap80-pro" class="block w-full py-2.5 rounded bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition text-center cursor-pointer">
                Подробнее
              </router-link>
            </div>
          </div>

          <!-- Card 2: AP40 Laser+ -->
          <div 
            @click="router.push('/product/ap40-laser-plus')" 
            class="product-item bg-white rounded-lg border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer"
          >
            <div>
              <div class="h-48 flex items-center justify-center p-3 product-img-box rounded-md mb-4">
                <img src="assets/client_title_apeks_ap40.png" alt="APEKS AP40 Laser+" class="max-h-40 w-auto object-contain group-hover:scale-105 transition">
              </div>
              <div class="text-[11px] text-neutral-muted">Артикул: AP-40L-PLUS</div>
              <h3 class="text-base font-bold text-neutral-dark mt-0.5 group-hover:text-brand transition">APEKS AP40 Laser+</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Приемник со встроенным лазерным дальномером до 120 м для съемки недоступных точек без вехи.
              </p>
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-border">
              <div class="mb-3">
                <span class="text-lg font-bold text-neutral-dark">199 000 ₽</span>
              </div>
              <router-link to="/product/ap40-laser-plus" class="block w-full py-2.5 rounded bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition text-center cursor-pointer">
                Подробнее
              </router-link>
            </div>
          </div>

          <!-- Card 3: AP20 AR -->
          <div 
            @click="router.push('/product/ap20-ar')" 
            class="product-item bg-white rounded-lg border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer"
          >
            <div>
              <div class="h-48 flex items-center justify-center p-3 product-img-box rounded-md mb-4">
                <img src="assets/client_title_apeks_ap20ar.png" alt="APEKS AP20 AR" class="max-h-40 w-auto object-contain group-hover:scale-105 transition">
              </div>
              <div class="text-[11px] text-neutral-muted">Артикул: AP-20-AR</div>
              <h3 class="text-base font-bold text-neutral-dark mt-0.5 group-hover:text-brand transition">APEKS AP20 AR</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Приемник с камерой для визуальной разбивки в дополненной реальности и IMU до 120°.
              </p>
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-border">
              <div class="mb-3">
                <span class="text-lg font-bold text-neutral-dark">129 000 ₽</span>
              </div>
              <router-link to="/product/ap20-ar" class="block w-full py-2.5 rounded bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition text-center cursor-pointer">
                Подробнее
              </router-link>
            </div>
          </div>

          <!-- Card 4: AP10 -->
          <div 
            @click="router.push('/product/ap10')" 
            class="product-item bg-white rounded-lg border border-neutral-border hover:border-brand transition p-5 flex flex-col justify-between hover:shadow-xs group cursor-pointer"
          >
            <div>
              <div class="h-48 flex items-center justify-center p-3 product-img-box rounded-md mb-4">
                <img src="assets/client_title_apeks_ap10.png" alt="APEKS AP10" class="max-h-40 w-auto object-contain group-hover:scale-105 transition">
              </div>
              <div class="text-[11px] text-neutral-muted">Артикул: AP-10</div>
              <h3 class="text-base font-bold text-neutral-dark mt-0.5 group-hover:text-brand transition">APEKS AP10</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Легкий и экономичный многоканальный GNSS-приемник для кадастровых и топографических съемок.
              </p>
            </div>

            <div class="pt-4 mt-4 border-t border-neutral-border">
              <div class="mb-3">
                <span class="text-lg font-bold text-neutral-dark">99 000 ₽</span>
              </div>
              <router-link to="/product/ap10" class="block w-full py-2.5 rounded bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition text-center cursor-pointer">
                Подробнее
              </router-link>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 5. ОФИЦИАЛЬНЫЙ ПРЕДСТАВИТЕЛЬ APEKS В РОССИИ                 -->
    <!-- ============================================================ -->
    <section class="py-14 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="max-w-3xl mb-10">
          <h2 class="text-2xl font-bold text-neutral-dark">Официальный представитель APEKS в России</h2>
          <p class="text-neutral-muted text-xs sm:text-sm mt-3 leading-relaxed">
            Мы — единственный официальный представитель APEKS в России. Оборудование APEKS разработано специально для геодезии, строительства, инженерных изысканий, кадастра и картографии. Исключительная эффективность — не значит дорого! Наша миссия — оборудование, которое сочетает превосходное качество и доступность для каждого.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl border border-neutral-border bg-white shadow-xs flex items-start gap-4">
            <svg class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-neutral-dark">Работаем на всей территории страны</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Без посредников и дополнительных издержек, и это положительно сказывается на наших ценах.
              </p>
            </div>
          </div>

          <div class="p-6 rounded-xl border border-neutral-border bg-white shadow-xs flex items-start gap-4">
            <svg class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3.22 3.22h11.69a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-neutral-dark">Трейд-ин, выгодные цены и акции</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Честный трейд-ин, выгодные условия обмена, доступные цены и широкий ассортимент продукции.
              </p>
            </div>
          </div>

          <div class="p-6 rounded-xl border border-neutral-border bg-white shadow-xs flex items-start gap-4">
            <svg class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.728-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-neutral-dark">Высокое качество, гарантия и поддержка</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Поддерживаем лучшее качество, предлагаем поддержку высокой квалификации на всех этапах сотрудничества.
              </p>
            </div>
          </div>

          <div class="p-6 rounded-xl border border-neutral-border bg-white shadow-xs flex items-start gap-4">
            <svg class="w-6 h-6 text-[#016C8A] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z"/><path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.5-.922 1.5-1.812V11.87a2.25 2.25 0 00-.659-1.591l-2.613-2.613a2.25 2.25 0 00-1.591-.659h-1.537zM19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
            </svg>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-neutral-dark">Логистика глобального масштаба</h3>
              <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                Осуществляем безопасную и быструю доставку в любую точку России и ближнего зарубежья.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6. APEKS В РАБОТЕ (Видеообзоры)                              -->
    <!-- ============================================================ -->
    <section class="py-14 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-3 border-b border-neutral-border">
          <div>
            <h2 class="text-2xl font-bold text-neutral-dark">APEKS в работе</h2>
            <p class="text-xs text-neutral-muted mt-1">Реальные полевые испытания, обзоры функционала и демонстрация работы оборудования в суровых условиях.</p>
          </div>
          <button @click="scrollToContacts('Запрос демонстрационных видео')" class="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand hover:bg-[#01556D] border border-brand hover:border-[#01556D] text-white text-xs font-semibold transition shadow-xs cursor-pointer">
            Все видео
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div @click="scrollToContacts('Видео: Оборудование APEKS')" class="group cursor-pointer bg-white rounded-xl border border-neutral-border hover:border-brand transition shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/video_preview_lineup.jpg" alt="Оборудование APEKS" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-white/95 text-[#016C8A] group-hover:bg-brand group-hover:text-white flex items-center justify-center shadow-lg transition transform group-hover:scale-110">
                    <svg class="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded">2 мин</div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark group-hover:text-brand transition">Оборудование APEKS</h3>
                <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                  Обзор линейки спутниковых RTK-приемников, контроллеров и программного обеспечения ApekSurv.
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <span class="text-xs font-semibold text-brand">Смотреть обзор</span>
            </div>
          </div>

          <div @click="scrollToContacts('Видео: APEKS AP20 AR')" class="group cursor-pointer bg-white rounded-xl border border-neutral-border hover:border-brand transition shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/video_preview_ap20ar.jpg" alt="APEKS AP20 AR" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-white/95 text-[#016C8A] group-hover:bg-brand group-hover:text-white flex items-center justify-center shadow-lg transition transform group-hover:scale-110">
                    <svg class="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded">33 с</div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark group-hover:text-brand transition">APEKS AP20 AR</h3>
                <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                  Разбивка по стрелкам на экране контроллера: визуальный вынос точек в натуру с дополненной реальностью.
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <span class="text-xs font-semibold text-brand">Смотреть демонстрацию</span>
            </div>
          </div>

          <div @click="scrollToContacts('Видео: APEKS AP40 Laser+')" class="group cursor-pointer bg-white rounded-xl border border-neutral-border hover:border-brand transition shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/video_preview_ap40laser.jpg" alt="APEKS AP40 Laser+" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-white/95 text-[#016C8A] group-hover:bg-brand group-hover:text-white flex items-center justify-center shadow-lg transition transform group-hover:scale-110">
                    <svg class="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded">45 с</div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark group-hover:text-brand transition">APEKS AP40 Laser+</h3>
                <p class="text-xs text-neutral-muted mt-1.5 leading-relaxed">
                  Лазерный дальномер 120 м и две камеры: высокоточные измерения без вехи в труднодоступных местах.
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <span class="text-xs font-semibold text-brand">Смотреть полевой тест</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6. ЦЕНТР ЗАГРУЗОК (Инструкции и программное обеспечение)     -->
    <!-- ============================================================ -->
    <section id="downloads" class="py-12 bg-white scroll-mt-20 sm:scroll-mt-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-neutral-border">
          <div>
            <h2 class="text-2xl font-bold text-neutral-dark">Инструкции и программное обеспечение</h2>
            <p class="text-xs text-neutral-muted mt-1">Документация, руководства пользователя и актуальные версии прошивок</p>
          </div>
          
          <router-link 
            to="/catalog?category=software" 
            class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline shrink-0"
          >
            <span>Все инструкции</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div class="p-4 rounded-lg bg-white border border-neutral-border flex items-center justify-between shadow-xs">
            <div>
              <h4 class="text-xs font-bold text-neutral-dark">ApekSurv Android v2.4.1</h4>
              <p class="text-[11px] text-neutral-muted mt-0.5">Полевое ПО на русском языке • APK</p>
            </div>
            <button 
              type="button"
              @click="handleDownload('ApekSurv Android APK')" 
              class="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Скачать
            </button>
          </div>

          <div class="p-4 rounded-lg bg-white border border-neutral-border flex items-center justify-between shadow-xs">
            <div>
              <h4 class="text-xs font-bold text-neutral-dark">Каталог оборудования 2026</h4>
              <p class="text-[11px] text-neutral-muted mt-0.5">Технические спецификации • PDF</p>
            </div>
            <button 
              type="button"
              @click="handleDownload('Каталог оборудования 2026 PDF')" 
              class="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Скачать
            </button>
          </div>

          <div class="p-4 rounded-lg bg-white border border-neutral-border flex items-center justify-between shadow-xs">
            <div>
              <h4 class="text-xs font-bold text-neutral-dark">Файлы калибровок ANTEX</h4>
              <p class="text-[11px] text-neutral-muted mt-0.5">Калибровки фазовых центров • ZIP</p>
            </div>
            <button 
              type="button"
              @click="handleDownload('Файлы калибровок ANTEX ZIP')" 
              class="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Скачать
            </button>
          </div>

        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 6.5. НОВОСТИ КОМПАНИИ (Карусель)                              -->
    <!-- ============================================================ -->
    <section id="news" class="py-14 bg-white scroll-mt-20 sm:scroll-mt-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-3 border-b border-neutral-border">
          <div>
            <h2 class="text-2xl font-bold text-neutral-dark">Новости компании</h2>
            <p class="text-xs text-neutral-muted mt-1">Главные события, полевые испытания и технологические разработки APEKS GNSS</p>
          </div>

          <div class="flex items-center gap-1 shrink-0 self-start sm:self-end">
            <button type="button" @click="scrollNews('prev')" id="newsPrevBtn" aria-label="Предыдущие новости"
              class="p-1.5 text-neutral-400 hover:text-brand transition cursor-pointer focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button type="button" @click="scrollNews('next')" id="newsNextBtn" aria-label="Следующие новости"
              class="p-1.5 text-neutral-400 hover:text-brand transition cursor-pointer focus:outline-none disabled:opacity-20 disabled:cursor-not-allowed">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div id="newsCarousel" class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2" style="scrollbar-width: none; -ms-overflow-style: none;">
          <article class="w-[88vw] xs:w-[320px] sm:w-[350px] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start bg-white rounded-xl border border-neutral-border overflow-hidden flex flex-col justify-between shadow-xs">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/news_gnss_battle_2026.jpg" alt="GNSS Battle 2026" class="w-full h-full object-cover">
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark leading-snug mb-2">
                  Компания APEKS GNSS выставила 7 приемников на соревнование GNSS Battle 2026
                </h3>
                <p class="text-xs text-neutral-muted leading-relaxed line-clamp-3">
                  На всероссийских независимых полевых испытаниях в сложных условиях под Истрой компания APEKS представила 7 приемников. AP80 Pro завоевал 1-е место (Гран-при).
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <button type="button" @click="scrollToContacts('GNSS Battle 2026')" class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer">
                <span>Подробнее</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </article>

          <article class="w-[88vw] xs:w-[320px] sm:w-[350px] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start bg-white rounded-xl border border-neutral-border overflow-hidden flex flex-col justify-between shadow-xs">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/news_intergeo_2026.jpg" alt="INTERGEO 2026" class="w-full h-full object-cover">
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark leading-snug mb-2">
                  Премьера флагманских систем APEKS на всемирной выставке INTERGEO 2026
                </h3>
                <p class="text-xs text-neutral-muted leading-relaxed line-clamp-3">
                  В Мессе Мюнхен на ведущем мировом геодезическом форуме стенд APEKS посетили более 3 000 специалистов. Представлены новинки с технологией AR и лазером.
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <button type="button" @click="scrollToContacts('INTERGEO 2026')" class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer">
                <span>Подробнее</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </article>

          <article class="w-[88vw] xs:w-[320px] sm:w-[350px] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start bg-white rounded-xl border border-neutral-border overflow-hidden flex flex-col justify-between shadow-xs">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/news_service_network.jpg" alt="Сервисная сеть APEKS" class="w-full h-full object-cover">
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark leading-snug mb-2">
                  Расширение сети авторизованных сервисных центров APEKS в РФ
                </h3>
                <p class="text-xs text-neutral-muted leading-relaxed line-clamp-3">
                  Официальное представительство открыло новые сертифицированные лаборатории метрологической поверки и гарантийного ремонта в 12 крупных регионах.
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <button type="button" @click="scrollToContacts('Сервисные центры APEKS')" class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer">
                <span>Подробнее</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </article>

          <article class="w-[88vw] xs:w-[320px] sm:w-[350px] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start bg-white rounded-xl border border-neutral-border overflow-hidden flex flex-col justify-between shadow-xs">
            <div>
              <div class="relative h-48 sm:h-52 overflow-hidden bg-neutral-dark">
                <img src="assets/news_apeksurv_update.jpg" alt="ApekSurv Update" class="w-full h-full object-cover">
              </div>
              <div class="p-5">
                <h3 class="font-bold text-sm sm:text-base text-neutral-dark leading-snug mb-2">
                  Масштабное обновление софта ApekSurv: поддержка IFC, BIM и МСК
                </h3>
                <p class="text-xs text-neutral-muted leading-relaxed line-clamp-3">
                  В релизе ApekSurv 3.8.4 Pro добавлены: прямой импорт 3D-моделей BIM/IFC, калибровка местных систем координат и режим выноса точек в видео 60 fps.
                </p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0">
              <button type="button" @click="scrollToContacts('ПО ApekSurv Pro')" class="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer">
                <span>Подробнее</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </article>
        </div>

        <div class="flex items-center justify-center gap-2 mt-6" id="newsCarouselDots">
          <button type="button" @click="goToNewsSlide(0)" class="news-dot w-6 h-1.5 rounded-full bg-brand transition-all cursor-pointer" aria-label="Слайд 1"></button>
          <button type="button" @click="goToNewsSlide(1)" class="news-dot w-2 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all cursor-pointer" aria-label="Слайд 2"></button>
          <button type="button" @click="goToNewsSlide(2)" class="news-dot w-2 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all cursor-pointer" aria-label="Слайд 3"></button>
          <button type="button" @click="goToNewsSlide(3)" class="news-dot w-2 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400 transition-all cursor-pointer" aria-label="Слайд 4"></button>
        </div>

      </div>
    </section>

    <!-- ============================================================ -->
    <!-- 7. КОНСУЛЬТАЦИЯ И ОБРАТНАЯ СВЯЗЬ                              -->
    <!-- ============================================================ -->
    <section id="contacts" class="bg-[#070A0F] text-slate-300 py-16 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        <div class="rounded-2xl bg-[#070A0F] border border-[#1E293B] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl">
          <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div class="lg:col-span-5 space-y-4">
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Остались вопросы или трудно выбрать?
              </h3>
              <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Заполните форму — наши сертифицированные инженеры проконсультируют вас и подберут оптимальный комплект оборудования под ваши задачи.
              </p>

              <ul class="space-y-2.5 pt-2 text-xs text-slate-200">
                <li class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>Свяжемся в течение 15 минут и уточним задачу</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>Ответим на технические вопросы по приборам и софту</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <svg class="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>Пришлем расчет стоимости и коммерческое предложение</span>
                </li>
              </ul>

              <div class="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-white/10">
                <div>
                  <span class="block text-[10px] text-slate-500 uppercase tracking-wider">Отдел продаж</span>
                  <a href="tel:+78005554025" class="text-white font-bold hover:text-brand transition">8 (800) 555-40-25</a>
                </div>
                <div class="w-px h-6 bg-white/10 hidden sm:block"></div>
                <div>
                  <span class="block text-[10px] text-slate-500 uppercase tracking-wider">Электронная почта</span>
                  <a href="mailto:info@apeksgnss.ru" class="text-white font-bold hover:text-brand transition">info@apeksgnss.ru</a>
                </div>
              </div>
            </div>

            <div class="lg:col-span-7">
              <form @submit.prevent="submitContactForm" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Name -->
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

                  <!-- Phone -->
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
                  <!-- Region / City (optional) -->
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

                  <!-- Interested Model / Service (optional) -->
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

                <!-- Question / Comment (optional) -->
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

                <!-- Success Banner -->
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
