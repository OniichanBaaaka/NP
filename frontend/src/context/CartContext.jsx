import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('xiv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  useEffect(() => {
    localStorage.setItem('xiv_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, size = 'L') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size
      );

      const price = product.salePrice || product.price;
      let productImages = [];
      try {
        productImages = Array.isArray(product.images)
          ? product.images
          : JSON.parse(product.images || '[]');
      } catch (e) {
        productImages = [product.images || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'];
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, product.stock || 99);
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            price: price,
            originalPrice: product.price,
            quantity: Math.min(quantity, product.stock || 99),
            size: size,
            image: productImages[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
            stock: product.stock,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size) {
          const maxStock = item.stock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedVoucher(null);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Voucher Calculations
  const applyVoucher = (voucher) => {
    setAppliedVoucher(voucher);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  let voucherDiscount = 0;
  if (appliedVoucher && cartTotal >= appliedVoucher.minOrder) {
    if (appliedVoucher.type === 'percent') {
      voucherDiscount = Math.min(
        cartTotal * appliedVoucher.value,
        appliedVoucher.maxDiscount || Infinity
      );
    } else if (appliedVoucher.type === 'fixed' || appliedVoucher.type === 'shipping') {
      voucherDiscount = appliedVoucher.value;
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        // Voucher
        appliedVoucher,
        voucherDiscount,
        applyVoucher,
        removeVoucher,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
