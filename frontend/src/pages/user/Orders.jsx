import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserOrders } from "../../api/orderApi";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const formatCurrency = (amount) => {
  if (amount == null) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getBadgeClass = (status = "") => {
  const value = status.toUpperCase();

  if (["DELIVERED", "COMPLETED", "SUCCESS", "PAID"].includes(value)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["PENDING", "PROCESSING", "PLACED"].includes(value)) {
    return "bg-amber-100 text-amber-700";
  }

  if (["CANCELLED", "FAILED", "REJECTED"].includes(value)) {
    return "bg-red-100 text-red-700";
  }

  if (["SHIPPED", "DISPATCHED"].includes(value)) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getStoredUser();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        if (!user?.id && !user?.userId) {
          setError("User not found. Please login again.");
          setLoading(false);
          return;
        }

        const userId = user.id || user.userId;
        const data = await getUserOrders(userId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, user?.userId]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Orders</h2>
          <p className="text-muted mb-0">
            Track your recent purchases and order progress.
          </p>
        </div>

        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            aria-hidden="true"
          />
          <p className="mb-0 text-muted">Loading your orders...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h4 className="mb-2">No orders yet</h4>
            <p className="text-muted mb-4">
              You haven’t placed any orders yet. Start exploring products and
              place your first order.
            </p>
            <Link to="/products" className="btn btn-outline-primary">
              Browse Products
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="row g-4">
          {orders.map((order) => (
            <div className="col-12" key={order.id || order.orderNumber}>
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h5 className="mb-1">
                        Order #{order.orderNumber || order.id}
                      </h5>
                      <p className="text-muted mb-0">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-md-end">
                      <h6 className="fw-bold mb-2">
                        {formatCurrency(order.totalAmount)}
                      </h6>
                      <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                        <span className={`badge ${getBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus || "UNKNOWN"}
                        </span>
                        <span className={`badge ${getBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.orderItemId || item.productId}>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <img
                                    src={
                                      item.productImageUrl ||
                                      "https://via.placeholder.com/60x60?text=No+Image"
                                    }
                                    alt={item.productName || "Product"}
                                    width="60"
                                    height="60"
                                    className="rounded border"
                                    style={{ objectFit: "cover" }}
                                  />
                                  <div>
                                    <div className="fw-semibold">
                                      {item.productName}
                                    </div>
                                    <small className="text-muted">
                                      Product ID: {item.productId}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{formatCurrency(item.price)}</td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {order.shippingAddressSnapshot && (
                    <div className="mt-3">
                      <h6 className="mb-1">Shipping Address</h6>
                      <p className="text-muted mb-0">
                        {order.shippingAddressSnapshot}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}