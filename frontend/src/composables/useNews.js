import { computed } from 'vue';
import { createCmsDocument, useCmsEditor } from './useCmsEditor.js';
import { cloneDefaultNews, mergeNewsWithDefaults } from '../data/newsDefaults.js';

const newsDoc = createCmsDocument('news', cloneDefaultNews, mergeNewsWithDefaults);

export function useNews() {
  const editor = useCmsEditor();
  const publishedNews = computed(() =>
    (newsDoc.data.value.items || []).filter((item) => item.published !== false)
  );

  function addNewsItem() {
    const num = (newsDoc.data.value.items?.length || 0) + 1;
    const id = `news-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    newsDoc.data.value.items.unshift({
      id,
      slug: `novost-${num}-${Date.now().toString().slice(-4)}`,
      date: today,
      category: 'Новости',
      title: 'Новая новость APEKS GNSS',
      summary: 'Краткий анонс новости для карточки на сайте.',
      content: 'Полный текст новости. Добавьте подробности, технические детали или итоги мероприятия.',
      image: 'assets/news_gnss_battle_2026.jpg',
      buttonText: 'Подробнее',
      linkUrl: '',
      published: true,
    });
    editor.selectTarget('newsItem', 0, 'news');
  }

  return {
    ...editor,
    newsData: newsDoc.data,
    publishedNews,
    newsPublishedMeta: newsDoc.publishedMeta,
    newsHistory: newsDoc.history,
    isNewsDirty: newsDoc.isDirty,
    isNewsSaving: newsDoc.isSaving,
    loadPublicNews: newsDoc.loadPublic,
    loadAdminNews: newsDoc.loadAdmin,
    publishNews: newsDoc.publish,
    rollbackNews: newsDoc.rollback,
    discardNews: newsDoc.discard,
    resetNewsToDefaults: newsDoc.resetToDefaults,
    addNewsItem,
  };
}
