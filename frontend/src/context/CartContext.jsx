import { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  getCart,
  addToCart as addApi,
  updateCartItem as updateApi,
  removeCartItem as removeApi,
  clearCart as clearApi,
} from "../api/cartApi";

export const CartContext = createContext(null);

const EMPTY_CART = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  discountTotal: 0,
  grandTotal: 0,
};

const calcCartTotals = (items) => {
  const validItems = Array.isArray(items) ? items : [];
  
  const totalItems = validItems.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    return sum + (qty > 0 ? qty : 0);
  }, 0);
  
  const subtotal = validItems.reduce((sum, item) => {
    const price = Number(item.unitPrice || 0);
    const qty = Number(item.quantity || 0);
    return sum + (price > 0 && qty > 0 ? price * qty : 0);
  }, 0);
  
  const grandTotal = validItems.reduce((sum, item) => {
    const lineTotal = Number(item.lineTotal || 0);
    return sum + (lineTotal > 0 ? lineTotal : 0);
  }, 0);

  return {
    totalItems,
    subtotal: Math.max(0, subtotal),
    discountTotal: Math.max(0, subtotal - grandTotal),
    grandTotal: Math.max(0, grandTotal),
  };
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export default function CartProvider({ children }) {
  const { user, loading: authLoading, logout } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const loadGuestCart = useCallback(() => {
    try {
      const saved = localStorage.getItem("guest_cart");

      if (!saved) {
        setCart(EMPTY_CART);
        return;
      }

      const parsed = JSON.parse(saved);
      setCart({
        ...EMPTY_CART,
        ...parsed,
        items: Array.isArray(parsed?.items) ? parsed.items : [],
      });
    } catch (error) {
      console.error("Failed to load guest cart:", error);
      localStorage.removeItem("guest_cart");
      setCart(EMPTY_CART);
    }
  }, []);

  const saveGuestCart = useCallback((items) => {
    const totals = calcCartTotals(items);
    const updatedCart = { items, ...totals };

    localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  }, []);

  const fetchBackendCart = useCallback(async () => {
    if (!user?.userId) {
      setCart(EMPTY_CART);
      return;
    }

    try {
      setLoading(true);
      const data = await getCart(user.userId);

      setCart({
        ...EMPTY_CART,
        ...data,
        items: Array.isArray(data?.items) ? data.items : [],
      });
    } catch (error) {
      const status = error?.response?.status;
      const message = getErrorMessage(error);

      if (status === 401) {
        setCart(EMPTY_CART);
        logout?.();
        return;
      }

      // Treat 404 and other "not found" type errors as empty cart
      if (status === 404 || message.toLowerCase().includes("not found")) {
        setCart(EMPTY_CART);
        return;
      }

      // Empty cart for 400/403 errors (permission/validation issues)
      if (status === 400 || status === 403) {
        console.warn("Cart access issue:", message);
        setCart(EMPTY_CART);
        return;
      }

      if (status === 500) {
        console.error("Cart fetch failed with server error:", error);
        setCart(EMPTY_CART);
        toast.error("Your cart could not be loaded right now.");
        return;
      }

      // For any other errors, default to empty cart without showing error
      console.warn("Cart fetch returned error (defaulting to empty):", error);
      setCart(EMPTY_CART);
      // Only show error toast for unexpected errors
      if (status !== 204) {
        // 204 No Content is not an error
        console.error("Unexpected cart fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.userId, logout]);

  useEffect(() => {
    if (authLoading) return;

    if (user?.userId) {
      fetchBackendCart();
    } else {
      loadGuestCart();
    }
  }, [authLoading, user?.userId, fetchBackendCart, loadGuestCart]);

  const addToCart = async (product, quantity = 1) => {
    if (quantity < 1) return;

    if (user?.userId) {
      try {
        setLoading(true);

        const data = await addApi(user.userId, {
          productId: product.id,
          quantity,
        });

        setCart({
          ...EMPTY_CART,
          ...data,
          items: Array.isArray(data?.items) ? data.items : [],
        });

        toast.success("Added to cart");
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error) || "Failed to add item");
      } finally {
        setLoading(false);
      }

      return;
    }

    const productId = product.id;
    const unitPrice = Number(product.finalPrice ?? product.discountedPrice ?? product.price ?? 0);
    const productImageUrl =
      product.primaryImageUrl ||
      product.images?.find((img) => img?.isPrimary)?.imageUrl ||
      product.images?.[0]?.imageUrl ||
      "";

    const existing = cart.items.find((item) => item.productId === productId);

    const updatedItems = existing
      ? cart.items.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                lineTotal: unitPrice * (item.quantity + quantity),
              }
            : item
        )
      : [
          ...cart.items,
          {
            cartItemId: Date.now(),
            productId,
            productName: product.name,
            productImageUrl,
            quantity,
            unitPrice,
            lineTotal: unitPrice * quantity,
            addedAt: new Date().toISOString(),
          },
        ];

    saveGuestCart(updatedItems);
    toast.success("Added to cart");
  };

  const updateCart = async (productId, quantity) => {
    if (quantity < 1) return;

    if (user?.userId) {
      try {
        setLoading(true);

        const data = await updateApi(user.userId, {
          productId,
          quantity,
        });

        setCart({
          ...EMPTY_CART,
          ...data,
          items: Array.isArray(data?.items) ? data.items : [],
        });
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error) || "Failed to update cart");
      } finally {
        setLoading(false);
      }

      return;
    }

    const updatedItems = cart.items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity,
            lineTotal: Number(item.unitPrice || 0) * quantity,
          }
        : item
    );

    saveGuestCart(updatedItems);
  };

  const removeItem = async (productId) => {
    if (user?.userId) {
      try {
        setLoading(true);
        const data = await removeApi(user.userId, productId);

        setCart({
          ...EMPTY_CART,
          ...data,
          items: Array.isArray(data?.items) ? data.items : [],
        });

        toast.success("Item removed");
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error) || "Failed to remove item");
      } finally {
        setLoading(false);
      }

      return;
    }

    const updatedItems = cart.items.filter((item) => item.productId !== productId);
    saveGuestCart(updatedItems);
    toast.success("Item removed");
  };

  const clearAll = async () => {
    if (user?.userId) {
      try {
        setLoading(true);
        await clearApi(user.userId);
        setCart(EMPTY_CART);
        toast.success("Cart cleared");
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error) || "Failed to clear cart");
      } finally {
        setLoading(false);
      }

      return;
    }

    localStorage.removeItem("guest_cart");
    setCart(EMPTY_CART);
    toast.success("Cart cleared");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCart,
        removeItem,
        clearAll,
        fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}