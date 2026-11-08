<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCart, formatRub } from '../composables/useCart.js';

const router = useRouter();
const {
  cartItems,
  totalCount,
  totalPrice,
  clearCart
} = useCart();

// Form state
const form = ref({
  fullName: '',
  phone: '',
  email: '',
  deliveryType: 'cdek', // 'cdek' | 'pickup'
  city: '',
  address: '',
  paymentMethod: 'sbp',
  agreeTerms: false
});

// Automatically revert cash on pickup if delivery type switches to cdek
watch(() => form.value.deliveryType, (newVal) => {
  if (newVal === 'cdek' && form.value.paymentMethod === 'cash_pickup') {
    form.value.paymentMethod = 'sbp';
  }
});

// Errors & submission state
const errors = ref({});
const isSubmitting = ref(false);
const isOrderSubmitted = ref(false);
const submittedOrderNumber = ref('');
const submittedOrderDate = ref('');
const submittedOrderData = ref(null);

function validatePhone() {
  const digits = form.value.phone.replace(/\D/g, '');
  const subscriber = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;
  
  if (!form.value.phone.trim()) {
    errors.value.phone = 'Укажите номер телефона';
    return false;
  }
  if (subscriber.length < 10) {
    errors.value.phone = 'Укажите полный номер: 10 цифр (+7 (XXX) XXX-XX-XX)';
    return false;
  }
  // Check valid Russian codes: mobile 9XX, landlines 3XX, 4XX, 8XX
  if (!/^[3489]\d{9}$/.test(subscriber)) {
    errors.value.phone = 'Неверный код оператора (ожидается +7 9XX...)';
    return false;
  }
  // Disallow obvious fake patterns like 9999999999 or 0000000000
  if (/^(\d)\1{9}$/.test(subscriber)) {
    errors.value.phone = 'Укажите действующий номер телефона';
    return false;
  }
  delete errors.value.phone;
  return true;
}

function validateEmail() {
  const email = form.value.email.trim();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email) {
    errors.value.email = 'Укажите адрес электронной почты';
    return false;
  }
  if (!emailPattern.test(email) || email.includes('..')) {
    errors.value.email = 'Укажите корректный email (например: name@mail.ru)';
    return false;
  }
  delete errors.value.email;
  return true;
}

function handleEmailInput() {
  if (errors.value.email) {
    validateEmail();
  }
}

