import React, { useState, useMemo } from "react";
import { Product, ProductCategory, ProductAvailability } from "../types";
import { CATEGORIES_CONFIG, CategoryInfo } from "../data/products";
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  X, 
  Ruler, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  Edit3,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Share2,
  Camera,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProductEditModal from "./ProductEditModal";
import SocialShareModal from "./SocialShareModal";

const getNoveltyRankBadge = (id: string): string | null => {
  switch (id) {
    case "pet-01": return "Novedad #1 • Diagnóstico Renal";
    case "pet-02": return "Novedad #2 • Smartwatch GPS Biométrico";
    case "pet-03": return "Novedad #3 • Reconocimiento Facial IA";
    case "pet-04": return "Novedad #4 • Traductor Bioacústico IA";
    case "pet-05": return "Novedad #5 • Monitorización Hídrica";
    case "pet-06": return "Novedad #6 • Cámara 2K & Premios IA";
    case "pet-07": return "Novedad #7 • Juego Cognitivo Adaptativo";
    case "pet-08": return "Novedad #8 • Exoesqueleto EMG Robótico";
    case "pet-09": return "Novedad #9 • Proteína de Insecto Sostenible";
    case "pet-10": return "Novedad #10 • Ecosistema Conectado IFA 2026";
    case "pet-11": return "Novedad #11 • Puerta Microchip Inteligente";
    case "pet-12": return "Novedad #12 • Lanzador IA iFetch";
    case "pet-13": return "Novedad #13 • Cheerble Wicked Ball (UE)";
    case "pet-14": return "Novedad #14 • Arnés Biotracker Clínico";
    case "pet-15": return "Novedad #15 • Kit ADN Salud & Razas";
    case "pet-16": return "Novedad #16 • Cepillo Autoaspirante Grooming";
    case "pet-17": return "Novedad #17 • Purificador Dreame FP10";
    case "pet-18": return "Novedad #18 • Cama Térmica Climatizada";
    case "pet-19": return "Radar I+D • PawRobo (Waitlist USA)";
    case "pet-20": return "Radar CES 2026 • Ecovacs Pet IA";
    default: return null;
  }
};

interface CatalogProps {
  products: Product[];
  wishlist: Product[];
  soldOutProductIds?: string[];
  addToCart: (product: Product) => void;
  toggleWishlist: (product: Product) => void;
  activeCategory?: "all" | ProductCategory;
  onSelectCategory?: (category: "all" | ProductCategory) => void;
  onUpdateProduct?: (product: Product) => void;
  onResetProduct?: (productId: string) => void;
  isAdmin?: boolean;
}

const CATEGORY_TABS: { id: "all" | ProductCategory; label: string; count?: number }[] = [
  { id: "all", label: "Top 10 Novedades" },
  { id: "smart-tech", label: "Smart Tech & IA" },
  { id: "health", label: "Salud & Diagnóstico" },
  { id: "hygiene", label: "Higiene & Areneros" },
  { id: "nutrition", label: "Nutrición Sostenible" },
  { id: "wellbeing", label: "Rehabilitación" },
  { id: "toys", label: "Juegos Cognitivos" }
];

