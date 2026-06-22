import api from "./axios";

const CATEGORY_BASE = "/api/categories";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* =========================
   Public Categories
========================= */

export const getCategories = async () => {
  const response = await api.get(CATEGORY_BASE);

  const categories = unwrap(response);

  return Array.isArray(categories)
    ? categories
    : [];
};

export const getCategoryById = async (categoryId) => {
  const response = await api.get(
    `${CATEGORY_BASE}/${categoryId}`
  );

  return unwrap(response);
};

/* =========================
   Admin Category APIs
========================= */

export const createCategory = async (payload) => {
  const response = await api.post(
    CATEGORY_BASE,
    payload
  );

  return unwrap(response);
};

export const updateCategory = async (
  categoryId,
  payload
) => {
  const response = await api.put(
    `${CATEGORY_BASE}/${categoryId}`,
    payload
  );

  return unwrap(response);
};

export const updateCategoryStatus = async (
  categoryId,
  status
) => {
  const response = await api.patch(
    `${CATEGORY_BASE}/${categoryId}/status`,
    { status }
  );

  return unwrap(response);
};

export const deleteCategory = async (
  categoryId
) => {
  const response = await api.delete(
    `${CATEGORY_BASE}/${categoryId}`
  );

  return unwrap(response);
};