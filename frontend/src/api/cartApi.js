import api from "./axios";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

const CART_BASE = (userId) =>
  `/api/users/${userId}/cart`;

/* =========================
   Get Cart
========================= */
export const getCart = async (userId) => {
  const response = await api.get(
    CART_BASE(userId)
  );

  return unwrap(response);
};

/* =========================
   Add Item To Cart
========================= */
export const addToCart = async (
  userId,
  productId,
  quantity = 1
) => {
  const response = await api.post(
    `${CART_BASE(userId)}/items`,
    {
      productId,
      quantity,
    }
  );

  return unwrap(response);
};

/* =========================
   Update Cart Item
========================= */
export const updateCartItem = async (
  userId,
  productId,
  quantity
) => {
  const response = await api.put(
    `${CART_BASE(userId)}/items`,
    {
      productId,
      quantity,
    }
  );

  return unwrap(response);
};

/* =========================
   Remove Cart Item
========================= */
export const removeCartItem = async (
  userId,
  cartItemId
) => {
  const response = await api.delete(
    `${CART_BASE(userId)}/items/${cartItemId}`
  );

  return unwrap(response);
};

/* =========================
   Clear Entire Cart
========================= */
export const clearCart = async (
  userId
) => {
  const response = await api.delete(
    `${CART_BASE(userId)}`
  );

  return unwrap(response);
};

/* =========================
   Cart Summary
========================= */
export const getCartSummary = async (
  userId
) => {
  const response = await api.get(
    `${CART_BASE(userId)}/summary`
  );

  return unwrap(response);
};