import { computed, ref } from 'vue';
import { cloneDefaults, mergeHomepageWithDefaults } from '../data/homepageDefaults.js';
import {
  adminLogin,
  fetchAdminHomepage,
  fetchStoreHomepage,
  rollbackAdminHomepage,
  saveAdminHomepage,
  uploadAdminFile,
} from '../lib/medusa.js';

const TOKEN_KEY = 'apeks_medusa_admin_token';
const ACTIVE_KEY = 'apeks_editor_active';

const homepage = ref(cloneDefaults());
const publishedJson = ref(JSON.stringify(homepage.value));
const publishedMeta = ref(null);
const history = ref([]);
const adminToken = ref(typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) || '' : '');
const isEditMode = ref(false);
const isPreviewMode = ref(false);
const activeTarget = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const editorError = ref('');
const editorNotice = ref('');

let loadedStore = false;

export function useHomepage() {
  const isAuthenticated = computed(() => Boolean(adminToken.value));
  const isDirty = computed(() => JSON.stringify(homepage.value) !== publishedJson.value);

  function setNotice(msg) {
    editorNotice.value = msg;
    if (msg) {
      setTimeout(() => {
        if (editorNotice.value === msg) editorNotice.value = '';
      }, 4500);
    }
  }

  function detectEditParam() {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === '1' || params.get('edit') === 'true') {
      sessionStorage.setItem(ACTIVE_KEY, '1');
      isEditMode.value = true;
      return true;
    }
    if (sessionStorage.getItem(ACTIVE_KEY) === '1' && adminToken.value) {
      isEditMode.value = true;
      return true;
    }
    return false;
  }

  function applySnapshot(snapshot) {
    if (snapshot?.data) {
      const merged = mergeHomepageWithDefaults(snapshot.data);
      homepage.value = merged;
      publishedJson.value = JSON.stringify(merged);
      publishedMeta.value = { version: snapshot.version, saved_at: snapshot.saved_at };
    } else {
      const def = cloneDefaults();
      homepage.value = def;
      publishedJson.value = JSON.stringify(def);
      publishedMeta.value = null;
    }
  }

  async function loadPublicHomepage(force = false) {
    if (loadedStore && !force) return;
    isLoading.value = true;
    try {
      const snapshot = await fetchStoreHomepage();
      if (snapshot?.data && (!isEditMode.value || !isDirty.value)) {
        applySnapshot(snapshot);
      } else if (!snapshot?.data) {
        publishedMeta.value = null;
      }
      loadedStore = true;
    } catch (err) {
      console.warn('Homepage sync:', err.message);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAdminState() {
    if (!adminToken.value) return;
    editorError.value = '';
    try {
      const res = await fetchAdminHomepage(adminToken.value);
      history.value = res.history || [];
      if (res.homepage?.data && !isDirty.value) {
        applySnapshot(res.homepage);
      } else if (res.homepage) {
        publishedMeta.value = { version: res.homepage.version, saved_at: res.homepage.saved_at };
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logoutEditor();
        editorError.value = 'Сессия администратора истекла, войдите снова';
      } else {
        editorError.value = err.message;
      }
    }
  }

  async function loginEditor(email, password) {
    editorError.value = '';
    const token = await adminLogin(email, password);
    adminToken.value = token;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(ACTIVE_KEY, '1');
    isEditMode.value = true;
    await loadAdminState();
    setNotice('Вход выполнен. Нажмите на любой блок главной страницы для редактирования.');
  }

  function logoutEditor() {
    adminToken.value = '';
    sessionStorage.removeItem(TOKEN_KEY);
    activeTarget.value = null;
  }

  function exitEditMode() {
    isEditMode.value = false;
    isPreviewMode.value = false;
    activeTarget.value = null;
    sessionStorage.removeItem(ACTIVE_KEY);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('edit')) {
        url.searchParams.delete('edit');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    }
  }

  async function publishChanges() {
    if (!adminToken.value) return;
    isSaving.value = true;
    editorError.value = '';
    try {
      const res = await saveAdminHomepage(adminToken.value, homepage.value);
      history.value = res.history || [];
      applySnapshot(res.homepage);
      setNotice(`Опубликована версия v${res.homepage.version}`);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logoutEditor();
      }
      editorError.value = err.message || 'Не удалось сохранить изменения';
    } finally {
      isSaving.value = false;
    }
  }

  async function rollbackToVersion(version) {
    if (!adminToken.value) return;
    isSaving.value = true;
    editorError.value = '';
    try {
      const res = await rollbackAdminHomepage(adminToken.value, version);
      history.value = res.history || [];
      applySnapshot(res.homepage);
      setNotice(`Восстановлена версия v${version} (текущая v${res.homepage.version})`);
    } catch (err) {
      editorError.value = err.message || 'Не удалось откатить версию';
    } finally {
      isSaving.value = false;
    }
  }

  function discardChanges() {
    homepage.value = JSON.parse(publishedJson.value);
    setNotice('Несохранённые правки отменены');
  }

  function resetToTemplateDefaults() {
    homepage.value = cloneDefaults();
    setNotice('Загружен исходный шаблон. Нажмите «Опубликовать», чтобы применить.');
  }

  async function uploadMedia(file) {
    if (!adminToken.value) throw new Error('Требуется авторизация');
    return uploadAdminFile(adminToken.value, file);
  }

  function selectTarget(section, index = null) {
    if (!isEditMode.value || isPreviewMode.value || !isAuthenticated.value) return;
    activeTarget.value = { section, index };
  }

  return {
    homepage,
    publishedMeta,
    history,
    isEditMode,
    isPreviewMode,
    isAuthenticated,
    isDirty,
    isLoading,
    isSaving,
    activeTarget,
    editorError,
    editorNotice,
    detectEditParam,
    loadPublicHomepage,
    loadAdminState,
    loginEditor,
    logoutEditor,
    exitEditMode,
    publishChanges,
    rollbackToVersion,
    discardChanges,
    resetToTemplateDefaults,
    uploadMedia,
    selectTarget,
  };
}
