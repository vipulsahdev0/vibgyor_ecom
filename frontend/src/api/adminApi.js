// src/api/adminApi.js
import api from "./axios";

const ADMIN_BASE = "/api/admin";

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const getAllUsers = async (params = {}) => {
  const response = await api.get(`${ADMIN_BASE}/users`, { params });
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`${ADMIN_BASE}/users/${userId}/status`, null, {
    params: { status },
  });
  return response.data;
};

export const softDeleteUser = async (userId) => {
  const response = await api.delete(`${ADMIN_BASE}/users/${userId}`);
  return response.data;
};

// ── Orders (Admin) ────────────────────────────────────────────────────────────
export const updateAdminOrderStatus = async (orderId, data) => {
  const response = await api.patch(`${ADMIN_BASE}/orders/${orderId}/status`, data);
  return response.data;
};

export const updateAdminPaymentStatus = async (orderId, data) => {
  const response = await api.patch(`${ADMIN_BASE}/orders/${orderId}/payment-status`, data);
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await api.get(`${ADMIN_BASE}/orders`);
  return response.data;
};