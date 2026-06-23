import api from "./axios";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

const WISHLIST_BASE = (userId) =>
  `/api/users/${userId}/wishlist`;

/* =========================
   Get Wishlist
========================= */

export const getWishlist = async (
  userId
) => {
  const response = await api.get(
    WISHLIST_BASE(userId)
  );

  return Array.isArray(unwrap(response))
    ? unwrap(response)
    : [];
};

/* =========================
   Add Item
========================= */

export const addToWishlist = async (
  userId,
  productId
) => {
  const response = await api.post(
    `${WISHLIST_BASE(userId)}/items`,
    {
      productId,
    }
  );

  return unwrap(response);
};

/* =========================
   Remove Item
========================= */

export const removeFromWishlist =
  async (
    userId,
    productId
  ) => {
    const response = await api.delete(
      `${WISHLIST_BASE(userId)}/items/${productId}`
    );

    return unwrap(response);
  };

/* =========================
   Check Product Exists
========================= */

export const isInWishlist = async (
  userId,
  productId
) => {
  const response = await api.get(
    `${WISHLIST_BASE(userId)}/items/${productId}`
  );

  return unwrap(response);
};

/* =========================
   Clear Wishlist
========================= */

export const clearWishlist = async (
  userId
) => {
  const response = await api.delete(
    WISHLIST_BASE(userId)
  );

  return unwrap(response);
};

export const isProductInWishlist = async (userId, productId) => {
  const response = await api.get(`/api/users/${userId}/wishlist/items/${productId}/exists`);
  return response?.data?.data ?? response?.data ?? false;
};