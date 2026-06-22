import api from "./axios";

const PAYMENT_BASE = "/api/payments";

const unwrap = (response) =>
  response?.data?.data ?? response?.data ?? null;

/* =========================
   Create Payment
========================= */
export const createPayment = async (
  orderId,
  amount,
  paymentMethod
) => {
  const response = await api.post(
    `${PAYMENT_BASE}/create`,
    {
      orderId,
      amount,
      paymentMethod,
    }
  );

  return unwrap(response);
};

/* =========================
   Verify Payment
========================= */
export const verifyPayment = async ({
  orderId,
  paymentReference,
  success,
  transactionId = null,
  providerResponse = null,
}) => {
  const response = await api.post(
    `${PAYMENT_BASE}/verify`,
    {
      orderId,
      paymentReference,
      success,
      transactionId,
      providerResponse,
    }
  );

  return unwrap(response);
};

/* =========================
   Payment By Order
========================= */
export const getPaymentByOrderId = async (
  orderId
) => {
  const response = await api.get(
    `${PAYMENT_BASE}/order/${orderId}`
  );

  return unwrap(response);
};

/* =========================
   Payment By Id
========================= */
export const getPaymentById = async (
  paymentId
) => {
  const response = await api.get(
    `${PAYMENT_BASE}/${paymentId}`
  );

  return unwrap(response);
};

/* =========================
   Transaction Lookup
========================= */
export const getPaymentByTransactionId =
  async (transactionId) => {
    const response = await api.get(
      `${PAYMENT_BASE}/transaction/${transactionId}`
    );

    return unwrap(response);
  };

/* =========================
   Admin Payments
========================= */
export const getAllPayments = async (
  params = {}
) => {
  const response = await api.get(
    PAYMENT_BASE,
    { params }
  );

  return unwrap(response) || [];
};

/* =========================
   Admin Status Update
========================= */
export const updatePaymentStatus =
  async (
    paymentId,
    paymentStatus,
    failureReason = null
  ) => {
    const response = await api.patch(
      `${PAYMENT_BASE}/${paymentId}/status`,
      {
        paymentStatus,
        failureReason,
      }
    );

    return unwrap(response);
  };

  export const processPayment = async ({
  orderId,
  amount,
  paymentMethod,
}) => {
  return createPayment(
    orderId,
    amount,
    paymentMethod
  );
};