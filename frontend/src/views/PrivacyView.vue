<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- Breadcrumbs -->
    <div class="max-w-4xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-3 bg-white">
      <nav class="flex items-center gap-2 text-xs text-neutral-muted flex-wrap">
        <router-link to="/" class="hover:text-brand transition flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Главная</span>
        </router-link>
        <span class="text-neutral-300">/</span>
        <span class="text-neutral-dark font-medium">Политика конфиденциальности</span>
      </nav>
    </div>

    <!-- Main Content Section -->
    <section class="pt-2 pb-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-8">
        
        <!-- Header -->
        <div class="mb-8 pb-4 border-b border-neutral-border">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0B2530] tracking-tight">
            Политика конфиденциальности
          </h1>
          <p class="text-xs sm:text-sm text-neutral-muted mt-2">
            Политика в отношении обработки персональных данных в соответствии с Федеральным законом № 152-ФЗ
          </p>
        </div>

        <!-- Document Body -->
        <div class="space-y-8 text-sm sm:text-[15px] text-neutral-dark leading-relaxed">
          
          <!-- Intro Card -->
          <div class="p-5 rounded-xl border border-neutral-border bg-[#F8FAFC]">
            <p class="font-medium text-[#0B2530] mb-2">
              Оператор персональных данных:
            </p>
            <p class="text-xs sm:text-sm text-neutral-muted leading-relaxed">
              Индивидуальный Предприниматель Гольцев Егор Евгеньевич (АПЕКС ГНСС РУС)<br>
              ИНН: 551901408473 · ОГРНИП: 325554300013172<br>
              Электронная почта для обращений: <a href="mailto:apeksgnss@mail.ru" class="text-brand hover:underline font-medium">apeksgnss@mail.ru</a><br>
              Telegram: <a href="https://t.me/apeks_gnss_rus" target="_blank" rel="noopener" class="text-brand hover:underline font-medium">@apeks_gnss_rus</a>
            </p>
          </div>

          <div>
            <h2 class="text-lg font-bold text-[#0B2530] mb-3">
              1. Общие положения и согласие
            </h2>
            <p class="mb-3">
              Настоящая Политика конфиденциальности (далее — «Политика») действует в отношении всей информации, которую Индивидуальный Предприниматель Гольцев Егор Евгеньевич (далее — «Компания» или «Оператор») может получить о пользователе во время использования официального сайта компании <a href="https://apeksgnss.ru" class="text-brand hover:underline font-medium">apeksgnss.ru</a>, его сервисов, служб и продуктов.
            </p>
            <p>
              Оставляя заявку на сайте или оформляя заказ, пользователь свободно, своей волей и в своем интересе выражает согласие на обработку всех предоставленных персональных данных любыми законными способами, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (предоставление, доступ), обезличивание, блокирование, удаление и уничтожение персональных данных.
            </p>
          </div>

          <div>
            <h2 class="text-lg font-bold text-[#0B2530] mb-3">
              2. Состав собираемых персональных данных
            </h2>
            <p class="mb-3">
              Сайт собирает персональные данные исключительно при добровольном заполнении посетителем электронных форм:
            </p>
            <ul class="list-disc pl-5 space-y-1.5 text-neutral-muted">
              <li><strong class="text-neutral-dark">Оформление заказа:</strong> фамилия, имя, номер мобильного телефона, адрес электронной почты, способ и адрес доставки оборудования, комментарий к заказу.</li>
              <li><strong class="text-neutral-dark">Заказ обратного звонка и консультация:</strong> имя, контактный телефон, удобное время для связи, интересующая модель оборудования.</li>
              <li><strong class="text-neutral-dark">Запрос коммерческого предложения (КП):</strong> контактное лицо, номер телефона, email, наименование организации или ИП, перечень оборудования и реквизиты.</li>
              <li><strong class="text-neutral-dark">Технические сведения о сессии:</strong> тип устройства, источник перехода (UTM-метки ссылки без передачи конфиденциальных данных), необходимые для корректной работы интернет-магазина.</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-bold text-[#0B2530] mb-3">
              3. Цели обработки персональных данных
            </h2>
            <p class="mb-3">
              Персональные данные пользователей обрабатываются исключительно в следующих целях:
            </p>
            <ul class="list-disc pl-5 space-y-1.5 text-neutral-muted">
              <li>Исполнение договоров купли-продажи, поставки геодезического оборудования и оказания сервисных услуг.</li>
              <li>Связь с клиентом для подтверждения заказа, согласования условий доставки и технических параметров.</li>
              <li>Предоставление технической поддержки, консультаций по спутниковому оборудованию APEKS и полевому ПО ApekSurv.</li>
              <li>Выставление счетов на оплату юридическим лицам и формирование фискальных кассовых чеков.</li>
              <li>Направление информации о гарантийном обслуживании, обновлении прошивок приборов и новых поступлениях (только с согласия пользователя).</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-bold text-[#0B2530] mb-3">
              4. Сроки обработки и безопасность данных
            </h2>
            <p class="mb-3">
              Согласие на обработку персональных данных предоставляется на срок 5 лет. Пользователь вправе в любой момент отозвать свое согласие, направив письменное заявление по адресу электронной почты <a href="mailto:apeksgnss@mail.ru" class="text-brand hover:underline font-medium">apeksgnss@mail.ru</a>.
            </p>
            <p class="mb-3">
              Оператор принимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий третьих лиц.
            </p>
            <p>
              Персональные данные ни при каких обстоятельствах не продаются и не передаются рекламным сетям или неавторизованным третьим лицам. Передача данных курьерским службам (СДЭК, Деловые Линии и др.) осуществляется исключительно в объеме, необходимом для доставки заказанного оборудования покупателю.
            </p>
          </div>

          <div>
            <h2 class="text-lg font-bold text-[#0B2530] mb-3">
              5. Файлы cookie и веб-аналитика
            </h2>
            <p class="mb-3">
              На сайте могут использоваться технические файлы cookie, необходимые для сохранения содержимого корзины покупателя и пользовательских настроек фильтрации каталога.
            </p>
            <p>
              Для оценки посещаемости сайта может применяться сервис веб-аналитики Яндекс.Метрика, обрабатывающий данные в обезличенном виде без привязки к конкретному лицу. Пользователь может отключить сохранение cookie в настройках своего браузера.
            </p>
          </div>

          <div>
            <h2 class="text-lg font-bold text-[#0B2530] mb-3">
              6. Реквизиты и контакты Компании
            </h2>
            <div class="p-5 rounded-xl border border-neutral-border bg-white space-y-1.5 text-xs sm:text-sm text-neutral-muted">
              <p><strong class="text-neutral-dark">Индивидуальный Предприниматель:</strong> Гольцев Егор Евгеньевич</p>
              <p><strong class="text-neutral-dark">Коммерческое обозначение:</strong> АПЕКС ГНСС РУС (APEKS GNSS)</p>
              <p><strong class="text-neutral-dark">ИНН:</strong> 551901408473</p>
              <p><strong class="text-neutral-dark">ОГРНИП:</strong> 325554300013172</p>
              <p><strong class="text-neutral-dark">Отдел продаж и консультации:</strong> +7 (926) 973-00-03, +7 (999) 801-92-52, +7 (928) 820-23-00</p>
              <p><strong class="text-neutral-dark">Электронная почта:</strong> apeksgnss@mail.ru</p>
              <p><strong class="text-neutral-dark">Официальный сайт:</strong> https://apeksgnss.ru</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  </div>
</template>
