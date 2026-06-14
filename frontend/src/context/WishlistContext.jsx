import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  getWishlist, addToWishlist as addApi, removeFromWishlist as removeApi,
} from "../api/wishlistApi";

export const WishlistContext = createContext(null);

// ── helpers ───────────────────────────────────────────────────────────────────
const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

function isWishlistSafeError(status, message) {
  return status === 401
    || status === 404
    || [400, 403, 204].includes(status)
    || (message ?? "").toLowerCase().includes("wishlist not found");
}

// ── reducer ───────────────────────────────────────────────────────────────────
const INITIAL = { items: [], loading: false, fetching: false };

function reducer(state, action) {
  switch (action.type) {
    case "SET_ITEMS":    return { ...state, items: action.payload };
    case "SET_LOADING":  return { ...state, loading: action.payload };
    case "SET_FETCHING": return { ...state, fetching: action.payload };
    // Optimistic toggle — immediate UI feedback, rolled back on error
    case "OPTIMISTIC_ADD":
      return state.items.some(i => i.productId === action.payload.productId)
        ? state
        : { ...state, items: [...state.items, action.payload] };
    case "OPTIMISTIC_REMOVE":
      return { ...state, items: state.items.filter(i => i.productId !== action.payload) };
    default:
      return state;
  }
}

// ── provider ──────────────────────────────────────────────────────────────────
export default function WishlistProvider({ children }) {
  const { user, loading: authLoading, logout } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const setItems    = (items)    => dispatch({ type: "SET_ITEMS",    payload: items    });
  const setLoading  = (v)        => dispatch({ type: "SET_LOADING",  payload: v        });
  const setFetching = (v)        => dispatch({ type: "SET_FETCHING", payload: v        });

  // ── fetch ───────────────────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!user?.userId) { setItems([]); return; }
    try {
      setFetching(true);
      const data = await getWishlist(user.userId);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      const status  = err?.response?.status;
      const message = getErrorMessage(err);
      if (status === 401) { setItems([]); logout?.(); return; }
      if (isWishlistSafeError(status, message)) { setItems([]); return; }
      console.warn("Wishlist fetch failed:", message);
      setItems([]);
      if (status === 500) toast.error("Failed to load wishlist");
    } finally { setFetching(false); }
  }, [user?.userId, logout]);

  useEffect(() => {
    if (authLoading) return;
    fetchWishlist();
  }, [authLoading, fetchWishlist]);

  // ── actions ─────────────────────────────────────────────────────────────────
  const addToWishlist = async (productId) => {
    if (!user?.userId) { toast.error("Please login to use wishlist"); return; }

    // Optimistic update
    dispatch({ type: "OPTIMISTIC_ADD", payload: { productId, addedAt: new Date().toISOString() } });

    try {
      setLoading(true);
      const data = await addApi(user.userId, productId );
      // Reconcile with server response
      setItems(Array.isArray(data?.items) ? data.items : state.items);
      toast.success("Added to wishlist");
    } catch (err) {
      // Roll back optimistic update
      dispatch({ type: "OPTIMISTIC_REMOVE", payload: productId });
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const removeFromWishlist = async (productId) => {
    if (!user?.userId) { toast.error("Please login to use wishlist"); return; }

    // Optimistic update
    const snapshot = state.items;
    dispatch({ type: "OPTIMISTIC_REMOVE", payload: productId });

    try {
      setLoading(true);
      const data = await removeApi(user.userId, productId);
      setItems(Array.isArray(data?.items) ? data.items : state.items.filter(i => i.productId !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      // Roll back optimistic update
      setItems(snapshot);
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const toggleWishlist = async (product) => {
    const productId = product?.id ?? product;
    isWishlisted(productId)
      ? await removeFromWishlist(productId)
      : await addToWishlist(productId);
  };

  // Stable selector — doesn't cause unnecessary re-renders
  const isWishlisted = useCallback(
    (productId) => state.items.some(i => i.productId === productId),
    [state.items]
  );

  const value = useMemo(() => ({
    wishlist:           state.items,
    loading:            state.loading,
    fetching:           state.fetching,
    totalWishlistItems: state.items.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    fetchWishlist,
  // addToWishlist/removeFromWishlist/toggleWishlist close over state — include them
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, isWishlisted, fetchWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}