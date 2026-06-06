import api from "./axios";

const getWishlistBase = (userId) =>
  `/api/users/${userId}/wishlist`;

export const getWishlist = async (
  userId
) => {
  const response = await api.get(
    getWishlistBase(userId)
  );

  return response.data;
};

export const addToWishlist = async (
  userId,
  productId
) => {
  const response = await api.post(
    `${getWishlistBase(userId)}/items`,
    { productId }
  );

  return response.data;
};

export const removeFromWishlist = async (
  userId,
  productId
) => {
  const response = await api.delete(
    `${getWishlistBase(userId)}/items/${productId}`
  );

  return response.data;
};