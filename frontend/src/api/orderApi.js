import api from "./axios";

const ORDER_BASE = "/api/orders";

export const placeOrder = async (userId, data) => {
  const response = await api.post(`${ORDER_BASE}/users/${userId}`, data);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`${ORDER_BASE}/${orderId}`);
  return response.data;
};

export const getUserOrders = async (userId) => {
  const response = await api.get(`${ORDER_BASE}/users/${userId}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get(ORDER_BASE);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(`${ORDER_BASE}/${orderId}/cancel`);
  return response.data;
};

export const updateOrderStatus = async (orderId, data) => {
  const response = await api.patch(`${ORDER_BASE}/${orderId}/status`, 
    {
      orderStatus: status
    }
  );
  return response.data;
};