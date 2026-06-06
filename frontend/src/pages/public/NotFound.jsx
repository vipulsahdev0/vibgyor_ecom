import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "40px 32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "#2563eb",
            lineHeight: 1,
            marginBottom: "12px",
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: "28px",
            marginBottom: "12px",
            color: "#0f172a",
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#475569",
            marginBottom: "28px",
            lineHeight: 1.6,
          }}
        >
          Sorry, the page you’re looking for doesn’t exist, was moved, or the
          link may be incorrect.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              background: "#2563eb",
              color: "#ffffff",
              padding: "12px 18px",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            Go to Home
          </Link>

          <Link
            to="/products"
            style={{
              textDecoration: "none",
              background: "#e2e8f0",
              color: "#0f172a",
              padding: "12px 18px",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}