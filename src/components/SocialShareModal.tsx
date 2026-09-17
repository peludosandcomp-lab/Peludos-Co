import React, { useState } from "react";
import { Product } from "../types";
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Instagram, 
  Music2, 
  MessageCircle, 
  Sparkles, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Globe,
  Facebook
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SocialShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialShareModal({ product, isOpen, onClose }: SocialShareModalProps) {
  const [activeTab, setActiveTab] = useState<"instagram" | "tiktok" | "whatsapp">("instagram");
  const [viewMode, setViewMode] = useState<"text" | "interactive">("text");
  const [copied, setCopied] = useState(false);
  const [imageDownloaded, setImageDownloaded] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  if (!isOpen) return null;

  // Formatted Texts for Each Network
  const instagramText = `✨ Peludos & Co • Premium Pet Care ✨

Artículo / Servicio: ${product.name}
Precio: ${product.price.toLocaleString("es-ES")} €
${product.category === "clothing" && product.sizes && product.sizes.length > 0 ? `Tallas: ${product.sizes.join(" · ")}\n` : ""}
${product.description}

✨ Detalles:
${product.details.map((d) => `• ${d}`).join("\n")}

📍 Cuidado y bienestar exclusivo para perros y gatos. Atención personalizada y cita previa.
📲 Pedidos y reservas inmediatas por WhatsApp: +34 614 70 47 72
📧 Correo: peludosandcomp@gmail.com

#PeludosAndCo #PeludosCompany #PremiumPetCare #CuidadoMascotas #BienestarAnimal #PerrosYFelinos`;

  const tikTokText = `✨ Peludos & Co • Premium Pet Care ✨
${product.name} • ${product.price.toLocaleString("es-ES")} €

${product.description}

Pide la tuya o agenda tu cita por mensaje directo o WhatsApp al +34 614 70 47 72.
Atención y asesoramiento personalizado para tu mascota.

#peludosandcompany #peludos_company #premiumpetcare #mascotas #perrosygatos`;

  const whatsAppText = `Hola 🐾 Te comparto esta información de Peludos & Co (Premium Pet Care):

*${product.name}*
Precio: ${product.price.toLocaleString("es-ES")} €
${product.category === "clothing" && product.sizes && product.sizes.length > 0 ? `Tallas: ${product.sizes.join(" · ")}\n` : ""}
${product.description}

📲 Consultas y reservas por WhatsApp al +34 614 70 47 72`;

  const getCurrentText = () => {
    if (activeTab === "tiktok") return tikTokText;
    if (activeTab === "whatsapp") return whatsAppText;
    return instagramText;
  };

  const handleCopyText = async () => {
    const textToCopy = getCurrentText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Error al copiar texto:", e);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setImageDownloaded(true);
      const safeName = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const response = await fetch(product.image);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `katty-prive-${safeName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setTimeout(() => setImageDownloaded(false), 3500);
    } catch (err) {
      // Fallback: abrir imagen en nueva pestaña para guardar
      window.open(product.image, "_blank");
      setImageDownloaded(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#120002]/80 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#c5a880]/40 shadow-2xl z-10 my-8 overflow-hidden rounded-xs"
      >
        {/* Header Exclusivo de Dueña / Admin */}
        <div className="bg-[#120002] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a880]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/50 flex items-center justify-center text-[#c5a880]">
              <Share2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase">
                  Herramienta Privada • Dueña de Boutique
                </span>
                <span className="bg-[#c5a880]/20 text-[#c5a880] text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Solo visible para ti
                </span>
              </div>
              <h3 className="font-serif text-base text-[#FAF9F6]">
                Kit de Publicación Rápida en Redes
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#FAF9F6]/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Guía en 3 sencillos pasos */}
        <div className="bg-[#8c1d27]/5 border-b border-[#8c1d27]/15 px-6 py-3">
          <p className="text-xs text-[#8c1d27] font-medium flex items-center gap-2">
            <Sparkles size={14} className="shrink-0" />
            <span>
              <strong>Modo fácil:</strong> 1º Copia el texto redactado, 2º Descarga la foto y 3º Abre tu red social para publicarla. ¡En 30 segundos!
            </span>
          </p>
        </div>

        {/* Barra destacada con Link Directo a tu Web Oficial */}
        <div className="bg-[#120002] border-b border-[#c5a880]/30 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 text-xs">
            <Globe size={15} className="text-[#c5a880] shrink-0" />
            <span className="text-[#FAF9F6]/70 text-[11px] font-mono">Web Oficial en Vivo:</span>
            <a
              href="https://kattyprivemadrid.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c5a880] hover:text-white font-medium underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              https://kattyprivemadrid.netlify.app/
              <ExternalLink size={12} />
            </a>
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText("https://kattyprivemadrid.netlify.app/");
                alert("¡Enlace web copiado al portapapeles!");
              } catch (err) {
                // fallback
              }
            }}
            className="px-2.5 py-1 bg-[#c5a880]/20 hover:bg-[#c5a880] text-[#c5a880] hover:text-[#120002] border border-[#c5a880]/40 rounded-xs text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
          >
            <Copy size={11} />
            <span>Copiar Enlace Web</span>
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Ficha Resumen del Producto */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-[#c5a880]/20 rounded-xs">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xs border border-stone-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] font-mono text-[#c5a880] uppercase tracking-wider block">
                {product.category}
              </span>
              <h4 className="font-serif text-base text-[#120002] font-medium">
                {product.name}
              </h4>
              <p className="text-sm font-mono text-[#8c1d27] font-semibold mt-0.5">
                {product.price.toLocaleString("es-ES")} €
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadImage}
                className="px-3.5 py-2.5 bg-stone-900 hover:bg-[#8c1d27] text-white text-xs font-mono uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {imageDownloaded ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>¡Foto Descargada!</span>
                  </>
                ) : (
                  <>
                    <Download size={15} className="text-[#c5a880]" />
                    <span>Descargar Foto</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Selector de Red Social */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-widest text-[#121212]/60 block mb-2 font-medium">
              ¿Dónde deseas publicar este artículo?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setActiveTab("instagram");
                  setCopied(false);
                }}
                className={`p-3 rounded-xs border text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "instagram"
                    ? "bg-[#120002] text-[#FAF9F6] border-[#120002] shadow"
                    : "bg-white text-stone-700 border-stone-200 hover:border-[#c5a880]"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#c5a880] to-[#8c1d27] flex items-center justify-center text-white">
                  <Instagram size={13} />
                </div>
                <span>Instagram</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("tiktok");
                  setCopied(false);
                }}
                className={`p-3 rounded-xs border text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "tiktok"
                    ? "bg-[#120002] text-[#FAF9F6] border-[#120002] shadow"
                    : "bg-white text-stone-700 border-stone-200 hover:border-[#c5a880]"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-[#c5a880]">
                  <Music2 size={13} />
                </div>
                <span>TikTok</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("whatsapp");
                  setCopied(false);
                }}
                className={`p-3 rounded-xs border text-xs font-medium flex flex-col sm:flex-row items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "whatsapp"
                    ? "bg-[#120002] text-[#FAF9F6] border-[#120002] shadow"
                    : "bg-white text-stone-700 border-stone-200 hover:border-[#c5a880]"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                  <MessageCircle size={13} />
                </div>
                <span>WhatsApp Estado</span>
              </button>
            </div>
          </div>

          {/* Área de Texto Pre-redactado */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#121212]/70 font-semibold">
                  Texto para Redes Sociales:
                </span>
                <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
                  (Incluye link oficial y detalles)
                </span>
              </div>

              {/* Selector de Modo: Copiar vs Vista con Enlace Clicable */}
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-xs text-[11px] font-mono">
                <button
                  onClick={() => setViewMode("text")}
                  className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                    viewMode === "text"
                      ? "bg-white text-stone-900 font-medium shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  📝 Modo Copiar
                </button>
                <button
                  onClick={() => setViewMode("interactive")}
                  className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
                    viewMode === "interactive"
                      ? "bg-[#8c1d27] text-white font-medium shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Globe size={12} />
                  <span>👁️ Vista con Link Activo</span>
                </button>
              </div>
            </div>

            {viewMode === "text" ? (
              <div className="relative">
                <textarea
                  readOnly
                  value={getCurrentText()}
                  rows={8}
                  className="w-full bg-white border border-[#c5a880]/40 rounded-xs p-3.5 text-xs text-stone-800 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#8c1d27]"
                />

                <button
                  onClick={handleCopyText}
                  className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-mono rounded-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-[#8c1d27] hover:bg-[#120002] text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>¡Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Vista Interactiva con Enlaces Cliqueables */
              <div className="bg-white border border-[#c5a880]/50 rounded-xs p-4 text-xs text-stone-800 font-sans leading-relaxed space-y-3 relative shadow-inner">
                <div className="whitespace-pre-line">
                  {getCurrentText().split("https://kattyprivemadrid.netlify.app/").map((part, idx, arr) => (
                    <React.Fragment key={idx}>
                      {part}
                      {idx < arr.length - 1 && (
                        <a
                          href="https://kattyprivemadrid.netlify.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 bg-[#8c1d27]/10 text-[#8c1d27] hover:bg-[#8c1d27] hover:text-white font-semibold rounded-xs border border-[#8c1d27]/30 transition-all underline decoration-[#8c1d27] underline-offset-2"
                        >
                          <Globe size={12} />
                          <span>https://kattyprivemadrid.netlify.app/</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-[#8c1d27] hover:bg-[#120002] text-white text-xs font-mono rounded-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? "¡Copiado!" : "Copiar todo el texto"}</span>
                  </button>
                </div>
              </div>
            )}

            {copied && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 size={14} />
                El texto ya está en tu portapapeles. Solo tienes que pulsar "Pegar" en tu red social.
              </p>
            )}

            {/* TARJETA DESTACADA: ENLACE DIRECTO CLIQUEABLE A TU WEB */}
            <div className="bg-gradient-to-r from-[#120002] via-[#240005] to-[#120002] text-white p-4 rounded-xs border border-[#c5a880]/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/60 flex items-center justify-center text-[#c5a880] shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase font-semibold">
                      Link Directo Oficial a la Web:
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                      Online en vivo
                    </span>
                  </div>
                  <a
                    href="https://kattyprivemadrid.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-serif font-medium text-white hover:text-[#c5a880] underline underline-offset-4 flex items-center gap-1.5 transition-colors group mt-0.5"
                  >
                    <span>https://kattyprivemadrid.netlify.app/</span>
                    <ExternalLink size={13} className="text-[#c5a880] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href="https://kattyprivemadrid.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#c5a880] hover:bg-[#b59870] text-[#120002] font-semibold text-xs font-mono uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Globe size={14} />
                  <span>Abrir Web Ahora</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText("https://kattyprivemadrid.netlify.app/");
                      setUrlCopied(true);
                      setTimeout(() => setUrlCopied(false), 3000);
                    } catch (err) {
                      // fallback
                    }
                  }}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-mono rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copiar solo el enlace de la web"
                >
                  {urlCopied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-300">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span className="hidden sm:inline">Copiar URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Botones de Apertura Directa de tus Redes */}
          <div className="pt-2 border-t border-[#c5a880]/20 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#121212]/60 block font-medium">
              Accesos Directos a tus Cuentas Oficiales:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Abrir Tienda Web Oficial */}
              <a
                href="https://kattyprivemadrid.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white hover:bg-[#c5a880]/10 border border-[#c5a880]/40 hover:border-[#8c1d27] rounded-xs text-xs font-medium text-stone-800 transition-colors group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#8c1d27]" />
                  <span className="font-serif">Ver Tienda Web</span>
                </div>
                <ExternalLink size={13} className="text-stone-400 group-hover:text-[#8c1d27]" />
              </a>

              {/* Abrir Instagram */}
              <a
                href="https://www.instagram.com/peludos_company/?__pwa=1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border border-stone-200 hover:border-pink-300 rounded-xs text-xs font-medium text-stone-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Instagram size={16} className="text-pink-600" />
                  <span>Abrir Instagram</span>
                </div>
                <ExternalLink size={14} className="text-stone-400 group-hover:text-pink-600" />
              </a>

              {/* Abrir TikTok */}
              <a
                href="https://www.tiktok.com/@peludosandcompany?lang=es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white hover:bg-stone-100 border border-stone-200 hover:border-stone-400 rounded-xs text-xs font-medium text-stone-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Music2 size={16} className="text-black" />
                  <span>Abrir TikTok</span>
                </div>
                <ExternalLink size={14} className="text-stone-400 group-hover:text-black" />
              </a>

              {/* Abrir Facebook */}
              <a
                href="https://www.facebook.com/people/Peludosandcompany-Company/pfbid02vcq4aifLN8pjLcefCuJeMYmXQ6nYt28gRVYCdwFWjTMakzM6sLQYskvK2RvshbV4l/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white hover:bg-blue-50 border border-stone-200 hover:border-blue-400 rounded-xs text-xs font-medium text-stone-800 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Facebook size={16} className="text-blue-600" />
                  <span>Abrir Facebook</span>
                </div>
                <ExternalLink size={14} className="text-stone-400 group-hover:text-blue-600" />
              </a>
            </div>

            {/* Enviar a WhatsApp directamente */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-2 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xs text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle size={16} />
              <span>Publicar en Estado de WhatsApp o Enviar a Clienta</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 flex items-center justify-between border-t border-stone-200 text-[11px] text-stone-600">
          <div className="flex items-center gap-1.5 text-stone-500">
            <ShieldCheck size={14} className="text-[#c5a880]" />
            <span>Herramienta interna de Peludos &amp; Co</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xs text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
