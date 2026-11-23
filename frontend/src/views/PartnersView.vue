<script setup>
import { ref, onMounted } from 'vue';

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const isSubmitted = ref(false);

const partnerForm = ref({
  company: '',
  contactName: '',
  phone: '',
  email: '',
  city: '',
  businessType: 'Дилерские продажи геодезического оборудования',
  comment: '',
  agree: false
});

function submitPartnerForm() {
  if (!partnerForm.value.contactName || !partnerForm.value.phone || !partnerForm.value.company) {
    return;
  }

  const payload = {
    type: 'Заявка на партнерство APEKS',
    ...partnerForm.value,
    submittedAt: new Date().toISOString()
  };

  console.log('[APEKS Partners] Submitted B2B application:', payload);
  isSubmitted.value = true;
}

const cooperationTypes = [
  {
    title: 'Региональные торговые дилеры',
    desc: 'Для компаний, специализирующихся на прямых продажах геодезического, измерительного и строительного оборудования в регионах РФ и СНГ.'
  },
  {
    title: 'Системные интеграторы и корпорации',
    desc: 'Для поставщиков комплексных решений в горнодобывающей отрасли, дорожном строительстве, мониторинге деформаций и сельском хозяйстве.'
  },
  {
    title: 'Сервисные центры и учебные заведения',
    desc: 'Для лабораторий поверки и ремонта, а также профильных вузов и колледжей с возможностью оборудования учебных классов APEKS.'
  }
];
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
        <span class="text-neutral-dark font-medium">Партнерам и дилерам</span>
      </nav>
    </div>

    <!-- Main Content -->
    <section class="pt-2 pb-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-8">
        
        <!-- Header -->
        <div class="mb-10 pb-4 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight">
            Дилерская и партнерская программа APEKS GNSS
          </h1>
          <p class="text-xs sm:text-sm text-neutral-muted mt-2 max-w-3xl leading-relaxed">
            Приглашаем к долгосрочному и взаимовыгодному сотрудничеству региональных поставщиков геодезического оборудования, системных интеграторов и строительные холдинги по всей России.
          </p>
        </div>

        <!-- Cooperation Types -->
        <div class="mb-14">
          <div class="mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-dark">
              Форматы сотрудничества
            </h2>
            <p class="text-xs sm:text-sm text-neutral-muted mt-1">
              Индивидуальные дилерские условия под масштабы и профиль вашего бизнеса
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="(item, i) in cooperationTypes" 
              :key="i"
              class="p-6 rounded-xl border border-neutral-border bg-[#F8FAFC] flex flex-col justify-between shadow-xs"
            >
              <div>
                <h3 class="text-base font-bold text-[#0B2530] mb-2.5">
                  {{ item.title }}
                </h3>
                <p class="text-xs text-neutral-muted leading-relaxed">
                  {{ item.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- B2B Partner Application Form Block -->
        <div class="rounded-xl border border-neutral-border bg-white p-6 sm:p-10 shadow-xs max-w-4xl mx-auto">
          
          <div class="mb-8 pb-4 border-b border-neutral-border text-center sm:text-left">
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-dark">
              Стать партнером APEKS GNSS
            </h2>
            <p class="text-xs sm:text-sm text-neutral-muted mt-1.5">
              Заполните форму, и руководитель дилерского отдела свяжется с вами для обсуждения условий и отправки дилерского пакета.
            </p>
          </div>

          <!-- Success Message -->
          <div v-if="isSubmitted" class="p-8 text-center space-y-4">
            <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-dark">Заявка на партнерство принята!</h3>
            <p class="text-xs sm:text-sm text-neutral-muted leading-relaxed max-w-lg mx-auto">
              Благодарим за интерес к сотрудничеству с брендом APEKS. Мы подготовим дилерское предложение для вашей компании (<strong class="text-neutral-dark">{{ partnerForm.company }}</strong>) и свяжемся с вами в течение 1 рабочего дня.
            </p>
            <button 
              type="button"
              @click="isSubmitted = false"
              class="px-6 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Отправить еще одну заявку
            </button>
          </div>

          <!-- Application Form -->
          <form v-else @submit.prevent="submitPartnerForm" class="space-y-4 sm:space-y-5">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Company Name -->
              <div>
                <label class="block text-xs font-semibold text-neutral-dark mb-1">
                  Название компании / ИП <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="partnerForm.company"
                  type="text" 
                  required
                  placeholder="ООО «ГеоПрибор»"
                  class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <!-- Contact Person -->
              <div>
                <label class="block text-xs font-semibold text-neutral-dark mb-1">
                  Контактное лицо (ФИО) <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="partnerForm.contactName"
                  type="text" 
                  required
                  placeholder="Константин Смирнов"
                  class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Phone -->
              <div>
                <label class="block text-xs font-semibold text-neutral-dark mb-1">
                  Телефон <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="partnerForm.phone"
                  type="tel" 
                  required
                  placeholder="+7 (___) ___-__-__"
                  class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-semibold text-neutral-dark mb-1">
                  Электронная почта <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="partnerForm.email"
                  type="email" 
                  required
                  placeholder="partner@company.ru"
                  class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <!-- City / Region -->
              <div>
                <label class="block text-xs font-semibold text-neutral-dark mb-1">
                  Город / Регион работы <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="partnerForm.city"
                  type="text" 
                  required
                  placeholder="Екатеринбург"
                  class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <!-- Business Type -->
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">
                Основное направление деятельности компании
              </label>
              <select 
                v-model="partnerForm.businessType"
                class="w-full h-10 px-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand bg-white"
              >
                <option value="Дилерские продажи геодезического оборудования">Продажи геодезического оборудования и приборов</option>
                <option value="Системная интеграция и строительные поставки">Системная интеграция, дорожное и монолитное строительство</option>
                <option value="Сервисный центр и ремонт">Сервисный центр, метрологическая поверка и калибровка</option>
                <option value="Геодезические и кадастровые изыскания">Выполнение геодезических, маркшейдерских и кадастровых работ</option>
                <option value="Другое направление">Другое направление</option>
              </select>
            </div>

            <!-- Comment -->
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">
                Комментарий или пожелания по сотрудничеству
              </label>
              <textarea 
                v-model="partnerForm.comment"
                rows="3"
                placeholder="Расскажите о текущем объеме продаж, брендах в портфеле или регионе интереса..."
                class="w-full p-3 rounded-lg border border-neutral-border text-xs sm:text-sm text-neutral-dark focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              ></textarea>
            </div>

            <!-- Agreement -->
            <label class="flex items-start gap-2 text-[11px] text-neutral-muted cursor-pointer select-none">
              <input 
                v-model="partnerForm.agree"
                type="checkbox" 
                required
                class="w-3.5 h-3.5 rounded text-brand focus:ring-0 accent-[#016C8A] mt-0.5 cursor-pointer shrink-0" 
              />
              <span>
                Я согласен на обработку моих персональных данных в соответствии с <router-link to="/privacy" target="_blank" class="text-brand underline hover:text-[#01556D]">политикой конфиденциальности</router-link>
              </span>
            </label>

            <!-- Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                class="w-full sm:w-auto px-8 py-3 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                Отправить заявку на партнерство
              </button>
            </div>

          </form>

        </div>

      </div>
    </section>
  </div>
</template>
