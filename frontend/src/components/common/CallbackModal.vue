<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useFormValidation } from '../../composables/useFormValidation.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  presetSubject: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const {
  onPhoneKeyDown,
  onPhoneInput,
  validatePhoneNumber,
  validateEmailAddress
} = useFormValidation();

const form = ref({
  name: '',
  phone: '',
  email: '',
  model: '',
  comment: '',
  agree: false
});

const errors = ref({});
const isSubmitting = ref(false);
const isSuccess = ref(false);

watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
    form.value.model = props.presetSubject || '';
    isSuccess.value = false;
    errors.value = {};
  } else {
    document.body.style.overflow = '';
  }
});

watch(() => props.presetSubject, (val) => {
  if (val) form.value.model = val;
});

function close() {
  emit('close');
}

function onKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  document.body.style.overflow = '';
});

function validatePhone() {
  const err = validatePhoneNumber(form.value.phone);
  if (err) errors.value.phone = err;
  else delete errors.value.phone;
  return !err;
}

function validateEmail() {
  const err = validateEmailAddress(form.value.email);
  if (err) errors.value.email = err;
  else delete errors.value.email;
  return !err;
}

function handlePhoneKeyDown(e) {
  const phoneRef = {
    get value() { return form.value.phone; },
    set value(v) { form.value.phone = v; }
  };
  onPhoneKeyDown(e, phoneRef, () => {
    if (errors.value.phone) validatePhone();
  });
}

function handlePhoneInput(e) {
  const phoneRef = {
    get value() { return form.value.phone; },
    set value(v) { form.value.phone = v; }
  };
  onPhoneInput(e, phoneRef, () => {
    if (errors.value.phone) validatePhone();
  });
}

function submitCallback() {
  const errs = {};
  if (!form.value.name.trim()) {
    errs.name = 'Укажите ваше имя';
  }
  const pErr = validatePhoneNumber(form.value.phone);
  if (pErr) errs.phone = pErr;

  const eErr = validateEmailAddress(form.value.email);
  if (eErr) errs.email = eErr;

  if (!form.value.agree) {
    errs.agree = 'Необходимо согласие на обработку персональных данных';
  }

  errors.value = errs;
  if (Object.keys(errs).length > 0) return;

  isSubmitting.value = true;
  setTimeout(() => {
    isSubmitting.value = false;
    isSuccess.value = true;
    form.value = {
      name: '',
      phone: '',
      email: '',
      model: '',
      comment: '',
      agree: false
    };
  }, 400);
}
</script>

<template>
  <div 
    v-if="isOpen" 
    id="callbackModal"
    role="dialog"
    aria-modal="true"
    aria-label="Заказать звонок"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
    @click.self="close"
  >
    <div 
      class="bg-white rounded-2xl border border-neutral-border shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden text-neutral-dark animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Close Button -->
      <button 
        type="button"
        @click="close"
        class="absolute top-4 right-4 p-2 text-neutral-muted hover:text-neutral-dark transition rounded-lg hover:bg-[#F4F6F9] focus:outline-none cursor-pointer"
        aria-label="Закрыть модальное окно"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- SUCCESS STATE -->
      <div v-if="isSuccess" class="py-8 text-center space-y-4">
        <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-xl font-bold text-neutral-dark">Заявка принята!</h3>
          <p class="text-xs text-neutral-muted max-w-xs mx-auto leading-relaxed">
            Менеджер отдела продаж свяжется с вами в течение 15 минут для консультации.
          </p>
        </div>
        <button 
          type="button"
          @click="close"
          class="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          Понятно
        </button>
      </div>

      <!-- FORM STATE -->
      <div v-else class="space-y-5">
        <div>
          <h3 class="text-xl font-extrabold text-neutral-dark tracking-tight">Заказать звонок</h3>
          <p class="text-xs text-neutral-muted mt-1">
            Оставьте ваши контактные данные, и специалист APEKS перезвонит вам
          </p>
        </div>

        <form @submit.prevent="submitCallback" class="space-y-3.5">
          <!-- Row 1: Name & Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">
                Ваше имя <span class="text-brand">*</span>
              </label>
              <input 
                v-model="form.name"
                type="text" 
                placeholder="Например: Алексей"
                :class="[
                  'w-full h-10 px-3 text-xs bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                  errors.name ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                ]"
              />
              <p v-if="errors.name" class="text-[11px] text-red-500 mt-1">{{ errors.name }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">
                Телефон <span class="text-brand">*</span>
              </label>
              <input 
                :value="form.phone"
                @keydown="handlePhoneKeyDown"
                @input="handlePhoneInput"
                @blur="validatePhone"
                type="tel" 
                maxlength="18"
                placeholder="+7 (___) ___-__-__"
                :class="[
                  'w-full h-10 px-3 text-xs bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                  errors.phone ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                ]"
              />
              <p v-if="errors.phone" class="text-[11px] text-red-500 mt-1">{{ errors.phone }}</p>
            </div>
          </div>

          <!-- Row 2: Email & Model -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1">
                Электронная почта <span class="text-brand">*</span>
              </label>
              <input 
                v-model="form.email"
                @blur="validateEmail"
                @input="errors.email && validateEmail()"
                type="email" 
                placeholder="alex@mail.ru"
                :class="[
                  'w-full h-10 px-3 text-xs bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                  errors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                ]"
              />
              <p v-if="errors.email" class="text-[11px] text-red-500 mt-1">{{ errors.email }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-neutral-dark mb-1 truncate">
                Интересующая модель / услуга (необязательно)
              </label>
              <input 
                v-model="form.model"
                type="text" 
                placeholder="Например: AP40 Laser+"
                class="w-full h-10 px-3 text-xs bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border border-neutral-border focus:border-brand rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition"
              />
            </div>
          </div>

          <!-- Row 3: Question / Comment -->
          <div>
            <label class="block text-xs font-semibold text-neutral-dark mb-1">
              Ваш вопрос (необязательно)
            </label>
            <textarea 
              v-model="form.comment"
              rows="2" 
              placeholder="Опишите задачу или требования..."
              class="w-full p-2.5 text-xs bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border border-neutral-border focus:border-brand rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition resize-none"
            ></textarea>
          </div>

          <!-- Agreement Checkbox -->
          <div class="pt-1">
            <label class="flex items-center gap-2.5 cursor-pointer select-none group">
              <input 
                v-model="form.agree"
                type="checkbox" 
                class="w-4 h-4 rounded border-neutral-300 text-brand focus:ring-brand accent-[#016C8A] hover:border-brand transition cursor-pointer shrink-0 shadow-xs"
              />
              <span class="text-xs text-neutral-muted group-hover:text-neutral-dark transition leading-normal">
                Я согласен на обработку моих персональных данных в соответствии с <router-link to="/privacy" class="text-brand hover:underline font-semibold transition" @click.stop="close">политикой конфиденциальности</router-link>
              </span>
            </label>
            <p v-if="errors.agree" class="text-[11px] text-red-500 mt-1 pl-6.5">{{ errors.agree }}</p>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="w-full h-11 rounded-lg bg-brand hover:bg-[#01556D] disabled:bg-neutral-muted text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSubmitting ? 'Отправка...' : 'Заказать звонок' }}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>
