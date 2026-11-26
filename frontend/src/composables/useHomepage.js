import { createCmsDocument, useCmsEditor } from './useCmsEditor.js';
import { cloneDefaults, mergeHomepageWithDefaults } from '../data/homepageDefaults.js';

const homepageDoc = createCmsDocument('homepage', cloneDefaults, mergeHomepageWithDefaults);

export function useHomepage() {
  const editor = useCmsEditor();
  return {
    ...editor,
    homepage: homepageDoc.data,
    publishedMeta: homepageDoc.publishedMeta,
    history: homepageDoc.history,
    isDirty: homepageDoc.isDirty,
    isLoading: homepageDoc.isLoading,
    isSaving: homepageDoc.isSaving,
    loadPublicHomepage: homepageDoc.loadPublic,
    loadAdminState: homepageDoc.loadAdmin,
    publishChanges: homepageDoc.publish,
    rollbackToVersion: homepageDoc.rollback,
    discardChanges: homepageDoc.discard,
    resetToTemplateDefaults: homepageDoc.resetToDefaults,
  };
}