function validateForm() {
  const errs = {};

  if (!form.value.fullName.trim()) {
    errs.fullName = 'Укажите ФИО';
  }

  const phoneValid = validatePhone();
  if (!phoneValid && errors.value.phone) {
    errs.phone = errors.value.phone;
  }

  const emailValid = validateEmail();
  if (!emailValid && errors.value.email) {
    errs.email = errors.value.email;
  }

  if (form.value.deliveryType !== 'pickup') {
    if (!form.value.city.trim()) {
      errs.city = 'Укажите город доставки';
    }
    if (!form.value.address.trim()) {
      errs.address = 'Укажите адрес доставки';
    }
  }

  if (!form.value.agreeTerms) {
    errs.agreeTerms = 'Необходимо согласие на обработку персональных данных';
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
}

function getSubscriberDigits(str) {
  let digits = (str || '').replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function formatSubscriber(sub) {
  if (!sub) return '';
  let res = '+7 (';
  res += sub.substring(0, 3);
  if (sub.length >= 3) res += ') ' + sub.substring(3, 6);
  if (sub.length >= 6) res += '-' + sub.substring(6, 8);
  if (sub.length >= 8) res += '-' + sub.substring(8, 10);
  return res;
}

function countDigitsBefore(str, pos) {
  let count = 0;
  for (let i = 4; i < Math.min(pos, str.length); i++) {
    if (/\d/.test(str[i])) count++;
  }
  return count;
}

function getCaretPosAfterDigits(formatted, targetDigitCount) {
  if (targetDigitCount <= 0) return Math.min(4, formatted.length);
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (i >= 4 && /\d/.test(formatted[i])) {
      count++;
      if (count === targetDigitCount) {
        let nextPos = i + 1;
        while (nextPos < formatted.length && !/\d/.test(formatted[nextPos])) {
          nextPos++;
        }
        return nextPos;
      }
    }
  }
  return formatted.length;
}

function setCaret(input, pos) {
  requestAnimationFrame(() => {
    if (input && typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(pos, pos);
    }
  });
}

function handlePhoneKeyDown(e) {
  const input = e.target;
  const key = e.key;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const currentVal = form.value.phone || '';
  const sub = getSubscriberDigits(currentVal);

  // If user is typing a digit
  if (/^[0-9]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    let subArr = sub.split('');
    let targetDigitIdx = 0;
    
    if (start !== end) {
      // Replacing an active selection
      const startDigits = countDigitsBefore(currentVal, start);
      const endDigits = countDigitsBefore(currentVal, end);
      subArr.splice(startDigits, endDigits - startDigits, key);
      targetDigitIdx = startDigits + 1;
    } else {
      // Single cursor
      let digitsBefore = countDigitsBefore(currentVal, start);
      if (sub.length >= 10 && digitsBefore < 10) {
        // OVERWRITE MODE: selectively editing a digit in the middle of a full number
        subArr[digitsBefore] = key;
        targetDigitIdx = digitsBefore + 1;
      } else if (sub.length < 10) {
        // INSERT MODE: insert digit
        subArr.splice(digitsBefore, 0, key);
        targetDigitIdx = digitsBefore + 1;
      } else {
        // Full number and cursor at the end
        return;
      }
    }

    const newSub = subArr.join('').slice(0, 10);
    const formatted = formatSubscriber(newSub);
    form.value.phone = formatted;
    const newPos = getCaretPosAfterDigits(formatted, targetDigitIdx);
    setCaret(input, newPos);
    
    if (errors.value.phone) validatePhone();
    return;
  }

  // If user presses Backspace
  if (key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (start !== end) {
      e.preventDefault();
      const startDigits = countDigitsBefore(currentVal, start);
      const endDigits = countDigitsBefore(currentVal, end);
      let subArr = sub.split('');
      subArr.splice(startDigits, endDigits - startDigits);
      const newSub = subArr.join('');
      const formatted = formatSubscriber(newSub);
      form.value.phone = formatted;
      const newPos = getCaretPosAfterDigits(formatted, startDigits);
      setCaret(input, newPos);
      if (errors.value.phone) validatePhone();
      return;
    }
    
    // Prevent deleting "+7 (" prefix
    if (start <= 4) {
      e.preventDefault();
      setCaret(input, 4);
      return;
    }

    e.preventDefault();
    let digitsBefore = countDigitsBefore(currentVal, start);
    if (digitsBefore > 0) {
      let subArr = sub.split('');
      subArr.splice(digitsBefore - 1, 1);
      const newSub = subArr.join('');
      const formatted = formatSubscriber(newSub);
      form.value.phone = formatted;
      const newPos = getCaretPosAfterDigits(formatted, digitsBefore - 1);
      setCaret(input, newPos);
      if (errors.value.phone) validatePhone();
    }
    return;
  }

  // If user presses Delete
  if (key === 'Delete' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (start !== end) {
      e.preventDefault();
      const startDigits = countDigitsBefore(currentVal, start);
      const endDigits = countDigitsBefore(currentVal, end);
      let subArr = sub.split('');
      subArr.splice(startDigits, endDigits - startDigits);
      const newSub = subArr.join('');
      const formatted = formatSubscriber(newSub);
      form.value.phone = formatted;
      const newPos = getCaretPosAfterDigits(formatted, startDigits);
      setCaret(input, newPos);
      if (errors.value.phone) validatePhone();
      return;
    }

    let digitsBefore = countDigitsBefore(currentVal, start);
    if (digitsBefore < sub.length) {
      e.preventDefault();
      let subArr = sub.split('');
      subArr.splice(digitsBefore, 1);
      const newSub = subArr.join('');
      const formatted = formatSubscriber(newSub);
      form.value.phone = formatted;
      const newPos = getCaretPosAfterDigits(formatted, digitsBefore);
      setCaret(input, newPos);
      if (errors.value.phone) validatePhone();
    }
    return;
  }
}

// Fallback for paste and autofill
function handlePhoneInput(e) {
  const input = e.target;
  const start = input.selectionStart;
  const digitsBefore = countDigitsBefore(input.value, start);
  const sub = getSubscriberDigits(input.value);
  const formatted = formatSubscriber(sub);
  form.value.phone = formatted;
  const newPos = getCaretPosAfterDigits(formatted, digitsBefore);
  setCaret(input, newPos);
  if (errors.value.phone) validatePhone();
}

async function submitOrder() {
  if (!validateForm()) {
    const firstError = Object.keys(errors.value)[0];
    const el = document.getElementById(`field-${firstError}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
    return;
  }

  isSubmitting.value = true;

  const orderNumber = `AP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  submittedOrderData.value = {
    orderNumber,
    dateStr,
    items: [...cartItems.value],
    totalCount: totalCount.value,
    totalPrice: totalPrice.value,
    form: { ...form.value }
  };

  submittedOrderNumber.value = orderNumber;
  submittedOrderDate.value = dateStr;

  setTimeout(() => {
    isSubmitting.value = false;
    isOrderSubmitted.value = true;
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 400);
}

function printOrder() {
  window.print();
}
</script>

<template>
  <div class="bg-white min-h-[85vh] py-8 sm:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-8">
      
      <!-- SUCCESS CONFIRMATION STATE -->
      <div v-if="isOrderSubmitted && submittedOrderData" class="max-w-2xl mx-auto py-4 space-y-8">
        
        <div class="text-center space-y-2 pb-6 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-neutral-dark">
            Заказ успешно оформлен!
          </h1>
          <p class="text-sm text-neutral-muted max-w-lg mx-auto">
            Номер вашего заказа: <span class="font-bold text-neutral-dark">{{ submittedOrderNumber }}</span> от {{ submittedOrderDate }}
          </p>
        </div>

        <!-- Order Summary Details -->
        <div class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div class="space-y-1.5 pb-4 border-b sm:border-b-0 sm:border-r border-neutral-border/60 sm:pr-6">
              <span class="text-neutral-muted block">Получатель:</span>
              <div class="font-bold text-neutral-dark text-sm">
                {{ submittedOrderData.form.fullName }}
              </div>
              <div class="text-neutral-muted">
                {{ submittedOrderData.form.phone }}
              </div>
              <div class="text-neutral-muted">
                {{ submittedOrderData.form.email }}
              </div>
            </div>

            <div class="space-y-1.5">
              <span class="text-neutral-muted block">Доставка и оплата:</span>
              <div class="font-bold text-neutral-dark text-sm">
                {{ submittedOrderData.form.deliveryType === 'pickup' ? 'Самовывоз' : 'СДЭК' }}
              </div>
              <div v-if="submittedOrderData.form.deliveryType === 'pickup'" class="text-neutral-muted text-[11px]">
                Московская обл., г. Одинцово, ул. Западная, д. 181, БЦ «Орбион»
              </div>
              <div v-else class="text-neutral-muted text-[11px]">
                {{ submittedOrderData.form.city }}, {{ submittedOrderData.form.address }}
              </div>
              <div class="text-brand font-semibold pt-1">
                {{ submittedOrderData.form.paymentMethod === 'cash_pickup' ? 'Наличными' : 'Система быстрых платежей (СБП)' }}
              </div>
            </div>
          </div>

          <!-- Items Ordered List -->
          <div class="pt-4">
            <h3 class="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-3">Состав заказа</h3>
            <div class="border-t border-b border-neutral-border divide-y divide-neutral-border">
              <div 
                v-for="item in submittedOrderData.items" 
                :key="item.title"
                class="py-3.5 flex items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3">
                  <img :src="item.img" :alt="item.title" class="w-12 h-12 object-contain bg-[#F4F6F9] rounded border border-neutral-border p-1">
                  <div>
                    <div class="text-xs sm:text-sm font-bold text-neutral-dark">{{ item.title }}</div>
                    <div class="text-[11px] text-neutral-muted">{{ item.qty }} шт. × {{ formatRub(item.price) }}</div>
                  </div>
                </div>
                <div class="text-right font-bold text-xs sm:text-sm text-neutral-dark">
                  {{ formatRub(item.price * item.qty) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Order Total Details -->
          <div class="flex flex-col items-start pt-2 space-y-1 text-xs text-left">
            <div class="text-neutral-muted">
              Доставка: <span class="font-semibold text-brand">Бесплатно</span>
            </div>
            <div class="text-base sm:text-lg font-extrabold text-neutral-dark pt-1">
              Итого к оплате: {{ formatRub(submittedOrderData.totalPrice) }}
            </div>
          </div>
        </div>



      </div>

      <!-- EMPTY CART STATE -->
      <div v-else-if="cartItems.length === 0" class="max-w-xl mx-auto py-16 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-[#F4F6F9] text-neutral-muted flex items-center justify-center mx-auto">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <div class="space-y-1.5">
          <h2 class="text-lg font-bold text-neutral-dark">В вашей корзине пока нет товаров</h2>
          <p class="text-xs text-neutral-muted leading-relaxed">
            Для оформления заказа добавьте оборудование из каталога
          </p>
        </div>
        <router-link 
          to="/catalog" 
          class="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-brand hover:bg-[#01556D] text-white text-xs font-bold transition shadow-xs"
        >
          Перейти в каталог
        </router-link>
      </div>

      <!-- ACTIVE CHECKOUT FORM (CLEAN, AIRY, UNCLUTTERED) -->
      <div v-else class="space-y-10">
        
        <!-- Clean Page Header with bottom divider line -->
        <div class="space-y-1 pb-4 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-neutral-dark tracking-tight">
            Оформление заказа
          </h1>
          <p class="text-xs sm:text-sm text-neutral-muted">
            Официальная поставка с гарантией производителя и бесплатной доставкой по РФ
          </p>
        </div>

        <!-- 2 Column Layout: Left Form + Right Sticky Order Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          
          <!-- LEFT COLUMN: Clean Form without excess lines or cards -->
          <div class="lg:col-span-7 xl:col-span-8 space-y-12 sm:space-y-14">
            
            <!-- SECTION 1: Данные получателя -->
            <section class="space-y-4">
              <h2 class="text-base font-bold text-neutral-dark">
                Данные получателя
              </h2>

              <div class="space-y-4">
                <!-- Row 1: Full Name (Generous width) -->
                <div>
                  <label class="block text-xs font-semibold text-neutral-dark mb-1.5">
                    ФИО <span class="text-brand">*</span>
                  </label>
                  <input 
                    id="field-fullName"
                    v-model="form.fullName" 
                    type="text" 
                    placeholder="Иванов Алексей"
                    :class="[
                      'w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                      errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                    ]"
                  />
                  <p v-if="errors.fullName" class="text-[11px] text-red-500 mt-1">{{ errors.fullName }}</p>
                </div>

                <!-- Row 2: Phone & Email side-by-side with plenty of room -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Phone -->
                  <div>
                    <label class="block text-xs font-semibold text-neutral-dark mb-1.5">
                      Телефон <span class="text-brand">*</span>
                    </label>
                    <input 
                      id="field-phone"
                      :value="form.phone"
                      @keydown="handlePhoneKeyDown"
                      @input="handlePhoneInput"
                      @blur="validatePhone"
                      type="tel" 
                      maxlength="18"
                      placeholder="+7 (___) ___-__-__"
                      :class="[
                        'w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                        errors.phone ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                      ]"
                    />
                    <p v-if="errors.phone" class="text-[11px] text-red-500 mt-1">{{ errors.phone }}</p>
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-xs font-semibold text-neutral-dark mb-1.5">
                      Электронная почта <span class="text-brand">*</span>
                    </label>
                    <input 
                      id="field-email"
                      v-model="form.email" 
                      @blur="validateEmail"
                      @input="handleEmailInput"
                      type="email" 
                      placeholder="alex@mail.ru"
                      :class="[
                        'w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                      ]"
                    />
                    <p v-if="errors.email" class="text-[11px] text-red-500 mt-1">{{ errors.email }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- SECTION 2: Способ доставки -->
            <section class="space-y-4">
              <h2 class="text-base font-bold text-neutral-dark">
                Способ доставки
              </h2>

              <!-- 2 Delivery Options Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <!-- Option 1: СДЭК -->
                <label 
                  @click="form.deliveryType = 'cdek'"
                  :class="[
                    'p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between select-none',
                    form.deliveryType === 'cdek' 
                      ? 'border-brand bg-brand-light/25 ring-1 ring-brand' 
                      : 'border-neutral-border hover:border-neutral-muted bg-white'
                  ]"
                >
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-bold text-neutral-dark">СДЭК</span>
                      <div :class="['w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition', form.deliveryType === 'cdek' ? 'border-brand' : 'border-neutral-border']">
                        <div v-if="form.deliveryType === 'cdek'" class="w-2 h-2 rounded-full bg-brand"></div>
                      </div>
                    </div>
                    <p class="text-xs text-neutral-muted leading-tight">
                      Доставка в пункт выдачи
                    </p>
                  </div>
                  <div class="mt-3 flex items-center justify-between text-xs">
                    <span class="text-neutral-muted font-medium">2–14 дней</span>
                    <span class="font-bold text-brand">Бесплатно</span>
                  </div>
                </label>

                <!-- Option 2: Самовывоз -->
                <label 
                  @click="form.deliveryType = 'pickup'"
                  :class="[
                    'p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between select-none',
                    form.deliveryType === 'pickup' 
                      ? 'border-brand bg-brand-light/25 ring-1 ring-brand' 
                      : 'border-neutral-border hover:border-neutral-muted bg-white'
                  ]"
                >
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-bold text-neutral-dark">Самовывоз</span>
                      <div :class="['w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition', form.deliveryType === 'pickup' ? 'border-brand' : 'border-neutral-border']">
                        <div v-if="form.deliveryType === 'pickup'" class="w-2 h-2 rounded-full bg-brand"></div>
                      </div>
                    </div>
                    <p class="text-xs text-neutral-muted leading-tight">
                      Из офиса представительства в Москве
                    </p>
                  </div>
                  <div class="mt-3 flex items-center justify-between text-xs">
                    <span class="text-neutral-muted font-medium">Сегодня</span>
                    <span class="font-bold text-brand">Бесплатно</span>
                  </div>
                </label>

              </div>

              <!-- Pickup Address Banner -->
              <div v-if="form.deliveryType === 'pickup'" class="p-4 bg-[#F8FAFC] border border-neutral-border/80 rounded-xl text-xs space-y-1">
                <div class="font-bold text-neutral-dark">Адрес пункта выдачи:</div>
                <div class="text-neutral-dark font-medium">
                  Московская обл., г. Одинцово, ул. Западная, д. 181, БЦ «Орбион»
                </div>
                <div class="text-neutral-muted pt-0.5">
                  Режим работы: Пн–Пт с 09:00 до 18:00 (МСК)
                </div>
              </div>

              <!-- Address Form for CDEK (City + Address only, no comments, no bulky labels) -->
              <div v-else class="space-y-4 pt-1">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <!-- City -->
                  <div class="sm:col-span-1">
                    <label class="block text-xs font-semibold text-neutral-dark mb-1.5">
                      Город <span class="text-brand">*</span>
                    </label>
                    <input 
                      id="field-city"
                      v-model="form.city" 
                      type="text" 
                      placeholder="Москва"
                      :class="[
                        'w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                        errors.city ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                      ]"
                    />
                    <p v-if="errors.city" class="text-[11px] text-red-500 mt-1">{{ errors.city }}</p>
                  </div>

                  <!-- Street & Building -->
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-semibold text-neutral-dark mb-1.5">
                      Адрес доставки <span class="text-brand">*</span>
                    </label>
                    <input 
                      id="field-address"
                      v-model="form.address" 
                      type="text" 
                      placeholder="ул. Геодезистов, д. 12"
                      :class="[
                        'w-full h-11 px-3.5 text-xs sm:text-sm bg-[#F8FAFC] hover:bg-[#EEF1F6] focus:bg-white border rounded-lg text-neutral-dark placeholder-neutral-muted focus:outline-none transition',
                        errors.address ? 'border-red-400 focus:border-red-500' : 'border-neutral-border focus:border-brand'
                      ]"
                    />
                    <p v-if="errors.address" class="text-[11px] text-red-500 mt-1">{{ errors.address }}</p>
                  </div>
                </div>
              </div>

            </section>

            <!-- SECTION 3: Способ оплаты -->
            <section class="space-y-4">
              <h2 class="text-base font-bold text-neutral-dark">
                Способ оплаты
              </h2>

              <!-- 2 Payment Options Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <!-- Option 1: СБП -->
                <label 
                  @click="form.paymentMethod = 'sbp'"
                  :class="[
                    'p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between select-none',
                    form.paymentMethod === 'sbp' 
                      ? 'border-brand bg-brand-light/25 ring-1 ring-brand' 
                      : 'border-neutral-border hover:border-neutral-muted bg-white'
                  ]"
                >
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-bold text-neutral-dark">
                        Система быстрых платежей (СБП)
                      </span>
                      <div :class="['w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition', form.paymentMethod === 'sbp' ? 'border-brand' : 'border-neutral-border']">
                        <div v-if="form.paymentMethod === 'sbp'" class="w-2 h-2 rounded-full bg-brand"></div>
                      </div>
                    </div>
                    <p class="text-xs text-neutral-muted leading-tight">
                      Мгновенная онлайн-оплата по QR-коду через приложение любого банка
                    </p>
                  </div>
                </label>

                <!-- Option 2: Наличными при самовывозе -->
                <label 
                  @click="form.deliveryType === 'pickup' && (form.paymentMethod = 'cash_pickup')"
                  :class="[
                    'p-4 rounded-xl border text-left transition flex flex-col justify-between select-none',
                    form.deliveryType !== 'pickup'
                      ? 'border-neutral-border bg-[#F8FAFC] cursor-not-allowed'
                      : (form.paymentMethod === 'cash_pickup'
                          ? 'border-brand bg-brand-light/25 ring-1 ring-brand cursor-pointer'
                          : 'border-neutral-border hover:border-neutral-muted bg-white cursor-pointer')
                  ]"
                  :title="form.deliveryType !== 'pickup' ? 'Доступно только при выборе способа доставки «Самовывоз»' : ''"
                >
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-bold text-neutral-dark">
                        Наличными
                      </span>
                      <div :class="[
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition',
                        (form.paymentMethod === 'cash_pickup' && form.deliveryType === 'pickup') 
                          ? 'border-brand' 
                          : (form.deliveryType === 'pickup' ? 'border-neutral-border' : 'border-neutral-300 bg-neutral-100')
                      ]">
                        <div v-if="form.paymentMethod === 'cash_pickup' && form.deliveryType === 'pickup'" class="w-2 h-2 rounded-full bg-brand"></div>
                      </div>
                    </div>
                    <p 
                      class="text-xs leading-tight transition-colors"
                      :class="form.deliveryType === 'pickup' ? 'text-neutral-muted' : 'text-amber-600 font-medium'"
                    >
                      {{ form.deliveryType === 'pickup' ? 'Оплата наличными в офисе при получении заказа' : 'Доступно только при самовывозе' }}
                    </p>
                  </div>
                </label>

              </div>

              <!-- Personal Data Agreement Checkbox (Aligned center with text, neat compact size) -->
              <div class="pt-1">
                <label class="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input 
                    id="field-agreeTerms"
                    v-model="form.agreeTerms" 
                    type="checkbox" 
                    class="w-4 h-4 rounded border-neutral-300 text-brand focus:ring-brand accent-[#016C8A] hover:border-brand transition cursor-pointer shrink-0 shadow-xs"
                  />
                  <span class="text-xs text-neutral-muted group-hover:text-neutral-dark transition leading-normal">
                    Я согласен на обработку моих персональных данных в соответствии с <router-link to="/privacy" class="text-brand hover:underline font-semibold transition" @click.stop>политикой конфиденциальности</router-link>
                  </span>
                </label>
                <p v-if="errors.agreeTerms" class="text-[11px] text-red-500 mt-1 pl-6.5">{{ errors.agreeTerms }}</p>
              </div>
            </section>

          </div>

          <!-- RIGHT COLUMN: Sticky Order Summary & Advantages (top-28 avoids header overlap) -->
          <div class="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-6">
            
            <!-- Order Summary Clean Container -->
            <div class="border border-neutral-border rounded-2xl p-5 sm:p-6 space-y-5 bg-white shadow-xs">
              
              <div class="pb-3 border-b border-neutral-border/70">
                <h3 class="text-base font-bold text-neutral-dark">Ваш заказ</h3>
              </div>

              <!-- Mini Items List with comfortable margin from scrollbar -->
              <div class="max-h-72 sm:max-h-80 overflow-y-auto custom-scrollbar space-y-3 pr-4 sm:pr-5">
                <div 
                  v-for="item in cartItems" 
                  :key="item.id || item.title"
                  class="flex items-center justify-between gap-3 text-xs"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img 
                      :src="item.img || 'assets/client_title_apeks_ap10.png'" 
                      :alt="item.title"
                      class="w-10 h-10 object-contain bg-[#F4F6F9] rounded border border-neutral-border p-1 shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="font-bold text-neutral-dark truncate" :title="item.title">
                        {{ item.title }}
                      </div>
                      <div class="text-[11px] text-neutral-muted">
                        {{ item.qty }} шт. × {{ formatRub(item.price) }}
                      </div>
                    </div>
                  </div>
                  <div class="font-bold text-neutral-dark whitespace-nowrap text-right">
                    {{ formatRub(item.price * item.qty) }}
                  </div>
                </div>
              </div>

              <!-- Cost breakdown -->
              <div class="pt-3 border-t border-neutral-border/70 space-y-2 text-xs">
                <div class="flex items-center justify-between text-neutral-muted">
                  <span>Стоимость оборудования:</span>
                  <span class="font-semibold text-neutral-dark">{{ formatRub(totalPrice) }}</span>
                </div>
                <div class="flex items-center justify-between text-neutral-muted">
                  <span>Доставка:</span>
                  <span class="font-bold text-brand">Бесплатно</span>
                </div>
              </div>

              <!-- Total price in deep black matching text -->
              <div class="pt-4 border-t border-neutral-border/70 flex items-baseline justify-between">
                <span class="text-sm font-bold text-neutral-dark">Итого:</span>
                <span class="text-xl sm:text-2xl font-extrabold text-neutral-dark">
                  {{ formatRub(totalPrice) }}
                </span>
              </div>

              <!-- Primary Submit button -->
              <button 
                type="button"
                @click="submitOrder"
                :disabled="isSubmitting"
                class="w-full h-12 rounded-lg bg-brand hover:bg-[#01556D] disabled:bg-neutral-muted text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isSubmitting ? 'Оформление заказа...' : 'Подтвердить заказ' }}</span>
              </button>

            </div>



          </div>

        </div>

      </div>

    </div>
  </div>
</template>
