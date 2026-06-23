import api from "./axios";

const CATEGORY_BASE = "/api/categories";

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const cleanPayload = (payload = {}) => ({
  name: payload?.name?.trim?.() ?? "",
  description: payload?.description?.trim?.() || "",
  imageUrl: payload?.imageUrl?.trim?.() || "",
});

export const getCategories = async (params = {}) => {
  const query = {};

  if (params.status) query.status = params.status;
  if (params.keyword?.trim()) query.keyword = params.keyword.trim();

  const response = await api.get(CATEGORY_BASE, { params: query });
  const categories = unwrap(response);

  return Array.isArray(categories) ? categories : [];
};

export const getCategoryById = async (categoryId) => {
  if (!categoryId) throw new Error("Category ID is required");

  const response = await api.get(`${CATEGORY_BASE}/${categoryId}`);
  return unwrap(response);
};

export const createCategory = async (payload) => {
  const response = await api.post(CATEGORY_BASE, cleanPayload(payload));
  return unwrap(response);
};

export const updateCategory = async (categoryId, payload) => {
  if (!categoryId) throw new Error("Category ID is required");

  const response = await api.put(
    `${CATEGORY_BASE}/${categoryId}`,
    cleanPayload(payload)
  );

  return unwrap(response);
};

export const updateCategoryStatus = async (categoryId, status) => {
  if (!categoryId) throw new Error("Category ID is required");
  if (!status) throw new Error("Status is required");

  const response = await api.patch(`${CATEGORY_BASE}/${categoryId}/status`, {
    status,
  });

  return unwrap(response);
};

export const deleteCategory = async (categoryId) => {
  if (!categoryId) throw new Error("Category ID is required");

  const response = await api.delete(`${CATEGORY_BASE}/${categoryId}`);
  return unwrap(response);
};