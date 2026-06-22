import { createContext, useCallback, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  getCart, addToCart as addApi, updateCartItem as updateApi,
  removeCartItem as removeApi, clearCart as clearApi,
} from "../api/cartApi";

export const CartContext = createContext(null);

// ── constants & helpers ───────────────────────────────────────────────────────
const GUEST_CART_KEY = "guest_cart";

const EMPTY_CART = Object.freeze({
  items: [], totalItems: 0, subtotal: 0, discountTotal: 0, grandTotal: 0,
});

const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

function isCartErrorSafe(status) {
  return [400, 403].includes(status);
}

function calcCartTotals(items) {
  const valid = Array.isArray(items) ? items : [];
  const totalItems = valid.reduce((s, i) => s + Math.max(0, Number(i.quantity || 0)), 0);
  const subtotal = valid.reduce((s, i) => {
    const p = Number(i.unitPrice || 0), q = Number(i.quantity || 0);
    return s + (p > 0 && q > 0 ? p * q : 0);
  }, 0);
  const grandTotal = valid.reduce((s, i) => s + Math.max(0, Number(i.lineTotal || 0)), 0);
  return {
    totalItems,
    subtotal: Math.max(0, subtotal),
    discountTotal: Math.max(0, subtotal - grandTotal),
    grandTotal: Math.max(0, grandTotal),
  };
}

function normalizeCartResponse(data) {
  return {
    ...EMPTY_CART,
    ...data,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

function buildGuestItem(product, quantity) {
  const unitPrice = Number(product.finalPrice ?? product.discountedPrice ?? product.price ?? 0);
  return {
    cartItemId: Date.now(),
    productId: product.id,
    productName: product.name,
    productImageUrl: product.primaryImageUrl
      || product.images?.find(i => i?.isPrimary)?.imageUrl
      || product.images?.[0]?.imageUrl
      || "",
    quantity,
    unitPrice,
    lineTotal: unitPrice * quantity,
    addedAt: new Date().toISOString(),
  };
}

// ── reducer ───────────────────────────────────────────────────────────────────
const INITIAL = { cart: EMPTY_CART, loading: false };

function reducer(state, action) {
  switch (action.type) {
    case "SET_CART": return { ...state, cart: action.payload };
    case "SET_LOADING": return { ...state, loading: action.payload };
    default: return state;
  }
}

// ── provider ──────────────────────────────────────────────────────────────────
export default function CartProvider({ children }) {
  const { user, loading: authLoading, logout } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const setCart = (cart) => dispatch({ type: "SET_CART", payload: cart });
  const setLoading = (loading) => dispatch({ type: "SET_LOADING", payload: loading });

  // ── guest helpers ───────────────────────────────────────────────────────────
  const loadGuestCart = useCallback(() => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) { setCart(EMPTY_CART); return; }
      const parsed = JSON.parse(raw);
      setCart({ ...EMPTY_CART, ...parsed, items: Array.isArray(parsed?.items) ? parsed.items : [] });
    } catch {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart(EMPTY_CART);
    }
  }, []);

  const saveGuestCart = useCallback((items) => {
    const updated = { items, ...calcCartTotals(items) };
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
    setCart(updated);
  }, []);

  // ── backend helpers ─────────────────────────────────────────────────────────
  const fetchBackendCart = useCallback(async () => {
    if (!user?.userId) { setCart(EMPTY_CART); return; }
    try {
      setLoading(true);
      const data = await getCart(user.userId);
      setCart(normalizeCartResponse(data));
    } catch (err) {
      const status = err?.response?.status;
      const message = getErrorMessage(err);
      if (status === 401) { setCart(EMPTY_CART); logout?.(); return; }
      if (isCartErrorSafe(status)) { setCart(EMPTY_CART); return; }
      console.warn("Cart fetch failed:", message);
      setCart(EMPTY_CART);
      if (status === 500) toast.error("Your cart could not be loaded right now.");
    } finally { setLoading(false); }
  }, [user?.userId, logout]);

  useEffect(() => {
    if (authLoading) return;
    user?.userId ? fetchBackendCart() : loadGuestCart();
  }, [authLoading, user?.userId, fetchBackendCart, loadGuestCart]);

  // ── public actions ──────────────────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    if (quantity < 1) return;

    if (user?.userId) {
      try {
        setLoading(true);
        const data = await addApi(
          user.userId,
          product.id,
          quantity
        );
        setCart(normalizeCartResponse(data));
        toast.success("Added to cart");
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally { setLoading(false); }
      return;
    }

    // Guest path
    const { items } = state.cart;
    const existing = items.find(i => i.productId === product.id);
    const updated = existing
      ? items.map(i => i.productId === product.id
        ? { ...i, quantity: i.quantity + quantity, lineTotal: Number(i.unitPrice) * (i.quantity + quantity) }
        : i)
      : [...items, buildGuestItem(product, quantity)];
    saveGuestCart(updated);
    toast.success("Added to cart");
  };

  const updateCart = async (productId, quantity) => {
    if (quantity < 1) return;

    if (user?.userId) {
      try {
        setLoading(true);
        const data = await updateApi(
          user.userId,
          productId,
          quantity
        );
        setCart(normalizeCartResponse(data));
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally { setLoading(false); }
      return;
    }

    saveGuestCart(state.cart.items.map(i =>
      i.productId === productId
        ? { ...i, quantity, lineTotal: Number(i.unitPrice || 0) * quantity }
        : i
    ));
  };

  const removeItem = async (productId) => {
    if (user?.userId) {
      try {
        setLoading(true);
        const data = await removeApi(user.userId, productId);
        setCart(normalizeCartResponse(data));
        toast.success("Item removed");
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally { setLoading(false); }
      return;
    }

    saveGuestCart(state.cart.items.filter(i => i.productId !== productId));
    toast.success("Item removed");
  };

  const clearAll = async () => {
    if (user?.userId) {
      try {
        setLoading(true);
        await clearApi(user.userId);
        setCart(EMPTY_CART);
        toast.success("Cart cleared");
      } catch (err) {
        console.error(err);
        toast.error(getErrorMessage(err));
      } finally { setLoading(false); }
      return;
    }

    localStorage.removeItem(GUEST_CART_KEY);
    setCart(EMPTY_CART);
    toast.success("Cart cleared");
  };

  return (
    <CartContext.Provider value={{
      cart: state.cart,
      loading: state.loading,
      addToCart,
      updateCart,
      removeItem,
      clearAll,
      fetchBackendCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}