import api from "./axios";

const PRODUCT_BASE = "/api/products";

export const getProducts = async (params = {}) => {
  const response = await api.get(PRODUCT_BASE, { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`${PRODUCT_BASE}/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post(PRODUCT_BASE, data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`${PRODUCT_BASE}/${id}`, data);
  return response.data;
};

export const updateProductStatus = async (id, status) => {
  const response = await api.patch(`${PRODUCT_BASE}/${id}/status`, null, {
    params: { status },
  });
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(PRODUCT_BASE, {
    params: { categoryId },
  });
  return response.data;
};