import api from "./axios";

const CATEGORY_BASE = "/api/categories";

export const getCategories = async () => {
  const response = await api.get(CATEGORY_BASE);

  return response.data.map((item) => ({
    id: item.id,
    categoryName: item.categoryName ?? item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    status: item.status,
    productCount: item.productCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

export const createCategory = async (
  data
) => {
  const response = await api.post(
    CATEGORY_BASE,
    data
  );

  return response.data;
};

export const updateCategory = async (
  id,
  data
) => {
  const response = await api.put(
    `${CATEGORY_BASE}/${id}`,
    data
  );

  return response.data;
};

export const updateCategoryStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `${CATEGORY_BASE}/${id}/status`,
    { status }
  );

  return response.data;
};