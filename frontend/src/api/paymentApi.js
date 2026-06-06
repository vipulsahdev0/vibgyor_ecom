import api from "./axios";

const PAYMENT_BASE = "/api/payments";

const normalizePaymentResponse = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid payment response received from server");
  }

  return {
    id: data.id ?? null,
    orderId: data.orderId ?? null,
    orderNumber: data.orderNumber ?? "",
    amount: data.amount ?? 0,
    paymentMethod: data.paymentMethod ?? null,
    transactionId: data.transactionId ?? null,
    paymentStatus: data.paymentStatus ?? "PENDING",
    paymentDate: data.paymentDate ?? null,
    failureReason: data.failureReason ?? null,
    createdAt: data.createdAt ?? null,
  };
};

export const processPayment = async (data) => {
  const response = await api.post(PAYMENT_BASE, data);
  return normalizePaymentResponse(response.data);
};

export const getPaymentByOrderId = async (orderId) => {
  const response = await api.get(`${PAYMENT_BASE}/order/${orderId}`);
  return normalizePaymentResponse(response.data);
};

export const updatePaymentStatus = async (paymentId, data) => {
  const response = await api.patch(`${PAYMENT_BASE}/${paymentId}/status`, data);
  return response.data;
};