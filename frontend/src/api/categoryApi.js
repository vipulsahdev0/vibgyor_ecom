import api from "./axios";

const CATEGORY_BASE = "/api/categories";

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const cleanString = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const cleanPayload = (payload = {}) => ({
  name: cleanString(payload?.name),
  description: cleanString(payload?.description),
  imageUrl: cleanString(payload?.imageUrl),
});

const validateCategoryId = (categoryId) => {
  if (categoryId == null || categoryId === "") {
    throw new Error("Category ID is required");
  }
};

export const getCategories = async (params = {}) => {
  const query = {};

  if (params?.status) {
    query.status = params.status;
  }

  if (typeof params?.keyword === "string" && params.keyword.trim()) {
    query.keyword = params.keyword.trim();
  }

  const response = await api.get(CATEGORY_BASE, { params: query });
  const categories = unwrap(response);

  return Array.isArray(categories) ? categories : [];
};

export const getCategoryById = async (categoryId) => {
  validateCategoryId(categoryId);

  const response = await api.get(`${CATEGORY_BASE}/${categoryId}`);
  return unwrap(response);
};

export const createCategory = async (payload = {}) => {
  const response = await api.post(CATEGORY_BASE, cleanPayload(payload));
  return unwrap(response);
};

export const updateCategory = async (categoryId, payload = {}) => {
  validateCategoryId(categoryId);

  const response = await api.put(
    `${CATEGORY_BASE}/${categoryId}`,
    cleanPayload(payload)
  );

  return unwrap(response);
};

export const updateCategoryStatus = async (categoryId, status) => {
  validateCategoryId(categoryId);

  const nextStatus =
    typeof status === "string" ? status.trim().toUpperCase() : "";

  if (!nextStatus) {
    throw new Error("Status is required");
  }

  const response = await api.patch(`${CATEGORY_BASE}/${categoryId}/status`, {
    status: nextStatus,
  });

  return unwrap(response);
};

export const deleteCategory = async (categoryId) => {
  validateCategoryId(categoryId);

  const response = await api.delete(`${CATEGORY_BASE}/${categoryId}`);
  return unwrap(response);
};