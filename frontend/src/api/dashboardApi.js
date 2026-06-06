import api from "./axios";

const ADMIN_DASHBOARD_BASE = "/api/admin/dashboard";

export const getDashboardData = async () => {
  const response = await api.get(
    ADMIN_DASHBOARD_BASE
  );

  return response.data;
};