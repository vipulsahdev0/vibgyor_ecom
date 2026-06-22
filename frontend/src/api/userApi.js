import api from "./axios";

const USER_BASE = "/api/users";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* =========================
   Current User Profile
========================= */

export const getUserProfile = async (
  userId
) => {
  const response = await api.get(
    `${USER_BASE}/${userId}`
  );

  return unwrap(response);
};

/* =========================
   Update Profile
========================= */

export const updateUserProfile = async (
  userId,
  data
) => {
  const response = await api.put(
    `${USER_BASE}/${userId}`,
    data
  );

  return unwrap(response);
};

/* =========================
   Change Password
========================= */

export const changePassword = async (
  userId,
  data
) => {
  const response = await api.patch(
    `${USER_BASE}/${userId}/password`,
    data
  );

  return unwrap(response);
};

/* =========================
   Admin - Get All Users
========================= */

export const getAllUsers = async () => {
  const response = await api.get(
    USER_BASE
  );

  return Array.isArray(unwrap(response))
    ? unwrap(response)
    : [];
};

/* =========================
   Admin - Get User By Id
========================= */

export const getUserById = async (
  userId
) => {
  const response = await api.get(
    `${USER_BASE}/${userId}`
  );

  return unwrap(response);
};

/* =========================
   Admin - Block User
========================= */

export const blockUser = async (
  userId
) => {
  const response = await api.patch(
    `${USER_BASE}/${userId}/block`
  );

  return unwrap(response);
};

/* =========================
   Admin - Unblock User
========================= */

export const unblockUser = async (
  userId
) => {
  const response = await api.patch(
    `${USER_BASE}/${userId}/unblock`
  );

  return unwrap(response);
};

/* =========================
   Admin - Delete User
========================= */

export const deleteUser = async (
  userId
) => {
  const response = await api.delete(
    `${USER_BASE}/${userId}`
  );

  return unwrap(response);
};

