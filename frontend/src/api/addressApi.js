import api from "./axios";

const ADDRESS_BASE = (userId) =>
  `/api/users/${userId}/addresses`;

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

export const getUserAddresses = async (userId) => {
  const response = await api.get(
    ADDRESS_BASE(userId)
  );

  return unwrap(response) || [];
};

export const getAddressById = async (
  userId,
  addressId
) => {
  const response = await api.get(
    `${ADDRESS_BASE(userId)}/${addressId}`
  );

  return unwrap(response);
};

export const getDefaultAddress = async (
  userId
) => {
  const response = await api.get(
    `${ADDRESS_BASE(userId)}/default`
  );

  return unwrap(response);
};

export const addAddress = async (
  userId,
  data
) => {
  const response = await api.post(
    ADDRESS_BASE(userId),
    data
  );

  return unwrap(response);
};

export const updateAddress = async (
  userId,
  addressId,
  data
) => {
  const response = await api.put(
    `${ADDRESS_BASE(userId)}/${addressId}`,
    data
  );

  return unwrap(response);
};

export const setDefaultAddress = async (
  userId,
  addressId
) => {
  const response = await api.patch(
    `${ADDRESS_BASE(userId)}/default`,
    {
      addressId,
    }
  );

  return unwrap(response);
};

export const deleteAddress = async (
  userId,
  addressId
) => {
  const response = await api.delete(
    `${ADDRESS_BASE(userId)}/${addressId}`
  );

  return unwrap(response);
};