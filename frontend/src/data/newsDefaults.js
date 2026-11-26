export const DEFAULT_NEWS = {
  title: 'Новости компании',
  subtitle: 'Главные события, полевые испытания, выставки и технологические разработки APEKS GNSS',
  items: [
    {
      id: 'news-1',
      slug: 'gnss-battle-2026',
      date: '2026-10-15',
      category: 'Испытания',
      title: 'Компания APEKS GNSS выставила 7 приемников на соревнование GNSS Battle 2026',
      summary: 'На всероссийских независимых полевых испытаниях в сложных условиях под Истрой компания APEKS представила 7 приемников. AP80 Pro завоевал 1-е место (Гран-при).',
      content: `На всероссийских независимых полевых испытаниях GNSS Battle 2026 в сложных условиях под Истрой команда APEKS GNSS представила линейку из 7 спутниковых приёмников.

Испытания включали работу под плотным лесным пологом, вблизи линий электропередач, у фасадов зданий с многолучевым переотражением и съёмку труднодоступных точек с компенсацией наклона IMU и лазерным дальномером.

По итогам контрольных замеров флагманский приёмник APEKS AP80 PRO занял 1-е место и получил Гран-при соревнований за скорость инициализации RTK и точность бесконтактных измерений.`,
      image: 'assets/news_gnss_battle_2026.jpg',
      buttonText: 'Подробнее',
      linkUrl: '',
      published: true,
    },
    {
      id: 'news-2',
      slug: 'intergeo-2026',
      date: '2026-09-28',
      category: 'Выставки',
      title: 'Премьера флагманских систем APEKS на всемирной выставке INTERGEO 2026',
      summary: 'В Мессе Мюнхен на ведущем мировом геодезическом форуме стенд APEKS посетили более 3 000 специалистов. Представлены новинки с технологией AR и лазером.',
      content: `На международной геодезической выставке INTERGEO 2026 в Мюнхене стенд APEKS GNSS стал одной из самых посещаемых площадок форума — за три дня с новинками познакомились более 3 000 инженеров и геодезистов.

Особый интерес вызвали компактный RTK-приёмник AP30 Laser с зелёным лазерным дальномером и визуальной AR-разбивкой, а также обновлённая линейка полевых контроллеров под управлением ApekSurv.`,
      image: 'assets/news_intergeo_2026.jpg',
      buttonText: 'Подробнее',
      linkUrl: '',
      published: true,
    },
    {
      id: 'news-3',
      slug: 'service-network-expansion',
      date: '2026-09-10',
      category: 'Сервис',
      title: 'Расширение сети авторизованных сервисных центров APEKS в РФ',
      summary: 'Официальное представительство открыло новые сертифицированные лаборатории метрологической поверки и гарантийного ремонта в 12 крупных регионах.',
      content: `Официальное представительство APEKS в России расширило сеть авторизованных сервисных центров и метрологических лабораторий в 12 крупных регионах страны.

Теперь пользователи оборудования APEKS могут пройти ежегодную поверку, калибровку IMU/оптических модулей, обновление ПО и гарантийное обслуживание в кратчайшие сроки без пересылки оборудования в центральный офис.`,
      image: 'assets/news_service_network.jpg',
      buttonText: 'Подробнее',
      linkUrl: '',
      published: true,
    },
    {
      id: 'news-4',
      slug: 'apeksurv-update-3-8-4',
      date: '2026-08-22',
      category: 'Обновление ПО',
      title: 'Масштабное обновление софта ApekSurv: поддержка IFC, BIM и МСК',
      summary: 'В релизе ApekSurv 3.8.4 Pro добавлены: прямой импорт 3D-моделей BIM/IFC, калибровка местных систем координат и режим выноса точек в видео 60 fps.',
      content: `Вышел крупный релиз полевого программного обеспечения ApekSurv 3.8.4 Pro для контроллеров и Android-устройств.

Ключевые нововведения версии:
• Прямой импорт 3D-моделей в форматах BIM / IFC с послойным отображением элементов конструкции.
• Ускоренная калибровка местных систем координат (МСК) по опорным пунктам.
• Плавный режим AR-выноса точек в натуру с частотой видеопотока 60 fps.`,
      image: 'assets/news_apeksurv_update.jpg',
      buttonText: 'Подробнее',
      linkUrl: '',
      published: true,
    },
  ],
};

export function cloneDefaultNews() {
  return JSON.parse(JSON.stringify(DEFAULT_NEWS));
}

export function mergeNewsWithDefaults(remoteData) {
  const base = cloneDefaultNews();
  if (!remoteData || typeof remoteData !== 'object') return base;
  return {
    title: typeof remoteData.title === 'string' ? remoteData.title : base.title,
    subtitle: typeof remoteData.subtitle === 'string' ? remoteData.subtitle : base.subtitle,
    items: Array.isArray(remoteData.items)
      ? JSON.parse(JSON.stringify(remoteData.items))
      : base.items,
  };
}
