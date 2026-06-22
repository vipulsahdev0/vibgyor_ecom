import api from "./axios";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

const DASHBOARD_BASE = "/api/admin/dashboard";

export const getDashboardSummary = async () => {
  const response = await api.get(DASHBOARD_BASE);
  return unwrap(response);
};

export const getAdminCounts = async () => {
  const response = await api.get(`${DASHBOARD_BASE}/counts`);
  return unwrap(response);
};

export const getSalesStats = async () => {
  const response = await api.get(`${DASHBOARD_BASE}/sales`);
  return unwrap(response);
};

export const getOrderStats = async () => {
  const response = await api.get(`${DASHBOARD_BASE}/orders`);
  return unwrap(response);
};