import api from "./axios";

const getCartBasePath = (userId) =>
  `/api/users/${userId}/cart`;

export const getCart = async (userId) => {
  try {
    const response = await api.get(
      getCartBasePath(userId)
    );
    return response.data || {
      items: [],
      totalItems: 0,
      subtotal: 0,
      discountTotal: 0,
      grandTotal: 0,
    };
  } catch (error) {
    // Return empty cart structure on error, let context handle the error
    throw error;
  }
};

export const addToCart = async (userId, data) => {
  const response = await api.post(
    `${getCartBasePath(userId)}/items`,
    data
  );
  return response.data;
};

export const updateCartItem = async (userId, data) => {
  const response = await api.put(
    `${getCartBasePath(userId)}/items`,
    data
  );
  return response.data;
};

export const removeCartItem = async (
  userId,
  productId
) => {
  const response = await api.delete(
    `${getCartBasePath(userId)}/items/${productId}`
  );
  return response.data;
};

export const getCartSummary = async (userId) => {
  const response = await api.get(
    `${getCartBasePath(userId)}/summary`
  );
  return response.data;
};

export const clearCart = async (userId) => {
  const response = await api.delete(
    getCartBasePath(userId)
  );
  return response.data;
};