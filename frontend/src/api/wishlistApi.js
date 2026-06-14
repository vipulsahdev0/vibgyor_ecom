import api from "./axios";

const getWishlistBase = (userId) =>
  `/api/users/${userId}/wishlist`;

export const getWishlist = async (userId) => {
  const { data } = await api.get(
    getWishlistBase(userId)
  );

  return data;
};

export const addToWishlist = async (
  userId,
  productId
) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const { data } = await api.post(
    `${getWishlistBase(userId)}/items`,
    {
      productId: Number(productId),
    }
  );

  return data;
};

export const removeFromWishlist = async (
  userId,
  productId
) => {
  const { data } = await api.delete(
    `${getWishlistBase(userId)}/items/${productId}`
  );

  return data;
};