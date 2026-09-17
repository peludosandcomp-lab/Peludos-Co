import React, { useState, useRef } from "react";
import { Product, ProductCategory, ProductAvailability } from "../types";
import { X, Check, AlertCircle, RotateCcw, Edit3, Tag, Layers, CheckCircle2, XCircle, Clock, Upload, Image as ImageIcon, Globe, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

const CLOTHING_SIZES_LIST = ["XS", "S", "M", "L", "XL", "XXL"] as const;

interface ProductEditModalProps {
  key?: string;
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  onResetToDefault?: (productId: string) => void;
}

export default function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSave,
  onResetToDefault
}: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price.toString(),
    category: product.category,
    description: product.description,
    details: product.details.join("\n"),
    history: product.history || "",
    image: product.image
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewError, setPreviewError] = useState(false);
  const [availability, setAvailability] = useState<ProductAvailability>(() => {
    if (product.availability) {
      return product.availability;
    }
    if (product.isAvailable === false) {
      return "sold_out";
    }
    return "available";
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes;
    }
    if (product.category === "clothing") {
      return ["XS", "S", "M", "L", "XL", "XXL"];
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Por favor, introduzca un precio válido (número positivo).");
      return;
    }
    if (!formData.name.trim()) {
      setError("El nombre del artículo no puede quedar vacío.");
      return;
    }

    const updatedDetails = formData.details
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    const updatedProduct: Product = {
      ...product,
      name: formData.name.trim(),
      price: parsedPrice,
      category: formData.category as ProductCategory,
      description: formData.description.trim(),
      details: updatedDetails.length > 0 ? updatedDetails : product.details,
      history: formData.history.trim() || product.history,
      image: formData.image.trim() || product.image,
      sizes: (formData.category === "clothing" || product.category === "clothing")
        ? (selectedSizes.length > 0 ? selectedSizes : ["XS", "S", "M", "L", "XL", "XXL"])
        : product.sizes,
      availability: availability,
      isAvailable: availability === "available"
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#FAF9F6] border border-[#c5a880]/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl z-50 p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8c1d27]/10 flex items-center justify-center text-[#8c1d27]">
              <Edit3 size={16} />
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#8c1d27] uppercase block">
                Edición de Artículo
              </span>
              <h3 className="font-serif text-xl font-light text-[#120002]">
                Editar Precio y Textos
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-[#120002] transition-colors p-1.5 rounded-full hover:bg-stone-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200/80 rounded flex items-center gap-2.5 text-xs text-red-800">
            <AlertCircle size={15} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#120002]/70">
                Nombre del Artículo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-[#c5a880]/40 px-3.5 py-2.5 text-sm text-[#120002] focus:outline-none focus:border-[#8c1d27] rounded-xs"
                placeholder="Nombre del producto"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8c1d27] font-semibold">
                Precio (€) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-white border border-[#8c1d27]/50 px-3.5 py-2.5 pr-8 text-sm font-mono font-medium text-[#8c1d27] focus:outline-none focus:border-[#8c1d27] rounded-xs"
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-stone-400">
                  €
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#120002]/70">
              Descripción Corta *
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-[#c5a880]/40 px-3.5 py-2.5 text-xs text-[#120002] focus:outline-none focus:border-[#8c1d27] rounded-xs resize-none"
              placeholder="Descripción breve del artículo para el catálogo"
              required
            />
          </div>

          {/* AVAILABILITY STATUS SELECTOR (All departments) */}
          <div className="space-y-2.5 bg-stone-50/80 border border-[#c5a880]/30 p-4 rounded-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#120002] text-white flex items-center justify-center">
                  <Layers size={11} />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#120002] font-semibold">
                    Disponibilidad del Artículo *
                  </label>
                  <p className="text-[11px] text-[#120002]/70 font-light">
                    Seleccione el estado que se mostrará en el escaparate
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-500 uppercase">
                3 Estados Disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Option 1: Pieza Disponible (Green) */}
              <button
                type="button"
                onClick={() => setAvailability("available")}
                className={`p-3 text-left rounded-xs border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  availability === "available"
                    ? "bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs"
                    : "bg-white border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-stone-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 size={12} />
                    pieza disponible
                  </span>
                  {availability === "available" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                </div>
                <p className="text-[10px] text-emerald-950 font-sans leading-tight">
                  Artículo disponible para compra y añadir a la bolsa.
                </p>
              </button>

              {/* Option 2: Agotado (Red) */}
              <button
                type="button"
                onClick={() => setAvailability("sold_out")}
                className={`p-3 text-left rounded-xs border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  availability === "sold_out"
                    ? "bg-rose-50/90 border-rose-600 ring-2 ring-rose-600/30 shadow-xs"
                    : "bg-white border-stone-200 hover:border-rose-400 hover:bg-rose-50/30 text-stone-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs bg-rose-600 text-white shadow-xs">
                    <XCircle size={12} />
                    agotado
                  </span>
                  {availability === "sold_out" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  )}
                </div>
                <p className="text-[10px] text-rose-950 font-sans leading-tight">
                  Artículo vendido o no disponible temporalmente.
                </p>
              </button>

              {/* Option 3: Próximamente (Orange) */}
              <button
                type="button"
                onClick={() => setAvailability("coming_soon")}
                className={`p-3 text-left rounded-xs border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  availability === "coming_soon"
                    ? "bg-amber-50/90 border-amber-600 ring-2 ring-amber-600/30 shadow-xs"
                    : "bg-white border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 text-stone-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs bg-amber-600 text-white shadow-xs">
                    <Clock size={12} />
                    proximamente
                  </span>
                  {availability === "coming_soon" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
                  )}
                </div>
                <p className="text-[10px] text-amber-950 font-sans leading-tight">
                  Próximo lanzamiento exclusivo de Peludos &amp; Co.
                </p>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-stone-500 border-t border-[#c5a880]/15">
              <span>
                Estado seleccionado:{" "}
                <strong className={
                  availability === "available" ? "text-emerald-700" :
                  availability === "sold_out" ? "text-rose-700" : "text-amber-700"
                }>
                  {availability === "available" ? "PIEZA DISPONIBLE (VERDE)" :
                   availability === "sold_out" ? "AGOTADO (ROJO)" : "PRÓXIMAMENTE (NARANJA)"}
                </strong>
              </span>
              <span className="text-stone-400">Afecta al catálogo y opciones de compra</span>
            </div>
          </div>

          {/* SIZES SELECTION FOR CLOTHING */}
          {(formData.category === "clothing" || product.category === "clothing") && (
            <div className="space-y-2.5 bg-[#8c1d27]/5 border border-[#8c1d27]/25 p-4 rounded-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#8c1d27] text-white flex items-center justify-center">
                    <Tag size={11} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8c1d27] font-semibold">
                      Elección de Talla (Ropa)
                    </label>
                    <p className="text-[11px] text-[#120002]/70 font-light">
                      Seleccione las tallas disponibles para esta prenda
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedSizes([...CLOTHING_SIZES_LIST])}
                    className="text-[#8c1d27] hover:underline font-semibold cursor-pointer"
                  >
                    Todas (XS-XXL)
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSizes(["S", "M", "L"])}
                    className="text-stone-600 hover:text-[#8c1d27] cursor-pointer"
                  >
                    S / M / L
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSizes([])}
                    className="text-stone-500 hover:text-red-700 cursor-pointer"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {/* Size Buttons Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                {CLOTHING_SIZES_LIST.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSizes(selectedSizes.filter((s) => s !== size));
                        } else {
                          setSelectedSizes([...selectedSizes, size]);
                        }
                      }}
                      className={`py-2 px-1 text-center font-mono text-xs rounded-xs border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? "bg-[#120002] border-[#8c1d27] text-white font-semibold shadow-xs"
                          : "bg-white border-stone-200 text-stone-600 hover:border-[#8c1d27]/50 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-sm tracking-wider">{size}</span>
                      <span className={`text-[9px] font-sans ${isSelected ? "text-[#c5a880]" : "text-stone-400"}`}>
                        {isSelected ? "✓ Disponible" : "No disp."}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8c1d27] pt-1">
                <span>
                  Tallas activadas: <strong>{selectedSizes.length > 0 ? selectedSizes.join(" · ") : "Ninguna (Se mostrará como talla única/a consultar)"}</strong>
                </span>
                <span className="text-stone-400">
                  {selectedSizes.length} de 6 tallas
                </span>
              </div>
            </div>
          )}

          {/* Details / Specifications */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#120002]/70 flex items-center justify-between">
              <span>Especificaciones / Detalles (Una por línea)</span>
              <span className="text-[10px] text-stone-400 font-normal lowercase">1 línea = 1 viñeta</span>
            </label>
            <textarea
              rows={3}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-white border border-[#c5a880]/40 px-3.5 py-2.5 text-xs text-[#120002] focus:outline-none focus:border-[#8c1d27] rounded-xs font-sans leading-relaxed"
              placeholder="Volumen: 100 ml&#10;Notas: Ron ambarino, Nardo, Cuero&#10;Presentación: Estuche de lujo"
            />
          </div>

          {/* History / Saber Hacer */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#120002]/70">
              Historia & Saber Hacer (Opcional)
            </label>
            <textarea
              rows={2}
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              className="w-full bg-white border border-[#c5a880]/40 px-3.5 py-2.5 text-xs text-[#120002] focus:outline-none focus:border-[#8c1d27] rounded-xs italic"
              placeholder="Historia poética o inspiración artesanal del producto"
            />
          </div>

          {/* Image Chooser: Upload user photo or Web link */}
          <div className="space-y-2.5 bg-stone-50/80 border border-[#c5a880]/30 p-4 rounded-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#120002] text-white flex items-center justify-center">
                  <ImageIcon size={11} />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#120002] font-semibold">
                    Fotografía del Escaparate *
                  </label>
                  <p className="text-[11px] text-[#120002]/70 font-light">
                    Elija entre la foto adjunta por usted o una foto investigada de catálogo/web
                  </p>
                </div>
              </div>
            </div>

            {/* Visual preview and upload trigger */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xs overflow-hidden border border-[#c5a880]/40 bg-white shrink-0 shadow-xs">
                <img
                  src={formData.image}
                  alt="Vista previa del escaparate"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewError(true)}
                  onLoad={() => setPreviewError(false)}
                />
                {previewError && (
                  <div className="absolute inset-0 bg-stone-100 flex items-center justify-center p-2 text-center text-[10px] text-red-600 font-mono">
                    Error de imagen
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                {/* Action buttons to upload or paste */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.jfif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setFormData({ ...formData, image: event.target.result as string });
                            setPreviewError(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-[#120002] hover:bg-[#8c1d27] text-white text-xs font-mono uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload size={13} />
                    <span>Subir Mi Foto Adjunta</span>
                  </button>

                  {product.image && formData.image !== product.image && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: product.image });
                        setPreviewError(false);
                      }}
                      className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-mono uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Volver a Foto Web/Catálogo</span>
                    </button>
                  )}
                </div>

                {/* Direct text input for web link */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">
                    O introducir enlace / ruta web directa:
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setPreviewError(false);
                      }}
                      className="w-full bg-white border border-[#c5a880]/40 px-3.5 py-1.5 pr-8 text-xs font-mono text-[#120002] focus:outline-none focus:border-[#8c1d27] rounded-xs"
                      placeholder="/images/... o https://..."
                    />
                    <Globe size={13} className="absolute right-3 top-2 text-stone-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-5 border-t border-[#c5a880]/20 flex items-center justify-between gap-3 flex-wrap">
            {onResetToDefault && (
              <button
                type="button"
                onClick={() => {
                  onResetToDefault(product.id);
                  onClose();
                }}
                className="text-[11px] font-mono text-stone-500 hover:text-[#8c1d27] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer py-2"
                title="Restaurar datos originales de fábrica de este artículo"
              >
                <RotateCcw size={13} />
                Restaurar Original
              </button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-600 hover:bg-stone-200/50 rounded-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#120002] hover:bg-[#8c1d27] text-white px-5 py-2.5 text-xs font-light tracking-[0.15em] uppercase flex items-center gap-2 rounded-xs shadow transition-colors cursor-pointer"
              >
                <Check size={14} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
