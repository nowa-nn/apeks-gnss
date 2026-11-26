import { computed, ref } from 'vue';
import {
  adminLogin,
  fetchAdminCms,
  fetchStoreCms,
  rollbackAdminCms,
  saveAdminCms,
  uploadAdminFile,
} from '../lib/medusa.js';

const TOKEN_KEY = 'apeks_medusa_admin_token';
const ACTIVE_KEY = 'apeks_editor_active';

const adminToken = ref(typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) || '' : '');
const isEditMode = ref(false);
const isPreviewMode = ref(false);
const activePageKey = ref('homepage');
const activeTarget = ref(null);
const editorError = ref('');
const editorNotice = ref('');

const registry = new Map();

export function createCmsDocument(key, cloneDefaultFn, mergeFn) {
  if (registry.has(key)) return registry.get(key);

  const data = ref(cloneDefaultFn());
  const publishedJson = ref(JSON.stringify(data.value));
  const publishedMeta = ref(null);
  const history = ref([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  let loadedPublic = false;

  const isDirty = computed(() => JSON.stringify(data.value) !== publishedJson.value);

  function applySnapshot(snapshot) {
    if (snapshot?.data) {
      const merged = mergeFn(snapshot.data);
      data.value = merged;
      publishedJson.value = JSON.stringify(merged);
      publishedMeta.value = { version: snapshot.version, saved_at: snapshot.saved_at };
    } else {
      const def = cloneDefaultFn();
      data.value = def;
      publishedJson.value = JSON.stringify(def);
      publishedMeta.value = null;
    }
  }

  async function loadPublic(force = false) {
    if (loadedPublic && !force) return;
    isLoading.value = true;
    try {
      const snapshot = await fetchStoreCms(key);
      if (snapshot?.data && (!isEditMode.value || !isDirty.value)) {
        applySnapshot(snapshot);
      } else if (!snapshot?.data) {
        publishedMeta.value = null;
      }
      loadedPublic = true;
    } catch (err) {
      console.warn(`CMS ${key}:`, err.message);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAdmin() {
    if (!adminToken.value) return;
    try {
      const res = await fetchAdminCms(adminToken.value, key);
      history.value = res.history || [];
      if (res.current?.data && !isDirty.value) {
        applySnapshot(res.current);
      } else if (res.current) {
        publishedMeta.value = { version: res.current.version, saved_at: res.current.saved_at };
      }
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        adminToken.value = '';
        sessionStorage.removeItem(TOKEN_KEY);
        activeTarget.value = null;
        editorError.value = 'Сессия администратора истекла, войдите снова';
      } else {
        editorError.value = err.message;
      }
    }
  }

  async function publish() {
    if (!adminToken.value) return;
    isSaving.value = true;
    editorError.value = '';
    try {
      const res = await saveAdminCms(adminToken.value, key, data.value);
      history.value = res.history || [];
      applySnapshot(res.current);
      setNotice(`Опубликована версия v${res.current.version}`);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        adminToken.value = '';
        sessionStorage.removeItem(TOKEN_KEY);
      }
      editorError.value = err.message || 'Не удалось сохранить изменения';
    } finally {
      isSaving.value = false;
    }
  }

  async function rollback(version) {
    if (!adminToken.value) return;
    isSaving.value = true;
    editorError.value = '';
    try {
      const res = await rollbackAdminCms(adminToken.value, key, version);
      history.value = res.history || [];
      applySnapshot(res.current);
      setNotice(`Восстановлена версия v${version} (текущая v${res.current.version})`);
    } catch (err) {
      editorError.value = err.message || 'Не удалось откатить версию';
    } finally {
      isSaving.value = false;
    }
  }

  function discard() {
    data.value = JSON.parse(publishedJson.value);
    setNotice('Несохранённые правки отменены');
  }

  function resetToDefaults() {
    data.value = cloneDefaultFn();
    setNotice('Загружен исходный шаблон. Нажмите «Опубликовать», чтобы применить.');
  }

  const doc = {
    key,
    data,
    publishedMeta,
    history,
    isDirty,
    isLoading,
    isSaving,
    loadPublic,
    loadAdmin,
    publish,
    rollback,
    discard,
    resetToDefaults,
  };
  registry.set(key, doc);
  return doc;
}

function setNotice(msg) {
  editorNotice.value = msg;
  if (msg) {
    setTimeout(() => {
      if (editorNotice.value === msg) editorNotice.value = '';
    }, 4500);
  }
}

export function useCmsEditor() {
  const isAuthenticated = computed(() => Boolean(adminToken.value));
  const showOverlays = computed(() => isEditMode.value && isAuthenticated.value && !isPreviewMode.value);

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

  async function loadAllAdminStates() {
    if (!adminToken.value) return;
    await Promise.all([...registry.values()].map((doc) => doc.loadAdmin()));
  }

  async function loginEditor(email, password) {
    editorError.value = '';
    const token = await adminLogin(email, password);
    adminToken.value = token;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(ACTIVE_KEY, '1');
    isEditMode.value = true;
    await loadAllAdminStates();
    setNotice('Вход выполнен. Нажмите на любой блок страницы для редактирования.');
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

  async function uploadMedia(file) {
    if (!adminToken.value) throw new Error('Требуется авторизация');
    return uploadAdminFile(adminToken.value, file);
  }

  function selectTarget(section, index = null, pageKey = activePageKey.value) {
    if (!isEditMode.value || isPreviewMode.value || !isAuthenticated.value) return;
    activeTarget.value = { pageKey, section, index };
  }

  function setPageKey(key) {
    if (activePageKey.value !== key) {
      activePageKey.value = key;
      activeTarget.value = null;
    }
  }

  function getDocument(key) {
    return registry.get(key) || null;
  }

  return {
    adminToken,
    isEditMode,
    isPreviewMode,
    isAuthenticated,
    showOverlays,
    activePageKey,
    activeTarget,
    editorError,
    editorNotice,
    detectEditParam,
    loadAllAdminStates,
    loginEditor,
    logoutEditor,
    exitEditMode,
    uploadMedia,
    selectTarget,
    setPageKey,
    setNotice,
    getDocument,
  };
}
