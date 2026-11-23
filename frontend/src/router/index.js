import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ProductView from '../views/ProductView.vue';
import CatalogView from '../views/CatalogView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import PrivacyView from '../views/PrivacyView.vue';
import OfferView from '../views/OfferView.vue';
import ServicesView from '../views/ServicesView.vue';
import InstructionsView from '../views/InstructionsView.vue';
import PartnersView from '../views/PartnersView.vue';
import UniversalPageView from '../views/UniversalPageView.vue';

const isGhPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
const base = isGhPages ? '/apeks-gnss/' : '/';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: CatalogView,
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutView,
  },
  {
    path: '/products',
    redirect: '/catalog',
  },
  {
    path: '/product/:slug',
    name: 'Product',
    component: ProductView,
    props: true,
  },
  {
    path: '/products/:slug',
    name: 'ProductsSlug',
    component: ProductView,
    props: true,
  },
  {
    path: '/services',
    name: 'Services',
    component: ServicesView,
    alias: ['/uslugi', '/service']
  },
  {
    path: '/instructions',
    name: 'Instructions',
    component: InstructionsView,
    alias: ['/manuals', '/instrukcii', '/downloads']
  },
  {
    path: '/partners',
    name: 'Partners',
    component: PartnersView,
    alias: ['/partneram', '/dealers']
  },
  {
    path: '/page-template',
    name: 'PageTemplate',
    component: UniversalPageView,
    alias: ['/template', '/custom-page']
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: PrivacyView,
  },
  {
    path: '/offer',
    name: 'Offer',
    component: OfferView,
  },
  {
    path: '/oferta',
    redirect: '/offer',
  },
  {
    path: '/shop-terms.php',
    redirect: '/offer',
  },
  {
    path: '/terms',
    redirect: '/offer',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
];

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// Handle hash fallback if an old link with hash is opened (e.g. /#/product/apeks_ap10)
router.beforeEach((to, from, next) => {
  if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
    const hashPath = window.location.hash.slice(1);
    window.location.hash = '';
    return next(hashPath);
  }
  next();
});

export default router;
