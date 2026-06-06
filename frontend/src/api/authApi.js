import api from "./axios";

const AUTH_BASE = "/api/auth";

export const registerUser = async (data) => {
  const response = await api.post(`${AUTH_BASE}/register`, data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post(`${AUTH_BASE}/login`, data);
  return response.data;
};