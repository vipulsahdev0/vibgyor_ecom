import api from "./axios";

const ORDER_BASE = "/api/orders";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* =========================
   Place Order
========================= */
export const placeOrder = async (
  userId,
  orderData
) => {
  const response = await api.post(
    `${ORDER_BASE}/users/${userId}`,
    orderData
  );

  return unwrap(response);
};

/* =========================
   User Orders
========================= */
export const getUserOrders = async (
  userId
) => {
  const response = await api.get(
    `${ORDER_BASE}/users/${userId}`
  );

  return Array.isArray(unwrap(response))
    ? unwrap(response)
    : [];
};

/* =========================
   Order Details
========================= */
export const getOrderById = async (
  orderId
) => {
  const response = await api.get(
    `${ORDER_BASE}/${orderId}`
  );

  return unwrap(response);
};

/* =========================
   Search By Order Number
========================= */
export const getOrderByNumber = async (
  orderNumber
) => {
  const response = await api.get(
    `${ORDER_BASE}/number/${orderNumber}`
  );

  return unwrap(response);
};

/* =========================
   Admin Orders
========================= */
export const getAllOrders = async () => {
  const response = await api.get(
    ORDER_BASE
  );

  return Array.isArray(unwrap(response))
    ? unwrap(response)
    : [];
};

/* =========================
   Update Order Status
========================= */
export const updateOrderStatus = async (
  orderId,
  orderStatus,
  paymentStatus = null
) => {
  const response = await api.patch(
    `${ORDER_BASE}/${orderId}/status`,
    {
      orderStatus,
      paymentStatus,
    }
  );

  return unwrap(response);
};

/* =========================
   Cancel Order
========================= */
export const cancelOrder = async (
  orderId
) => {
  const response = await api.patch(
    `${ORDER_BASE}/${orderId}/cancel`
  );

  return unwrap(response);
};