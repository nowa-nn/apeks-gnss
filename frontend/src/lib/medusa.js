import { products } from '../data/products.js';
import { getMedusaBaseUrl, normalizeMediaUrl } from '../utils/assets.js';

const apiUrl = getMedusaBaseUrl();
const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;

async function request(path, options = {}) {
  if (!publishableKey) throw new Error('Ключ витрины Medusa не настроен');
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': publishableKey,
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Ошибка сервера (${response.status})`);
  return body;
}

async function adminRequest(path, token, options = {}) {
  if (!token) throw new Error('Требуется вход администратора');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(body.message || `Ошибка сервера (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return body;
}

let storeDataPromise;

async function getStoreData() {
  if (!storeDataPromise) {
    storeDataPromise = (async () => {
      const { regions } = await request('/store/regions');
      const region = regions.find((item) => item.currency_code === 'rub');
      if (!region) throw new Error('Регион России в Medusa не найден');
      const query = new URLSearchParams({ region_id: region.id, limit: '100' });
      const { products: medusaProducts } = await request(`/store/products?${query}`);
      return { region, medusaProducts };
    })().catch((error) => {
      storeDataPromise = null;
      throw error;
    });
  }
  return storeDataPromise;
}

function baseVariant(product) {
  return product.variants?.find((variant) => variant.sku?.endsWith('-base'));
}

function variantPrice(variant) {
  return variant?.calculated_price?.calculated_amount;
}

export async function syncCatalog() {
  const { medusaProducts } = await getStoreData();
  for (const item of products) {
    const remote = medusaProducts.find((product) => product.handle === item.slug.replaceAll('_', '-'));
    if (!remote) continue;
    const amount = variantPrice(baseVariant(remote));
    if (typeof amount === 'number') item.price = amount;
    const software = remote.variants?.find((variant) => variant.sku?.endsWith('-software'));
    const controller = remote.variants?.find((variant) => variant.sku?.endsWith('-controller'));
    if (typeof amount === 'number' && item.kitOptions?.software && typeof variantPrice(software) === 'number') {
      item.kitOptions.software.price = variantPrice(software) - amount;
    }
    if (typeof amount === 'number' && item.kitOptions?.controller && typeof variantPrice(controller) === 'number') {
      item.kitOptions.controller.price = variantPrice(controller) - amount;
    }
    const full = remote.variants?.find((variant) => variant.sku?.endsWith('-full'));
    if (item.kitOptions && typeof variantPrice(full) === 'number') {
      item.kitOptions.fullPrice = variantPrice(full);
    }
    if (remote.thumbnail && remote.thumbnail.includes('/static/')) {
      item.mainImage = normalizeMediaUrl(remote.thumbnail);
    }
    if (remote.title) item.title = remote.title;
  }
}

export async function fetchStoreCms(key) {
  const { content } = await request(`/store/cms/${encodeURIComponent(key)}`);
  return content || null;
}

export async function fetchStoreHomepage() {
  return fetchStoreCms('homepage');
}

export async function adminLogin(email, password) {
  const response = await fetch(`${apiUrl}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.token) {
    throw new Error(body.message || 'Неверный логин или пароль администратора');
  }
  await adminRequest('/admin/users/me', body.token);
  return body.token;
}

export async function fetchAdminCms(token, key) {
  return adminRequest(`/admin/cms/${encodeURIComponent(key)}`, token);
}

export async function saveAdminCms(token, key, data) {
  return adminRequest(`/admin/cms/${encodeURIComponent(key)}`, token, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function rollbackAdminCms(token, key, version) {
  return adminRequest(`/admin/cms/${encodeURIComponent(key)}/rollback`, token, {
    method: 'POST',
    body: JSON.stringify({ version }),
  });
}

export async function fetchAdminHomepage(token) {
  return fetchAdminCms(token, 'homepage');
}

export async function saveAdminHomepage(token, data) {
  return saveAdminCms(token, 'homepage', data);
}

export async function rollbackAdminHomepage(token, version) {
  return rollbackAdminCms(token, 'homepage', version);
}

export async function uploadAdminFile(token, file) {
  const form = new FormData();
  form.append('files', file, file.name);
  const res = await adminRequest('/admin/uploads', token, {
    method: 'POST',
    body: form,
  });
  const uploaded = res.files?.[0];
  if (!uploaded?.url) {
    throw new Error('Сервер не вернул ссылку на загруженный файл');
  }
  return normalizeMediaUrl(uploaded.url);
}

function cartVariant(item, medusaProducts) {
  const local = products.find((product) =>
    product.slug === item.slug || item.title?.startsWith(product.title)
  );
  const remote = medusaProducts.find((product) => product.handle === local?.slug.replaceAll('_', '-'));
  if (!remote) throw new Error(`Товар «${item.title}» не найден в Medusa`);
  const configuration = item.configuration || (
    item.title?.includes('[')
      ? item.title.includes('ПО') && item.title.includes('Контроллер') ? 'full'
        : item.title.includes('ПО') ? 'software' : 'controller'
      : 'base'
  );
  const variant = remote.variants?.find((entry) => entry.sku?.endsWith(`-${configuration}`));
  if (!variant) throw new Error(`Комплектация «${item.title}» недоступна`);
  const amount = variantPrice(variant);
  if (typeof amount === 'number' && amount !== Number(item.price)) {
    throw new Error(`Цена «${item.title}» изменилась. Обновите страницу и добавьте товар заново.`);
  }
  return variant;
}

export async function placeOrder(form, cartItems) {
  const { region, medusaProducts } = await getStoreData();
  const selected = cartItems.map((item) => ({
    variant: cartVariant(item, medusaProducts),
    quantity: Math.max(1, Number(item.qty) || 1),
  }));
  if (!selected.length) throw new Error('Корзина пуста');

  const { cart } = await request('/store/carts', {
    method: 'POST', body: JSON.stringify({ region_id: region.id }),
  });
  for (const item of selected) {
    await request(`/store/carts/${cart.id}/line-items`, {
      method: 'POST', body: JSON.stringify({ variant_id: item.variant.id, quantity: item.quantity }),
    });
  }
  const name = form.fullName.trim().split(/\s+/);
  const address = {
    first_name: name[1] || name[0], last_name: name[0],
    phone: form.phone, country_code: 'ru',
    city: form.deliveryType === 'pickup' ? 'Одинцово' : form.city.trim(),
    address_1: form.deliveryType === 'pickup' ? 'Западная, 181' : form.address.trim(),
  };
  await request(`/store/carts/${cart.id}`, {
    method: 'POST', body: JSON.stringify({
      email: form.email.trim(), shipping_address: address,
      metadata: { delivery_type: form.deliveryType, customer_name: form.fullName.trim(), payment_intent: 'sbp_later' },
    }),
  });
  const { shipping_options: shippingOptions } = await request(`/store/shipping-options?cart_id=${cart.id}`);
  const shipping = shippingOptions.find((option) =>
    option.type?.code === form.deliveryType || option.name?.toLowerCase().includes(form.deliveryType === 'pickup' ? 'самовывоз' : 'сдэк')
  );
  if (!shipping) throw new Error('Способ доставки недоступен');
  await request(`/store/carts/${cart.id}/shipping-methods`, {
    method: 'POST', body: JSON.stringify({ option_id: shipping.id }),
  });
  const { payment_collection: collection } = await request('/store/payment-collections', {
    method: 'POST', body: JSON.stringify({ cart_id: cart.id }),
  });
  await request(`/store/payment-collections/${collection.id}/payment-sessions`, {
    method: 'POST', body: JSON.stringify({ provider_id: 'pp_system_default' }),
  });
  const completed = await request(`/store/carts/${cart.id}/complete`, { method: 'POST' });
  if (completed.type !== 'order' || !completed.order) {
    throw new Error('Заказ не подтверждён сервером. Проверьте его статус у менеджера.');
  }
  return completed.order;
}
