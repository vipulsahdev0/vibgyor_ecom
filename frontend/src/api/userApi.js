import api, { USER_KEY } from "./axios";

const USER_BASE = "/api/users";

export const getCurrentUserId = () => {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) return null;

    const user = JSON.parse(rawUser);
    return user?.id ?? user?.userId ?? null;
  } catch {
    return null;
  }
};

export const getUserById = async (userId) => {
  const response = await api.get(`${USER_BASE}/${userId}`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch profile.");
  }

  const response = await api.get(`${USER_BASE}/${userId}/profile`);
  return response.data;
};

export const getMyProfile = async () => {
  const userId = getCurrentUserId();

  if (!userId) {
    throw new Error("Logged-in user not found. Please login again.");
  }

  const response = await api.get(`${USER_BASE}/${userId}/profile`);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get(USER_BASE, { params });
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`${USER_BASE}/${userId}/status`, null, {
    params: { status },
  });

  return response.data;
};