export default function Catalog({ 
  products, 
  wishlist, 
  soldOutProductIds = [],
  addToCart, 
  toggleWishlist,
  activeCategory = "all",
  onSelectCategory,
  onUpdateProduct,
  onResetProduct,
  isAdmin = false
}: CatalogProps) {
  const [internalCategory, setInternalCategory] = useState<"all" | ProductCategory>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [selectedClothingSize, setSelectedClothingSize] = useState<string>("M");

  // Keep quickViewProduct and editingProduct in sync with the latest reactive products array
  const currentQuickViewProduct = useMemo(() => {
    if (!quickViewProduct) return null;
    return products.find((p) => p.id === quickViewProduct.id) || quickViewProduct;
  }, [quickViewProduct, products]);

  const currentEditingProduct = useMemo(() => {
    if (!editingProduct) return null;
    return products.find((p) => p.id === editingProduct.id) || editingProduct;
  }, [editingProduct, products]);

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    if (product.category === "clothing") {
      const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : "M";
      setSelectedClothingSize(defaultSize);
    }
  };
  
  // Controlled or uncontrolled category state
  const selectedCategory = onSelectCategory ? activeCategory : internalCategory;
  const setSelectedCategory = (cat: "all" | ProductCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const getProductStatus = (product: Product): ProductAvailability => {
    if (product.availability) {
      return product.availability;
    }
    if (soldOutProductIds.includes(product.id) || product.isAvailable === false) {
      return "sold_out";
    }
    return "available";
  };

  // Sizing assistant states inside modal
  const [sizeAssistantOpen, setSizeAssistantOpen] = useState(false);
  const [wristMeasure, setWristMeasure] = useState(16); // cm
  const [ringDiameter, setRingDiameter] = useState(17); // mm

  // Category Configuration
  const currentCategoryInfo = useMemo<CategoryInfo | null>(() => {
    if (selectedCategory === "all") return null;
    return CATEGORIES_CONFIG.find(c => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let list = selectedCategory === "all" 
      ? [...products] 
      : products.filter(p => p.category === selectedCategory);

    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "featured":
      default:
        return list;
    }
  }, [products, selectedCategory, sortBy]);

  const isInWishlist = (id: string) => wishlist.some(p => p.id === id);

  // Recommended Love Bracelet Size calculator
  const getRecommendedLoveSize = (wrist: number) => ({
    tight: wrist + 1,
    regular: wrist + 1.5,
    loose: wrist + 2
  });

  // Ring size conversion
  const getTrinityRingSize = (diameter: number) => {
    return Math.round(diameter * 3.14159);
  };

  const getCategorySpanishLabel = (cat: ProductCategory) => {
    switch (cat) {
      case "smart-tech": return "Smart Tech & IA";
      case "health": return "Salud & Diagnóstico";
      case "hygiene": return "Higiene & Areneros";
      case "nutrition": return "Nutrición Sostenible";
      case "wellbeing": return "Rehabilitación & Movilidad";
      case "toys": return "Juegos Cognitivos";
      case "perfumes": return "Aromaterapia";
      case "glasses": return "Accesorios";
      case "cosmetics": return "Dermo-Cuidado";
      case "clothing": return "Textil Confort";
      case "jewelry": return "Placas & Collares";
      case "bags": return "Transportines";
      default: return cat;
    }
  };

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-28">
      
      {/* Title & Section Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#0B192C]">
          <Sparkles size={13} className="text-[#c5a880]" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase font-medium">
            Peludos &amp; Co • Innovación &amp; Pet Tech 2026
          </span>
        </div>
        <h3 className="font-serif text-3xl md:text-5xl font-light tracking-wider text-[#0B192C]">
          La Tienda de lo Último en Tecnología y Productos Innovadores para tu Perro o Gato
        </h3>
        <p className="font-sans text-xs md:text-sm font-light text-[#121212]/70 max-w-3xl mx-auto tracking-wide">
          Puertas inteligentes con microchip, lanzadores interactivos IA, arneses de monitorización veterinaria, tests genéticos de ADN, areneros con chequeo renal y camas climatizadas seleccionados para elevar el bienestar animal.
        </p>

        {/* Zona Recomendada / Corredor de Cobertura Prioritaria */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-[#0B192C]/5 border border-[#c5a880]/40 rounded-sm text-xs font-mono text-[#0B192C]">
          <span className="font-semibold text-[#c5a880] uppercase tracking-wider">📍 Zona Prioritaria:</span>
          <span>Corredor Valdebebas · Sanchinarro · Las Tablas · Montecarmelo</span>
          <span className="text-stone-400 hidden sm:inline">|</span>
          <span className="text-stone-600">Demostraciones y asesoría tech a domicilio</span>
        </div>

        <div className="h-0.5 w-16 bg-[#c5a880]/60 mx-auto mt-4" />
      </div>

      {/* Categories Filter Tabs (Organized in 2 rows without horizontal scrolling) */}
      <div className="border-b border-[#c5a880]/20 pb-4 mb-10">
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-2.5 max-w-5xl mx-auto px-2">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.id === "all" 
              ? products.length 
              : products.filter(p => p.category === tab.id).length;
            const isActive = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                }}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm tracking-wider font-light transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                  isActive 
                    ? "bg-[#0B192C] text-[#FAF9F6] border-[#0B192C] shadow-sm" 
                    : "bg-white text-[#0B192C]/80 border-[#c5a880]/40 hover:border-[#0B192C] hover:text-[#0B192C] hover:bg-[#c5a880]/10"
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive 
                    ? "bg-[#c5a880] text-[#0B192C] font-semibold" 
                    : "bg-stone-100 text-stone-600 group-hover:bg-[#c5a880]/20"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DEDICATED CATEGORY HEADER BANNER (When a specific category is selected) */}
      <AnimatePresence mode="wait">
        {currentCategoryInfo && (
          <motion.div
            key={currentCategoryInfo.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mb-12 relative overflow-hidden rounded-sm border border-[#c5a880]/30 shadow-md bg-[#120002] text-[#FAF9F6]"
          >
            {/* Background luxury photo overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src={currentCategoryInfo.bannerImage} 
                alt={currentCategoryInfo.label} 
                className="w-full h-full object-cover opacity-25 filter blur-[0.5px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#120002] via-[#120002]/85 to-transparent" />
            </div>

            {/* Content info */}
            <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[#c5a880] uppercase">
                  <button 
                    onClick={() => setSelectedCategory("all")} 
                    className="hover:underline hover:text-white transition-colors cursor-pointer"
                  >
                    Colecciones
                  </button>
                  <ChevronRight size={10} className="text-[#c5a880]/60" />
                  <span className="text-[#FAF9F6]">{currentCategoryInfo.label}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#c5a880]">
                    {currentCategoryInfo.subtitle}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide text-white">
                    Colección {currentCategoryInfo.label}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm font-light text-[#FAF9F6]/80 leading-relaxed font-sans pt-1">
                  {currentCategoryInfo.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] font-mono text-[#c5a880]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} />
                    Innovación Certificada 2026
                  </span>
                  <span className="text-[#c5a880]/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={12} />
                    Garantía y Calidad Peludos &amp; Co
                  </span>
                  <span className="text-[#c5a880]/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <PackageCheck size={12} />
                    Asesoría &amp; Envío Personalizado
                  </span>
                </div>
              </div>

              {/* Action: Return to all or switch */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="px-5 py-3 border border-[#c5a880]/40 hover:border-[#FAF9F6] bg-[#0B192C]/80 hover:bg-[#FAF9F6] text-[#FAF9F6] hover:text-[#0B192C] text-[11px] tracking-[0.2em] uppercase font-light transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
                >
                  <ArrowLeft size={13} />
                  Ver Todas las Novedades
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOWCASE SECTION CATEGORY CARDS (When "Ver Todo" is active) */}
      {selectedCategory === "all" && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#c5a880] uppercase block font-semibold">
                Áreas de Innovación
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-light text-[#0B192C]">
                Explorar Categorías Tecnológicas &amp; Bienestar
              </h4>
            </div>
            <p className="text-xs text-[#121212]/50 font-light hidden sm:block">
              Haga clic para filtrar por tecnología o área de cuidado
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES_CONFIG.map((cat) => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group relative overflow-hidden aspect-[4/5] rounded-sm border border-[#c5a880]/20 hover:border-[#0B192C] shadow-sm hover:shadow-lg transition-all duration-500 text-left p-3 flex flex-col justify-between cursor-pointer"
                >
                  <img
                    src={cat.bannerImage}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/50 to-transparent group-hover:via-[#0B192C]/70 transition-all duration-300" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="text-[9px] font-mono text-[#c5a880] bg-[#0B192C]/90 px-2 py-0.5 rounded-full border border-[#c5a880]/30 backdrop-blur-xs">
                      {count} {count === 1 ? "novedad" : "novedades"}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <h5 className="font-serif text-base sm:text-lg font-normal text-white group-hover:text-[#c5a880] transition-colors leading-tight">
                      {cat.label}
                    </h5>
                    <p className="text-[10px] text-[#FAF9F6]/75 line-clamp-1 font-light">
                      {cat.tagline}
                    </p>
                    <span className="text-[9px] tracking-widest uppercase text-[#c5a880] flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorar sección <ArrowRight size={10} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTROLS BAR: Item count, Current Section Title & Sort selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#c5a880]/15">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-light text-[#0B192C]">
            {selectedCategory === "all" ? "Top 10 Novedades para Mascotas" : `Novedades en ${currentCategoryInfo?.label}`}
          </span>
          <span className="text-xs font-mono text-[#0B192C] bg-[#c5a880]/20 px-2.5 py-0.5 rounded-full font-medium">
            {filteredProducts.length} productos
          </span>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 text-xs font-light text-[#121212]/70">
          <SlidersHorizontal size={13} className="text-[#c5a880]" />
          <span className="tracking-wider uppercase text-[10px]">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-[#c5a880]/30 text-[#120002] px-3 py-1.5 rounded-xs text-xs focus:outline-none focus:border-[#8c1d27] cursor-pointer"
          >
            <option value="featured">Destacados Maison</option>
            <option value="price-asc">Precio: de menor a mayor</option>
            <option value="price-desc">Precio: de mayor a menor</option>
            <option value="name">Alfabético A-Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid (Exact design with photography, wishlist heart, quick view, details) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const status = getProductStatus(product);
            const isSoldOut = status === "sold_out";
            const isComingSoon = status === "coming_soon";
            const isUnavailable = isSoldOut || isComingSoon;
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group bg-white border border-[#c5a880]/15 hover:border-[#c5a880]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                
                {/* Product Image Panel */}
                <div 
                  onClick={() => handleOpenQuickView(product)}
                  className="relative overflow-hidden aspect-square bg-[#FBFBFA] cursor-pointer group/image"
                  title={`Tocar para ver detalles de ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isSoldOut
                        ? "opacity-70 grayscale-[25%] group-hover:scale-100"
                        : isComingSoon
                        ? "opacity-85 group-hover:scale-100"
                        : "group-hover:scale-105"
                    }`}
                  />

                  {/* Novelty Rank Badge */}
                  {getNoveltyRankBadge(product.id) && (
                    <div className="absolute top-3 left-3 z-20 pointer-events-none">
                      <span className="bg-[#0B192C]/90 text-[#c5a880] border border-[#c5a880]/40 text-[9px] font-mono px-2.5 py-1 rounded-full backdrop-blur-xs font-semibold tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles size={10} className="text-[#c5a880]" />
                        {getNoveltyRankBadge(product.id)}
                      </span>
                    </div>
                  )}
                  
                  {/* Sold Out / Coming Soon Subtle Overlay Tag */}
                  {isSoldOut ? (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-4 z-10 text-center pointer-events-none">
                      <div className="bg-[#0B192C]/90 backdrop-blur-[2px] border border-rose-500/40 px-3.5 py-1.5 rounded-xs shadow-md">
                        <span className="text-[11px] font-mono tracking-widest text-rose-200 uppercase font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          agotado
                        </span>
                      </div>
                    </div>
                  ) : isComingSoon ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 z-10 text-center pointer-events-none">
                      <div className="bg-[#0B192C]/90 backdrop-blur-[2px] border border-amber-500/40 px-3.5 py-1.5 rounded-xs shadow-md">
                        <span className="text-[11px] font-mono tracking-widest text-amber-200 uppercase font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          proximamente
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Visual Cover Shadow Layer on Hover */
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  )}

                  {/* Wishlist Toggle Button (Floating) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-[#121212] hover:text-[#0B192C] transition-all duration-300 cursor-pointer z-20"
                    title="Añadir a lista de deseos"
                  >
                    <Heart
                      size={16}
                      className={`transition-colors ${
                        isInWishlist(product.id) ? "fill-[#0B192C] text-[#0B192C]" : "text-stone-600"
                      }`}
                    />
                  </button>

                  {/* Quick view button overlay - Visible on mobile/touch, and on desktop hover */}
                  <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 px-3 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenQuickView(product);
                        setSizeAssistantOpen(false);
                      }}
                      className="w-full bg-[#FAF9F6]/95 hover:bg-[#0B192C] hover:text-white text-[#121212] py-2 px-3 text-[10px] font-medium tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer rounded-xs border border-[#c5a880]/30 backdrop-blur-xs"
                      aria-label={`Vista rápida de ${product.name}`}
                    >
                      <Eye size={13} className="text-[#c5a880]" />
                      <span>Vista Rápida &amp; Especificaciones</span>
                    </button>
                  </div>
                </div>

                {/* Product Details Panel */}
                <div className="p-6 text-center space-y-2.5 bg-[#FAF9F6]">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setSelectedCategory(product.category)}
                      className="font-mono text-[9px] tracking-[0.25em] text-[#c5a880] hover:text-[#0B192C] transition-colors uppercase cursor-pointer font-medium"
                      title={`Ver todos los artículos de ${getCategorySpanishLabel(product.category)}`}
                    >
                      {product.category === "smart-tech" && "Smart Tech & IA"}
                      {product.category === "health" && "Salud & Diagnóstico"}
                      {product.category === "hygiene" && "Higiene & Areneros"}
                      {product.category === "nutrition" && "Nutrición Sostenible"}
                      {product.category === "wellbeing" && "Bienestar & Rehabilitación"}
                      {product.category === "toys" && "Estimulación Cognitiva"}
                      {!["smart-tech", "health", "hygiene", "nutrition", "wellbeing", "toys"].includes(product.category) && getCategorySpanishLabel(product.category)}
                    </button>
                  </div>

                  {/* Availability Badge & Clothing Sizes Badge */}
                  <div className="flex flex-col items-center justify-center gap-1">
                    {status === "available" && (
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-300/80 px-2.5 py-0.5 rounded-xs inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        pieza disponible
                      </span>
                    )}
                    {status === "sold_out" && (
                      <span className="text-[10px] font-mono font-bold text-rose-800 uppercase tracking-wider bg-rose-50 border border-rose-300/80 px-2.5 py-0.5 rounded-xs inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        agotado
                      </span>
                    )}
                    {status === "coming_soon" && (
                      <span className="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider bg-amber-50 border border-amber-300/80 px-2.5 py-0.5 rounded-xs inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        proximamente
                      </span>
                    )}

                    {product.category === "clothing" && (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-stone-500 pt-0.5">
                        <span className="text-stone-400">Tallas:</span>
                        <span className="font-semibold text-[#8c1d27]">
                          {(product.sizes && product.sizes.length > 0) ? product.sizes.join(" · ") : "XS · S · M · L · XL · XXL"}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h4 
                    onClick={() => handleOpenQuickView(product)}
                    className="font-serif text-lg font-normal text-[#0B192C] tracking-wide truncate hover:text-[#c5a880] transition-colors cursor-pointer"
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  
                  <p className="font-sans text-xs font-light text-[#121212]/65 line-clamp-2 h-10 px-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <p className="font-serif text-base font-semibold text-[#0B192C] font-mono pt-1">
                      {product.price.toLocaleString("es-ES")} €
                    </p>
                    
                    {/* Botones Privados de Administración (Solo para la Dueña) */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 ml-1 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSharingProduct(product);
                          }}
                          className="px-2 py-0.5 bg-[#c5a880]/20 hover:bg-[#0B192C] text-[#0B192C] hover:text-white border border-[#c5a880]/60 rounded-xs text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Publicar en Redes (Solo visible para ti)"
                        >
                          <Share2 size={11} />
                          <span>Publicar</span>
                        </button>

                        {onUpdateProduct && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(product);
                            }}
                            className="p-1 text-stone-500 hover:text-white hover:bg-[#0B192C] bg-white border border-stone-300 transition-colors rounded-xs cursor-pointer shadow-2xs"
                            title="Editar datos de este artículo"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Add To Cart */}
                  <div className="pt-4">
                    {status === "sold_out" ? (
                      <button
                        disabled
                        className="w-full bg-rose-50 text-rose-700 py-3 text-[11px] font-mono font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 cursor-not-allowed border border-rose-300 rounded-xs"
                      >
                        <XCircle size={13} />
                        Agotado
                      </button>
                    ) : status === "coming_soon" ? (
                      <button
                        disabled
                        className="w-full bg-amber-50 text-amber-800 py-3 text-[11px] font-mono font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 cursor-not-allowed border border-amber-300 rounded-xs"
                      >
                        <Clock size={13} />
                        Próximamente
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-[#0B192C] hover:bg-[#1E293B] text-white py-3 text-[11px] font-medium tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-xs group/btn"
                      >
                        <ShoppingBag size={13} className="text-[#c5a880] group-hover/btn:scale-110 transition-transform" />
                        <span>Añadir a la Cesta</span>
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* QUICK VIEW OVERLAY MODAL */}
      <AnimatePresence>
        {currentQuickViewProduct && (() => {
          const qvStatus = getProductStatus(currentQuickViewProduct);
          const isQVSoldOut = qvStatus === "sold_out";
          const isQVComingSoon = qvStatus === "coming_soon";
          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setQuickViewProduct(null)}
                className="fixed inset-0 bg-black/70 z-50 pointer-events-auto backdrop-blur-xs"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-x-12 md:inset-y-12 lg:inset-x-32 lg:inset-y-16 bg-[#FAF9F6] border border-[#c5a880]/30 shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row rounded-sm pointer-events-auto"
              >
                
                {/* Image Viewport (Left / Top) */}
                <div className="md:w-1/2 h-64 md:h-full relative bg-stone-100 border-b md:border-b-0 md:border-r border-[#c5a880]/15">
                  <img
                    src={currentQuickViewProduct.image}
                    alt={currentQuickViewProduct.name}
                    className={`w-full h-full object-cover ${
                      isQVSoldOut
                        ? "opacity-70 grayscale-[25%]"
                        : isQVComingSoon
                        ? "opacity-85"
                        : ""
                    }`}
                  />
                  {isQVSoldOut ? (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-4 text-center pointer-events-none">
                      <div className="bg-[#120002]/90 backdrop-blur-[2px] border border-rose-500/40 px-4 py-2 rounded-xs shadow-md">
                        <span className="text-xs font-mono tracking-widest text-rose-200 uppercase font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          agotado
                        </span>
                      </div>
                    </div>
                  ) : isQVComingSoon ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 text-center pointer-events-none">
                      <div className="bg-[#120002]/90 backdrop-blur-[2px] border border-amber-500/40 px-4 py-2 rounded-xs shadow-md">
                        <span className="text-xs font-mono tracking-widest text-amber-200 uppercase font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          proximamente
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <button
                    onClick={() => toggleWishlist(currentQuickViewProduct)}
                    className="absolute top-4 left-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow text-stone-700 hover:text-[#8c1d27] transition-colors cursor-pointer z-10"
                    title="Añadir a lista de deseos"
                  >
                    <Heart
                      size={18}
                      className={isInWishlist(currentQuickViewProduct.id) ? "fill-[#8c1d27] text-[#8c1d27]" : ""}
                    />
                  </button>

                  {/* Direct Change / Edit Escaparate Photo button (Solo para la dueña en modo admin) */}
                  {isAdmin && onUpdateProduct && (
                    <button
                      onClick={() => setEditingProduct(currentQuickViewProduct)}
                      className="absolute bottom-4 left-4 px-3 py-2 bg-black/75 hover:bg-[#8c1d27] text-white text-[11px] font-mono tracking-wider uppercase rounded-xs backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2 transition-all cursor-pointer z-10"
                      title="Cambiar o editar la foto de este producto (subir tu foto o enlace web)"
                    >
                      <Camera size={14} className="text-[#c5a880]" />
                      <span>Cambiar Foto Escaparate</span>
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute top-4 right-4 p-2 bg-white/95 border border-[#c5a880]/20 text-[#121212] hover:text-[#8c1d27] transition-colors rounded-full shadow-lg z-20 cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Product Content Sheet (Right / Bottom) */}
                <div className="md:w-1/2 h-full overflow-y-auto p-6 md:p-10 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Category breadcrumb & status */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-[#c5a880] uppercase font-medium">
                          Peludos &amp; Co • Vanguardia 2026
                        </span>
                        <span className="text-[#c5a880]/40 text-xs">•</span>
                        <button
                          onClick={() => {
                            setSelectedCategory(currentQuickViewProduct.category);
                            setQuickViewProduct(null);
                          }}
                          className="font-mono text-[10px] tracking-[0.2em] text-[#0B192C] hover:underline uppercase cursor-pointer font-semibold"
                        >
                          {getCategorySpanishLabel(currentQuickViewProduct.category)}
                        </button>
                      </div>

                      {qvStatus === "available" && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-xs inline-flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          disponible
                        </span>
                      )}
                      {qvStatus === "sold_out" && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded-xs inline-flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          agotado
                        </span>
                      )}
                      {qvStatus === "coming_soon" && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-600 text-white px-2.5 py-1 rounded-xs inline-flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          proximamente
                        </span>
                      )}
                    </div>

                    {/* Title and Price */}
                    <div>
                      {getNoveltyRankBadge(currentQuickViewProduct.id) && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B192C] text-[#c5a880] text-[10px] font-mono font-semibold tracking-wider mb-2">
                          <Sparkles size={11} className="text-[#c5a880]" />
                          {getNoveltyRankBadge(currentQuickViewProduct.id)}
                        </span>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-serif text-2xl md:text-3xl font-light text-[#0B192C] tracking-wider">
                          {currentQuickViewProduct.name}
                        </h3>
                        {isAdmin && onUpdateProduct && (
                          <button
                            onClick={() => {
                              setEditingProduct(currentQuickViewProduct);
                            }}
                            className="flex items-center gap-1.5 text-xs font-mono text-stone-500 hover:text-[#0B192C] border border-stone-300 hover:border-[#0B192C] px-2.5 py-1.5 rounded transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                            title="Editar precio y textos de esta pieza"
                          >
                            <Edit3 size={13} />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#0B192C] font-mono mt-2">
                        {currentQuickViewProduct.price.toLocaleString("es-ES")} €
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs font-light text-[#121212]/80 leading-relaxed tracking-wide font-sans">
                      {currentQuickViewProduct.description}
                    </p>

                    {/* Specifications & History */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-serif text-xs font-semibold tracking-wider text-[#0B192C] uppercase mb-2">
                          Especificaciones &amp; Valor Clínico
                        </h5>
                        <ul className="text-[11px] font-light text-[#121212]/75 space-y-1.5 list-disc pl-4 tracking-wide">
                          {currentQuickViewProduct.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <h5 className="font-serif text-xs font-semibold tracking-wider text-[#0B192C] uppercase mb-1 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-[#c5a880]" />
                          Impacto en el Bienestar &amp; Fundamento
                        </h5>
                        <p className="text-[11px] font-light text-[#121212]/80 leading-relaxed bg-[#c5a880]/10 p-3.5 border-l-2 border-[#c5a880] rounded-r-xs">
                          {currentQuickViewProduct.history}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Clothing Size Selector */}
                    {currentQuickViewProduct.category === "clothing" && (
                      <div className="border border-[#c5a880]/30 p-4 rounded-sm bg-[#8c1d27]/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#120002] uppercase tracking-widest flex items-center gap-2">
                            <Tag size={14} className="text-[#8c1d27]" />
                            Elección de Talla (Ropa)
                          </span>
                          <span className="text-[11px] font-mono text-[#8c1d27] font-semibold bg-[#8c1d27]/10 px-2 py-0.5 rounded-xs">
                            Talla seleccionada: {selectedClothingSize}
                          </span>
                        </div>

                        {/* Size buttons */}
                        <div className="grid grid-cols-6 gap-1.5 pt-1">
                          {(currentQuickViewProduct.sizes && currentQuickViewProduct.sizes.length > 0
                            ? currentQuickViewProduct.sizes
                            : ["XS", "S", "M", "L", "XL", "XXL"]
                          ).map((sz) => {
                            const isSelected = selectedClothingSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setSelectedClothingSize(sz)}
                                className={`py-2 px-1 text-center font-mono text-xs uppercase tracking-wider rounded-xs border transition-all cursor-pointer font-medium flex flex-col items-center justify-center ${
                                  isSelected
                                    ? "bg-[#120002] border-[#8c1d27] text-white shadow-sm ring-1 ring-[#8c1d27]"
                                    : "bg-white border-[#c5a880]/30 text-[#120002] hover:border-[#8c1d27] hover:bg-[#8c1d27]/10"
                                }`}
                              >
                                <span className="font-bold text-xs">{sz}</span>
                                <span className={`text-[8px] font-sans ${isSelected ? "text-[#c5a880]" : "text-stone-400"}`}>
                                  {isSelected ? "Elegida" : "Disp."}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#121212]/60 font-mono pt-1 border-t border-[#c5a880]/15">
                          <span>Confección europea de alta costura</span>
                          {onUpdateProduct && (
                            <button
                              type="button"
                              onClick={() => setEditingProduct(currentQuickViewProduct)}
                              className="text-[#8c1d27] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Edit3 size={11} />
                              Personalizar Tallas (XS-XXL)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactive Sizing Assistant for Jewelry */}
                    {(currentQuickViewProduct.category === "jewelry" || currentQuickViewProduct.id === "trinity-ring" || currentQuickViewProduct.id === "love-bracelet") && (
                      <div className="border border-[#c5a880]/30 p-4 rounded-sm bg-[#c5a880]/5 space-y-3">
                        <button
                          onClick={() => setSizeAssistantOpen(!sizeAssistantOpen)}
                          className="w-full flex items-center justify-between text-xs font-medium text-[#120002] hover:text-[#8c1d27] transition-colors uppercase tracking-widest cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Ruler size={14} className="text-[#c5a880]" />
                            Guía & Asistente de Tallas
                          </span>
                          <span className="text-[10px] text-[#8c1d27] border-b border-dashed border-[#8c1d27]">
                            {sizeAssistantOpen ? "Ocultar" : "Calcular Talla"}
                          </span>
                        </button>

                        {sizeAssistantOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 text-xs space-y-4"
                          >
                            <div className="space-y-3">
                              <p className="text-[10px] text-[#121212]/60 leading-relaxed">
                                Ajuste la medida para verificar la recomendación personalizada de Peludos &amp; Co:
                              </p>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span>Diámetro / Contorno:</span>
                                  <span className="font-bold text-[#8c1d27]">{wristMeasure} cm</span>
                                </div>
                                <input
                                  type="range"
                                  min="14"
                                  max="20"
                                  step="0.5"
                                  value={wristMeasure}
                                  onChange={(e) => setWristMeasure(parseFloat(e.target.value))}
                                  className="w-full h-1 bg-stone-200 accent-[#8c1d27] rounded-lg appearance-none cursor-pointer"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                                <div className="bg-white p-2 border border-[#c5a880]/20">
                                  <span className="block text-[8px] text-[#121212]/50 uppercase">Ajuste Ceñido</span>
                                  <span className="font-serif font-semibold text-xs text-[#120002]">{getRecommendedLoveSize(wristMeasure).tight} mm</span>
                                </div>
                                <div className="bg-white p-2 border border-[#8c1d27]/40">
                                  <span className="block text-[8px] text-[#8c1d27] font-semibold uppercase">Regular</span>
                                  <span className="font-serif font-semibold text-xs text-[#8c1d27]">{getRecommendedLoveSize(wristMeasure).regular} mm</span>
                                </div>
                                <div className="bg-white p-2 border border-[#c5a880]/20">
                                  <span className="block text-[8px] text-[#121212]/50 uppercase">Ajuste Holgado</span>
                                  <span className="font-serif font-semibold text-xs text-[#120002]">{getRecommendedLoveSize(wristMeasure).loose} mm</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Modal Footer Controls */}
                  <div className="mt-8 pt-6 border-t border-[#c5a880]/15 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#121212]/50">Disponibilidad:</span>
                      {qvStatus === "available" ? (
                        <span className="text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Pieza disponible para entrega inmediata asegurada
                        </span>
                      ) : qvStatus === "sold_out" ? (
                        <span className="text-rose-800 font-semibold flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-xs">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          Artículo agotado (No disponible actualmente)
                        </span>
                      ) : (
                        <span className="text-amber-900 font-semibold flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          Próximamente en catálogo (Lanzamiento exclusivo)
                        </span>
                      )}
                    </div>

                    {/* Herramientas Privadas de Dirección (Solo si isAdmin) */}
                    {isAdmin && (
                      <div className="pt-3 border-t border-dashed border-[#c5a880]/30 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setSharingProduct(currentQuickViewProduct)}
                          className="flex-1 py-2.5 px-3 bg-[#c5a880]/15 hover:bg-[#8c1d27] text-[#8c1d27] hover:text-white border border-[#c5a880]/50 rounded-xs text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                        >
                          <Share2 size={13} />
                          <span>Publicar en Redes (Admin)</span>
                        </button>
                        {onUpdateProduct && (
                          <button
                            onClick={() => setEditingProduct(currentQuickViewProduct)}
                            className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xs text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 size={13} />
                            <span>Editar Datos</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://wa.me/34614704772?text=${encodeURIComponent(`Hola Peludos & Co, me gustaría recibir asesoramiento personalizado sobre: ${currentQuickViewProduct.name} (${currentQuickViewProduct.price} €).`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-sm transition-all"
                      >
                        <MessageCircle size={16} />
                        <span>Consultar por WhatsApp</span>
                      </a>

                      {qvStatus === "sold_out" ? (
                        <button
                          disabled
                          className="flex-1 bg-rose-50 text-rose-700 py-3.5 text-xs font-mono font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-not-allowed border border-rose-300 rounded-xs"
                        >
                          <XCircle size={14} />
                          Producto Agotado
                        </button>
                      ) : qvStatus === "coming_soon" ? (
                        <button
                          disabled
                          className="flex-1 bg-amber-50 text-amber-800 py-3.5 text-xs font-mono font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 cursor-not-allowed border border-amber-300 rounded-xs"
                        >
                          <Clock size={14} />
                          Próximamente Disponible
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            addToCart(currentQuickViewProduct);
                            setQuickViewProduct(null);
                          }}
                          className="flex-1 bg-[#0B192C] hover:bg-[#1E293B] text-white py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow rounded-xs"
                        >
                          <ShoppingBag size={14} className="text-[#c5a880]" />
                          <span>Añadir a la Cesta</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* SOCIAL SHARE MODAL (Herramienta Privada de la Dueña) */}
      <AnimatePresence>
        {sharingProduct && (
          <SocialShareModal
            product={sharingProduct}
            isOpen={!!sharingProduct}
            onClose={() => setSharingProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* PRODUCT EDIT MODAL */}
      <AnimatePresence>
        {currentEditingProduct && onUpdateProduct && (
          <ProductEditModal
            key={currentEditingProduct.id}
            product={currentEditingProduct}
            isOpen={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={(updatedProduct) => {
              onUpdateProduct(updatedProduct);
              if (quickViewProduct && quickViewProduct.id === updatedProduct.id) {
                setQuickViewProduct(updatedProduct);
              }
              setEditingProduct(null);
            }}
            onResetToDefault={onResetProduct ? (id) => {
              onResetProduct(id);
              setEditingProduct(null);
            } : undefined}
          />
        )}
      </AnimatePresence>

    </section>
  );
}
