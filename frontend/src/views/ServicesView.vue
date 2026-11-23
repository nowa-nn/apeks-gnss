<script setup>
import { ref, onMounted } from 'vue';
import { services } from '../data/services.js';

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Modal state
const isModalOpen = ref(false);
const activeService = ref(null);
const isSubmitted = ref(false);

const formData = ref({
  name: '',
  phone: '',
  company: '',
  city: '',
  comment: '',
  agree: false
});

function openServiceModal(service) {
  activeService.value = service;
  isSubmitted.value = false;
  formData.value = {
    name: '',
    phone: '',
    company: '',
    city: '',
    comment: '',
    agree: true
  };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  activeService.value = null;
  isSubmitted.value = false;
}

function submitServiceRequest() {
  if (!formData.value.name || !formData.value.phone) return;

  const payload = {
    serviceId: activeService.value?.id,
    serviceTitle: activeService.value?.title,
    modalSubject: activeService.value?.modalSubject,
    ...formData.value,
    submittedAt: new Date().toISOString()
  };

  console.log('[APEKS Services] Submitted request:', payload);
  isSubmitted.value = true;
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
        <span class="text-neutral-dark font-medium">Услуги и сервис</span>
      </nav>
    </div>

    <!-- Main Content -->
    <section class="pt-2 pb-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Header -->
        <div class="mb-8 pb-4 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight">
            Услуги и сервисная поддержка APEKS
          </h1>
          <p class="text-xs sm:text-sm text-neutral-muted mt-2 max-w-3xl leading-relaxed">
            Полный комплекс технического и финансового сопровождения геодезического оборудования: тестирование на объектах, авторизованный сервис, обмен по программе Trade-In и расчет лизинга.
          </p>
        </div>

        <!-- Services Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div 
            v-for="service in services" 
            :key="service.id"
            class="p-6 sm:p-7 rounded-xl border border-neutral-border bg-white flex flex-col justify-between hover:border-brand transition shadow-xs"
          >
            <div>
              <div class="flex items-start justify-between gap-4 mb-3">
                <h2 class="text-lg sm:text-xl font-bold text-neutral-dark">
                  {{ service.title }}
                </h2>
              </div>

              <p class="text-xs sm:text-sm text-neutral-dark font-medium leading-relaxed mb-4">
                {{ service.shortDesc }}
              </p>

              <p class="text-xs text-neutral-muted leading-relaxed mb-5">
                {{ service.fullDesc }}
              </p>
            </div>

            <!-- Card Action Button -->
            <button 
              type="button"
              @click="openServiceModal(service)"
              class="w-full sm:w-auto self-start px-5 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>Отправить заявку</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Consultation Banner -->
        <div class="p-6 sm:p-8 rounded-xl border border-neutral-border bg-[#F8FAFC] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-1">
            <h3 class="text-base sm:text-lg font-bold text-[#0B2530]">
              Нужна индивидуальная консультация инженера?
            </h3>
            <p class="text-xs sm:text-sm text-neutral-muted">
              Поможем подобрать оптимальный прибор, согласуем выездной тест-драйв или оценим оборудование в Trade-In.
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <a 
              href="tel:+78005554025" 
              class="px-4 py-2.5 rounded-lg border border-neutral-border bg-white hover:border-brand text-xs sm:text-sm font-semibold text-neutral-dark transition"
            >
              8 (800) 555-40-25
            </a>
            <button 
              type="button"
              @click="openServiceModal(services[0])"
              class="px-5 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
            >
              Оставить заявку
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- Feedback Modal for Selected Service -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-border overflow-hidden my-8">
        
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-[#F8FAFC] border-b border-neutral-border flex items-center justify-between">
          <div class="pr-4">
            <span class="text-[11px] font-semibold text-brand uppercase tracking-wider block">Заявка на услугу</span>
            <h3 class="text-base sm:text-lg font-bold text-neutral-dark truncate">
              {{ activeService?.title }}
            </h3>
          </div>
          <button 
            type="button"
            @click="closeModal" 
            class="text-neutral-muted hover:text-neutral-dark p-1.5 rounded-lg hover:bg-neutral-200/50 transition cursor-pointer"
            aria-label="Закрыть"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="isSubmitted" class="p-6 sm:p-8 text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h4 class="text-lg font-bold text-neutral-dark">Заявка успешно отправлена!</h4>
          <p class="text-xs sm:text-sm text-neutral-muted leading-relaxed">
            Спасибо! Ваша заявка на услугу «<span class="font-semibold text-neutral-dark">{{ activeService?.title }}</span>» зарегистрирована. Наш инженер свяжется с вами в течение 15 минут.
          </p>
          <button 
            type="button"
            @click="closeModal"
            class="w-full py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Понятно
          </button>
        </div>

        <!-- Request Form -->
        <form v-else @submit.prevent="submitServiceRequest" class="p-6 space-y-4">
          
          <!-- Signed Service Indicator -->
          <div class="p-3 bg-brand/5 border border-brand/20 rounded-lg flex items-center justify-between text-xs">
            <span class="text-neutral-muted">Услуга:</span>
            <span class="font-bold text-brand">{{ activeService?.title }}</span>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-neutral-dark mb-1">
              Ваше имя <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="formData.name"
              type="text" 
              required
              placeholder="Иван Иванов"
              class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-xs font-semibold text-neutral-dark mb-1">
              Телефон <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="formData.phone"
              type="tel" 
              required
              placeholder="+7 (___) ___-__-__"
              class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <!-- Company / Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">Организация</label>
              <input 
                v-model="formData.company"
                type="text" 
                placeholder="ООО «Геодезия»"
                class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">Город / Регион</label>
              <input 
                v-model="formData.city"
                type="text" 
                placeholder="Москва"
                class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <!-- Comment -->
          <div>
            <label class="block text-xs font-semibold text-neutral-dark mb-1">Комментарий к заявке</label>
            <textarea 
              v-model="formData.comment"
              rows="3"
              placeholder="Укажите интересующую модель, параметры объекта или желаемые сроки..."
              class="w-full p-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand resize-none"
            ></textarea>
          </div>

          <!-- Privacy Agreement -->
          <label class="flex items-start gap-2 text-[11px] text-neutral-muted cursor-pointer select-none">
            <input 
              v-model="formData.agree"
              type="checkbox" 
              required
              class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] mt-0.5 cursor-pointer shrink-0" 
            />
            <span>
              Я согласен на обработку моих персональных данных в соответствии с <router-link to="/privacy" target="_blank" class="text-brand underline hover:text-[#01556D]">политикой конфиденциальности</router-link>
            </span>
          </label>

          <!-- Buttons -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-neutral-border">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2.5 rounded-lg border border-neutral-border text-xs sm:text-sm font-medium text-neutral-dark hover:bg-[#F8FAFC] transition cursor-pointer"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
            >
              Отправить заявку
            </button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>
