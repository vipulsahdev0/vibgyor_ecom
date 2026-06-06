import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  getWishlist,
  addToWishlist as addApi,
  removeFromWishlist as removeApi,
} from "../api/wishlistApi";

export const WishlistContext = createContext(null);

const getErrorMessage = (error) =>
  error?.response?.data?.message?.toLowerCase?.() || "";

export default function WishlistProvider({ children }) {
  const { user, loading: authLoading, logout } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user?.userId) {
      setWishlist([]);
      return;
    }

    try {
      setFetching(true);
      const data = await getWishlist(user.userId);
      setWishlist(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      const status = error?.response?.status;
      const message = getErrorMessage(error);

      if (message.includes("wishlist not found") || status === 404) {
        setWishlist([]);
        return;
      }

      if (status === 401) {
        setWishlist([]);
        logout?.();
        return;
      }

      // 400/403 errors - treat as empty wishlist
      if (status === 400 || status === 403) {
        console.warn("Wishlist access issue:", message);
        setWishlist([]);
        return;
      }

      // Don't show error for empty wishlist scenarios
      if (status === 204 || status === 204) {
        setWishlist([]);
        return;
      }

      console.warn("Failed to fetch wishlist (defaulting to empty):", message);
      setWishlist([]);
      // Only show error for server errors
      if (status === 500) {
        toast.error("Failed to load wishlist");
      }
    } finally {
      setFetching(false);
    }
  }, [user?.userId, logout]);

  useEffect(() => {
    if (authLoading) return;
    fetchWishlist();
  }, [authLoading, fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!user?.userId) {
      toast.error("Please login to use wishlist");
      return;
    }

    try {
      setLoading(true);

      const data = await addApi(user.userId, {
        productId,
      });

      setWishlist(Array.isArray(data?.items) ? data.items : []);
      toast.success("Added to wishlist");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add wishlist item"
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user?.userId) {
      toast.error("Please login to use wishlist");
      return;
    }

    try {
      setLoading(true);

      const data = await removeApi(user.userId, productId);

      setWishlist(Array.isArray(data?.items) ? data.items : []);
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to remove item"
      );
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = useCallback(
    (productId) => wishlist.some((item) => item.productId === productId),
    [wishlist]
  );

  const value = useMemo(
    () => ({
      wishlist,
      loading,
      fetching,
      addToWishlist,
      removeFromWishlist,
      isWishlisted,
      fetchWishlist,
      totalWishlistItems: wishlist.length,
    }),
    [wishlist, loading, fetching, isWishlisted, fetchWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}