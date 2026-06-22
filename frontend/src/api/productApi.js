import api from "./axios";

const PRODUCT_BASE = "/api/products";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* =========================
   Public Products
========================= */

export const getProducts = async (params = {}) => {
  const response = await api.get(
    PRODUCT_BASE,
    { params }
  );

  return unwrap(response) || [];
};

export const getProductById = async (
  productId
) => {
  const response = await api.get(
    `${PRODUCT_BASE}/${productId}`
  );

  return unwrap(response);
};

export const getProductsByCategory =
  async (categoryId) => {
    const response = await api.get(
      `${PRODUCT_BASE}/category/${categoryId}`
    );

    return unwrap(response) || [];
  };

export const searchProducts = async (
  keyword
) => {
  const response = await api.get(
    PRODUCT_BASE,
    {
      params: {
        keyword,
      },
    }
  );

  return unwrap(response) || [];
};

/* =========================
   Admin Product Management
========================= */

export const createProduct = async (
  data
) => {
  const response = await api.post(
    PRODUCT_BASE,
    data
  );

  return unwrap(response);
};

export const updateProduct = async (
  productId,
  data
) => {
  const response = await api.put(
    `${PRODUCT_BASE}/${productId}`,
    data
  );

  return unwrap(response);
};

export const updateProductStatus = async (
  productId,
  status
) => {
  const response = await api.patch(
    `${PRODUCT_BASE}/${productId}/status`,
    null,
    {
      params: { status }
    }
  );

  return unwrap(response);
};

export const deleteProduct = async (
  productId
) => {
  const response = await api.delete(
    `${PRODUCT_BASE}/${productId}`
  );

  return unwrap(response);
};

/* =========================
   Inventory
========================= */

export const updateStock = async (
  productId,
  stockQuantity
) => {
  const response = await api.patch(
    `${PRODUCT_BASE}/${productId}/stock`,
    {
      stockQuantity,
    }
  );

  return unwrap(response);
};