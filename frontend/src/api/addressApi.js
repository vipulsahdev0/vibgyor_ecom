import api from "./axios";

const getAddressBasePath = (userId) => `/api/users/${userId}/addresses`;

export const getUserAddresses = async (userId) => {
  const res = await api.get(getAddressBasePath(userId));
  return res.data;
};

export const addAddress = async (userId, data) => {
  const res = await api.post(getAddressBasePath(userId), data);
  return res.data;
};

export const updateAddress = async (userId, addressId, data) => {
  const res = await api.put(`${getAddressBasePath(userId)}/${addressId}`, data);
  return res.data;
};

export const getAddressById = async (userId, addressId) => {
  const res = await api.get(`${getAddressBasePath(userId)}/${addressId}`);
  return res.data;
};

export const getDefaultAddress = async (userId) => {
  const res = await api.get(`${getAddressBasePath(userId)}/default`);
  return res.data;
};

export const setDefaultAddress = async (userId, addressId) => {
  const res = await api.patch(`${getAddressBasePath(userId)}/default`, { addressId });
  return res.data;
};

// Use this only if backend DELETE endpoint really exists.
export const deleteAddress = async (userId, addressId) => {
  const res = await api.delete(`${getAddressBasePath(userId)}/${addressId}`);
  return res.data;
};