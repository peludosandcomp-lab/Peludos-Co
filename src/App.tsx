import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import GiftingConcierge from "./components/GiftingConcierge";
import AppointmentForm from "./components/AppointmentForm";
import Footer from "./components/Footer";
import Logo from "./components/Logo";
import AdminAuthModal from "./components/AdminAuthModal";
import EmailContactModal from "./components/EmailContactModal";
import { Product, CartItem, Appointment, ProductCategory, OrderCustomerDetails, ProductAvailability } from "./types";
import { PRODUCTS_DATA } from "./data/products";
import { Sparkles, MessageCircle, Lock, ShieldCheck } from "lucide-react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem("kattyprive_is_admin") === "true";
    } catch {
      return false;
    }
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenEmail = () => setShowEmailModal(true);
    window.addEventListener("katty_open_email_modal", handleOpenEmail);
    return () => window.removeEventListener("katty_open_email_modal", handleOpenEmail);
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem("kattyprive_is_admin", "true");
    } catch (err) {
      console.warn("Could not save admin session:", err);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem("kattyprive_is_admin");
    } catch (err) {
      console.warn("Could not remove admin session:", err);
    }
  };

  const [soldOutProductIds, setSoldOutProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("peludos_sold_out_ids");
    return saved ? JSON.parse(saved) : [];
  });

  const [customProductsMap, setCustomProductsMap] = useState<Record<string, Product>>(() => {
    try {
      const saved = localStorage.getItem("peludos_custom_products");
      if (!saved) return {};
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const initialSoldOut = (() => {
      try {
        const saved = localStorage.getItem("peludos_sold_out_ids");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })();
    const savedCustom: Record<string, Product> = (() => {
      try {
        const saved = localStorage.getItem("peludos_custom_products");
        if (!saved) return {};
        return JSON.parse(saved);
      } catch {
        return {};
      }
    })();

    return PRODUCTS_DATA.map((p) => {
      const custom: Partial<Product> = savedCustom[p.id] || {};
      const image = custom.image || p.image;
      const availability: ProductAvailability = custom.availability || (initialSoldOut.includes(p.id) || p.isAvailable === false ? "sold_out" : "available");
      return {
        ...p,
        ...custom,
        image,
        availability,
        isAvailable: availability === "available"
      };
    });
  });

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | ProductCategory>("all");

  // Cart, Wishlist, and Appointments loaded from localStorage for durable user persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("peludos_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("peludos_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("peludos_appointments");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync custom edited products with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("peludos_custom_products", JSON.stringify(customProductsMap));
    } catch (err) {
      console.warn("Could not save custom products to localStorage:", err);
    }
  }, [customProductsMap]);

  // Sync state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("peludos_sold_out_ids", JSON.stringify(soldOutProductIds));
    } catch (err) {
      console.warn("Could not save sold out IDs to localStorage:", err);
    }
  }, [soldOutProductIds]);

  useEffect(() => {
    try {
      localStorage.setItem("peludos_cart", JSON.stringify(cart));
    } catch (err) {
      console.warn("Could not save cart to localStorage:", err);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("peludos_wishlist", JSON.stringify(wishlist));
    } catch (err) {
      console.warn("Could not save wishlist to localStorage:", err);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("peludos_appointments", JSON.stringify(appointments));
    } catch (err) {
      console.warn("Could not save appointments to localStorage:", err);
    }
  }, [appointments]);

  // Complete Purchase and Send WhatsApp to company
  const handleCompletePurchase = (customer: OrderCustomerDetails, items: CartItem[]) => {
    if (!items || items.length === 0) return;

    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    // Shipping cost scale: < 100€ -> 8€, 100€..150€ -> 5€, > 150€ -> Gratis (0€)
    const shippingCost = subtotal < 100 ? 8 : subtotal <= 150 ? 5 : 0;
    const grandTotal = subtotal + shippingCost;
    const purchasedIds = items.map((item) => item.product.id);

    // 1. Update sold-out state
    setSoldOutProductIds((prev) => {
      const updated = Array.from(new Set([...prev, ...purchasedIds]));
      return updated;
    });

    // 2. Format detailed WhatsApp message to Katty Privé (+34 632 89 26 57)
    const itemsListText = items
      .map(
        (item, idx) =>
          `  ${idx + 1}. *${item.product.name}*${item.selectedSize ? ` [Talla: ${item.selectedSize}]` : ""}\n     • Cantidad: ${item.quantity}\n     • Categoría: ${item.product.category}\n     • Precio unitario: ${item.product.price.toLocaleString("es-ES")} €\n     • Subtotal: ${(item.product.price * item.quantity).toLocaleString("es-ES")} €`
      )
      .join("\n\n");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const formattedTime = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const shippingText = shippingCost === 0 ? "Gratis (Cortesía)" : `${shippingCost.toLocaleString("es-ES")} €`;

    const paymentInfo = customer.paymentMethod === "square_card"
      ? `💳 *Pago:* Con Tarjeta (Square Integrado) ✅\n🔒 *Estado:* ${customer.paymentStatus === "authorized" ? "Autorizado" : "Completado"}${customer.cardBrand ? ` • ${customer.cardBrand} (•••• ${customer.cardLast4 || "****"})` : ""}${customer.paymentToken ? `\n🧾 *ID Transacción:* ${customer.paymentToken}` : ""}`
      : "💳 *Pago:* Transferencia / Asistencia directa por WhatsApp";

    const message = `🛍️ *NUEVO PEDIDO FORMALIZADO - PELUDOS & CO* 🛍️

👤 *Cliente:* ${customer.clientName}
📞 *Teléfono:* ${customer.clientPhone}
📧 *Email:* ${customer.clientEmail}
📍 *Dirección de Entrega:* ${customer.deliveryAddress}
${customer.notes ? `📝 *Notas:* ${customer.notes}\n` : ""}${paymentInfo}

🛍️ *DETALLE DE LA BOLSA DE COMPRA:*
${itemsListText}

📦 *Subtotal:* ${subtotal.toLocaleString("es-ES")} €
🚚 *Gastos de envío:* ${shippingText}
💳 *TOTAL DE LA COMPRA:* ${grandTotal.toLocaleString("es-ES")} €
📅 *Fecha:* ${formattedDate} a las ${formattedTime} hs

🐾 _Notificación enviada desde la web oficial de Peludos & Co (PREMIUM PET CARE)_`;

    const waUrl = `https://wa.me/34614704772?text=${encodeURIComponent(message)}`;

    try {
      window.open(waUrl, "_blank");
    } catch {
      // Fallback
    }

    // 3. Clear cart
    setCart([]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const effectiveAvailability: ProductAvailability = updatedProduct.availability || (updatedProduct.isAvailable === false ? "sold_out" : "available");
    const sanitizedProduct: Product = {
      ...updatedProduct,
      availability: effectiveAvailability,
      isAvailable: effectiveAvailability === "available"
    };

    // 1. Update in customProductsMap & persist
    setCustomProductsMap((prev) => {
      const next = {
        ...prev,
        [sanitizedProduct.id]: sanitizedProduct
      };
      try {
        localStorage.setItem("peludos_custom_products", JSON.stringify(next));
      } catch (err) {
        console.warn("Error saving custom products:", err);
      }
      return next;
    });

    // 2. Sync soldOutProductIds
    setSoldOutProductIds((prev) => {
      let next: string[];
      if (effectiveAvailability === "sold_out") {
        next = Array.from(new Set([...prev, sanitizedProduct.id]));
      } else {
        next = prev.filter((id) => id !== sanitizedProduct.id);
      }
      try {
        localStorage.setItem("kattyprive_sold_out_ids", JSON.stringify(next));
      } catch (err) {
        console.warn("Error saving sold out IDs:", err);
      }
      return next;
    });

    // 3. Update in current products state immediately
    setProducts((prev) =>
      prev.map((p) => (p.id === sanitizedProduct.id ? sanitizedProduct : p))
    );

    // 4. Update in cart if it exists there
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === sanitizedProduct.id
          ? { ...item, product: sanitizedProduct }
          : item
      )
    );

    // 5. Update in wishlist if it exists there
    setWishlist((prev) =>
      prev.map((p) => (p.id === sanitizedProduct.id ? sanitizedProduct : p))
    );
  };

  const handleResetProduct = (productId: string) => {
    const original = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!original) return;

    // 1. Remove from customProductsMap
    setCustomProductsMap((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      try {
        localStorage.setItem("kattyprive_custom_products", JSON.stringify(copy));
      } catch (err) {
        console.warn("Error resetting custom product:", err);
      }
      return copy;
    });

    // 2. Remove from soldOutProductIds
    setSoldOutProductIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      try {
        localStorage.setItem("kattyprive_sold_out_ids", JSON.stringify(next));
      } catch (err) {
        console.warn("Error resetting sold out IDs:", err);
      }
      return next;
    });

    const restoredProduct: Product = { ...original, isAvailable: true, availability: "available" };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? restoredProduct : p))
    );

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, product: restoredProduct }
          : item
      )
    );

    setWishlist((prev) =>
      prev.map((p) => (p.id === productId ? restoredProduct : p))
    );
  };

  // Actions
  const addToCart = (product: Product, selectedSize?: string) => {
    // If sold out, do not add
    if (soldOutProductIds.includes(product.id) || product.isAvailable === false) {
      return;
    }
    const appliedSize = selectedSize || (product as any).selectedSize || (product.category === "clothing" && product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === appliedSize
      );
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: appliedSize }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const updateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === id ? { ...item, quantity: qty } : item
      )
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== id));
  };

  const addToCartFromWishlist = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const addAppointment = (newApp: Appointment) => {
    setAppointments((prev) => [newApp, ...prev]);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: "cancelled" } : app
      )
    );
  };

  // Navigation / Scroll Helpers
  const scrollToCatalog = (cat?: "all" | ProductCategory) => {
    if (cat) {
      setSelectedCategory(cat);
    }
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBoutique = () => {
    document.getElementById("boutiques")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToGifting = () => {
    document.getElementById("gifting-concierge")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-8">
        <div className="animate-pulse flex flex-col items-center">
          <Logo variant="full" size="xl" theme="original" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#c5a880] tracking-widest uppercase">
          <Sparkles size={14} className="animate-spin text-[#c5a880]" />
          <span>Iniciando Peludos &amp; Co...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#c5a880]/30 selection:text-[#0B192C] relative">
      {/* Barra Privada de Dirección (Solo cuando la administración ha iniciado sesión) */}
      {isAdmin && (
        <div className="bg-[#0B192C] text-[#FAF9F6] px-4 py-2 text-xs font-mono border-b border-[#c5a880]/40 flex items-center justify-between z-50 sticky top-0 shadow-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#c5a880] font-semibold uppercase tracking-wider text-[10px]">
              Modo Privado Peludos &amp; Co Activo
            </span>
            <span className="text-white/70 hidden md:inline text-[10px]">
              • Tienes activos los botones para publicar en redes y editar precios en cada producto (ocultos para clientes)
            </span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="px-2.5 py-1 bg-white/10 hover:bg-rose-900/60 hover:text-white text-[#FAF9F6] border border-white/20 rounded-xs text-[10px] tracking-wider transition-colors cursor-pointer"
            title="Ocultar herramientas privadas"
          >
            Cerrar Modo Privado
          </button>
        </div>
      )}

      {/* Navigation bar */}
      <Navbar
        cart={cart}
        wishlist={wishlist}
        appointments={appointments}
        soldOutProductIds={soldOutProductIds}
        onCompletePurchase={handleCompletePurchase}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        removeFromWishlist={removeFromWishlist}
        addToCartFromWishlist={addToCartFromWishlist}
        cancelAppointment={cancelAppointment}
        onOpenGifting={scrollToGifting}
        onScrollToCatalog={() => scrollToCatalog("all")}
        onScrollToBoutique={scrollToBoutique}
        onOpenEmailModal={() => setShowEmailModal(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Slider */}
        <Hero
          onScrollToCatalog={() => scrollToCatalog("all")}
          onOpenGifting={scrollToGifting}
        />

        {/* Filterable Catalog & Dedicated Category Sections */}
        <Catalog
          products={products}
          wishlist={wishlist}
          soldOutProductIds={soldOutProductIds}
          addToCart={addToCart}
          toggleWishlist={toggleWishlist}
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onUpdateProduct={handleUpdateProduct}
          onResetProduct={handleResetProduct}
          isAdmin={isAdmin}
        />

        {/* AI-powered Gifting Concierge */}
        <GiftingConcierge onScrollToBoutique={scrollToBoutique} />

        {/* Private Boutique Booking Form */}
        <AppointmentForm onAddAppointment={addAppointment} />
      </main>

      {/* Floating WhatsApp and Direct Contact Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <a
          href="https://wa.me/34614704772?text=Hola,%20deseo%20asesoramiento%20personalizado%20en%20Peludos%20%26%20Co"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white pl-4 pr-3 py-2.5 rounded-full shadow-2xl border border-[#c5a880]/50 transition-all duration-300 hover:scale-105"
          title="Atención inmediata WhatsApp Peludos & Co"
        >
          <span className="text-[11px] font-mono tracking-wider hidden sm:inline text-[#c5a880] group-hover:text-white">
            WhatsApp +34 614 70 47 72
          </span>
          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow">
            <MessageCircle size={17} />
          </div>
        </a>
      </div>

      {/* Footer */}
      <Footer
        isAdmin={isAdmin}
        onOpenAdmin={() => setShowAdminAuthModal(true)}
        onLogoutAdmin={handleAdminLogout}
        onOpenEmailModal={() => setShowEmailModal(true)}
      />

      {/* Admin Login Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={handleAdminLogin}
      />

      {/* Email Contact Direct Modal */}
      <EmailContactModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  );
}
