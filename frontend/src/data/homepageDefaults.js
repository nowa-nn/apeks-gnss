export const DEFAULT_HOMEPAGE = {
  heroSlides: [
    {
      id: 'slide-ap30',
      title: 'APEKS AP30 Laser',
      description: 'Компактный GNSS RTK-приемник с зеленым лазерным дальномером до 10 метров, визуальной AR-разбивкой и IMU 120°. Высокоточные измерения недоступных объектов без вехи в любых полевых условиях.',
      buttonText: 'Смотреть в каталоге',
      buttonLink: '/product/apeks_ap30',
      bgColor: '#080d1c',
      desktopImage: 'assets/banner-1-2-1.png',
      desktopWebp: 'assets/banner-1-2-1.webp',
      mobileImage: 'assets/banner-1-2-1.png',
      mobileWebp: 'assets/banner-1-2-1.webp',
    },
    {
      id: 'slide-ap10',
      title: 'APEKS AP10',
      description: 'Компактный многоканальный GNSS-приемник на передовой аппаратной платформе. Поддержка всех спутниковых созвездий, IMU 120° без калибровки и стабильный сантиметровый RTK в любых полевых условиях.',
      buttonText: 'Смотреть в каталоге',
      buttonLink: '/product/ap10',
      bgColor: '#060608',
      desktopImage: 'assets/image_2026-10-22_19-50-55.png',
      desktopWebp: 'assets/image_2026-10-22_19-50-55.webp',
      mobileImage: 'assets/image_2026-10-22_18-07-40.png',
      mobileWebp: 'assets/image_2026-10-22_18-07-40.webp',
    },
    {
      id: 'slide-ap80',
      title: 'APEKS AP80 PRO',
      description: 'Флагманский спутниковый GNSS-приемник с системой двойных камер, фотограмметрией и лазерным дальномером. Съемка в дополненной реальности AR и 3D-моделирование объектов.',
      buttonText: 'Смотреть в каталоге',
      buttonLink: '/product/ap80-pro',
      bgColor: '#0d1d4d',
      desktopImage: 'assets/dddeb846-d345-4862-b238-c5db85fb56a9.png',
      desktopWebp: 'assets/dddeb846-d345-4862-b238-c5db85fb56a9.webp',
      mobileImage: 'assets/dddeb846-d345-4862-b238-c5db85fb56a9.png',
      mobileWebp: 'assets/dddeb846-d345-4862-b238-c5db85fb56a9.webp',
    },
  ],
  catalogSection: {
    title: 'Каталог оборудования',
    buttonText: 'Смотреть все',
    buttonLink: '/catalog',
    categories: [
      { id: 'cat-gnss', title: 'ГНСС-приемники', image: 'assets/ap40_laser.png', link: '/catalog?category=ГНСС-приёмники' },
      { id: 'cat-levels', title: 'Нивелиры и уровни', image: 'assets/3-Photoroom (1).png', link: '/catalog?category=levels' },
      { id: 'cat-controllers', title: 'Контроллеры', image: 'assets/cs3i_controller.png', link: '/catalog?category=Контроллеры и планшеты' },
      { id: 'cat-total', title: 'Тахеометры', image: 'assets/total_station.jpg', link: '/catalog?category=Тахеометры', roundedImage: true },
      { id: 'cat-radio', title: 'Радиосвязь', image: 'assets/adl35_radio.png', link: '/catalog?category=Радиосвязь' },
      { id: 'cat-acc', title: 'Аксессуары', image: 'assets/accessories_prism.jpg', link: '/catalog?category=accessories', roundedImage: true },
      { id: 'cat-sw', title: 'Полевое ПО', image: 'assets/client_title_software_apeksurv_cut.png', link: '/catalog?category=Полевое ПО', compactImage: true },
    ],
  },
  servicesSection: {
    title: 'Услуги и сервис',
    allLinkText: 'Все услуги',
    allLinkUrl: '/services',
    items: [
      {
        id: 'srv-1',
        title: 'Бесплатный тест-драйв',
        description: 'Предоставление оборудования на 3 дня на ваш реальный объект для проверки точности.',
        buttonText: 'Заказать выезд',
        contactSubject: 'Заявка на бесплатный тест-драйв',
      },
      {
        id: 'srv-2',
        title: 'Сервисное обслуживание',
        description: 'Ремонт и обслуживание геодезического оборудования любой сложности.',
        buttonText: 'Сдать на диагностику',
        contactSubject: 'Заявка на сервисное обслуживание',
      },
      {
        id: 'srv-3',
        title: 'Выгодный Trade-In',
        description: 'Обмен устаревших приборов любых брендов со скидкой на новое оборудование APEKS.',
        buttonText: 'Оценить прибор',
        contactSubject: 'Заявка на оценку Trade-In',
      },
      {
        id: 'srv-4',
        title: 'Кредит и рассрочка',
        description: 'Программы для ИП, физических и юридических лиц',
        buttonText: 'Рассчитать график',
        contactSubject: 'Заявка на кредит и рассрочку',
      },
    ],
  },
  featuredSection: {
    title: 'Лучшие предложения',
    items: [
      {
        id: 'feat-1',
        slug: 'ap80-pro',
        description: 'Флагманский RTK-приемник с фотограмметрией, лазерным дальномером и компенсацией наклона IMU 120°.',
        customImage: '',
        buttonText: 'Подробнее',
      },
      {
        id: 'feat-2',
        slug: 'ap40-laser-plus',
        description: 'Приемник со встроенным лазерным дальномером до 120 м для съемки недоступных точек без вехи.',
        customImage: '',
        buttonText: 'Подробнее',
      },
      {
        id: 'feat-3',
        slug: 'ap20-ar',
        description: 'Приемник с камерой для визуальной разбивки в дополненной реальности и IMU до 120°.',
        customImage: '',
        buttonText: 'Подробнее',
      },
      {
        id: 'feat-4',
        slug: 'ap10',
        description: 'Легкий и экономичный многоканальный GNSS-приемник для кадастровых и топографических съемок.',
        customImage: '',
        buttonText: 'Подробнее',
      },
    ],
  },
  aboutSection: {
    title: 'Официальный представитель APEKS в России',
    description: 'Мы — единственный официальный представитель APEKS в России. Оборудование APEKS разработано специально для геодезии, строительства, инженерных изысканий, кадастра и картографии. Исключительная эффективность — не значит дорого! Наша миссия — оборудование, которое сочетает превосходное качество и доступность для каждого.',
    cards: [
      {
        id: 'about-1',
        icon: 'location',
        title: 'Работаем на всей территории страны',
        text: 'Без посредников и дополнительных издержек, и это положительно сказывается на наших ценах.',
      },
      {
        id: 'about-2',
        icon: 'tradein',
        title: 'Трейд-ин, выгодные цены и акции',
        text: 'Честный трейд-ин, выгодные условия обмена, доступные цены и широкий ассортимент продукции.',
      },
      {
        id: 'about-3',
        icon: 'shield',
        title: 'Высокое качество, гарантия и поддержка',
        text: 'Поддерживаем лучшее качество, предлагаем поддержку высокой квалификации на всех этапах сотрудничества.',
      },
      {
        id: 'about-4',
        icon: 'truck',
        title: 'Логистика глобального масштаба',
        text: 'Осуществляем безопасную и быструю доставку в любую точку России и ближнего зарубежья.',
      },
    ],
  },
  videosSection: {
    title: 'APEKS в работе',
    subtitle: 'Реальные полевые испытания, обзоры функционала и демонстрация работы оборудования в суровых условиях.',
    buttonText: 'Все видео',
    contactSubject: 'Запрос демонстрационных видео',
    items: [
      {
        id: 'vid-1',
        title: 'Оборудование APEKS',
        description: 'Обзор линейки спутниковых RTK-приемников, контроллеров и программного обеспечения ApekSurv.',
        duration: '2 мин',
        image: 'assets/video_preview_lineup.jpg',
        linkText: 'Смотреть обзор',
        videoUrl: '',
        contactSubject: 'Видео: Оборудование APEKS',
      },
      {
        id: 'vid-2',
        title: 'APEKS AP20 AR',
        description: 'Разбивка по стрелкам на экране контроллера: визуальный вынос точек в натуру с дополненной реальностью.',
        duration: '33 с',
        image: 'assets/video_preview_ap20ar.jpg',
        linkText: 'Смотреть демонстрацию',
        videoUrl: '',
        contactSubject: 'Видео: APEKS AP20 AR',
      },
      {
        id: 'vid-3',
        title: 'APEKS AP40 Laser+',
        description: 'Лазерный дальномер 120 м и две камеры: высокоточные измерения без вехи в труднодоступных местах.',
        duration: '45 с',
        image: 'assets/video_preview_ap40laser.jpg',
        linkText: 'Смотреть полевой тест',
        videoUrl: '',
        contactSubject: 'Видео: APEKS AP40 Laser+',
      },
    ],
  },
  downloadsSection: {
    title: 'Инструкции и программное обеспечение',
    subtitle: 'Документация, руководства пользователя и актуальные версии прошивок',
    allLinkText: 'Все инструкции',
    allLinkUrl: '/instructions',
    items: [
      {
        id: 'dl-1',
        title: 'ApekSurv Android v2.4.1',
        subtitle: 'Полевое ПО на русском языке • APK',
        buttonText: 'Скачать',
        fileUrl: '',
        contactSubject: 'ApekSurv Android APK',
      },
      {
        id: 'dl-2',
        title: 'Каталог оборудования 2026',
        subtitle: 'Технические спецификации • PDF',
        buttonText: 'Скачать',
        fileUrl: '',
        contactSubject: 'Каталог оборудования 2026 PDF',
      },
      {
        id: 'dl-3',
        title: 'Файлы калибровок ANTEX',
        subtitle: 'Калибровки фазовых центров • ZIP',
        buttonText: 'Скачать',
        fileUrl: '',
        contactSubject: 'Файлы калибровок ANTEX ZIP',
      },
    ],
  },
  newsSection: {
    title: 'Новости компании',
    subtitle: 'Главные события, полевые испытания и технологические разработки APEKS GNSS',
    allLinkText: 'Все новости',
    selectedIds: ['news-1', 'news-2', 'news-3', 'news-4'],
  },
  contactsSection: {
    title: 'Остались вопросы или трудно выбрать?',
    subtitle: 'Заполните форму — наши сертифицированные инженеры проконсультируют вас и подберут оптимальный комплект оборудования под ваши задачи.',
    bullets: [
      'Свяжемся в течение 15 минут и уточним задачу',
      'Ответим на технические вопросы по приборам и софту',
      'Пришлем расчет стоимости и коммерческое предложение',
    ],
    phoneLabel: 'Отдел продаж',
    phone: '8 (800) 555-40-25',
    phoneHref: 'tel:+78005554025',
    emailLabel: 'Электронная почта',
    email: 'info@apeksgnss.ru',
  },
};

export function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE));
}

export function mergeHomepageWithDefaults(remoteData) {
  const base = cloneDefaults();
  if (!remoteData || typeof remoteData !== 'object') return base;

  const mergeObj = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    for (const key of Object.keys(target)) {
      if (source[key] === undefined || source[key] === null) continue;
      if (Array.isArray(target[key])) {
        if (Array.isArray(source[key])) {
          target[key] = JSON.parse(JSON.stringify(source[key]));
        }
      } else if (typeof target[key] === 'object') {
        mergeObj(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  return mergeObj(base, remoteData);
}
