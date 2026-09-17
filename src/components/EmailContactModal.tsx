import React, { useState, useEffect } from "react";
import { Mail, Copy, Check, ExternalLink, MessageCircle, X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface EmailContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailContactModal({ isOpen, onClose }: EmailContactModalProps) {
  const [copied, setCopied] = useState(false);
  const emailAddress = "peludosandcomp@gmail.com";
  const emailSubject = encodeURIComponent("Consulta • Peludos & Co (Premium Pet Care)");
  const emailBody = encodeURIComponent("Estimado equipo de Peludos & Co,\n\nDeseo recibir información y asesoramiento para el cuidado de mi mascota.\n\nAtentamente,\n");

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${emailSubject}&body=${emailBody}`;
  const outlookWebUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${emailAddress}&subject=${emailSubject}&body=${emailBody}`;
  const nativeMailto = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;
  const whatsappUrl = `https://wa.me/34614704772?text=${encodeURIComponent("Hola Peludos & Co, quisiera consultar información sobre sus servicios de cuidado para mascotas.")}`;

  // Copy email to clipboard
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Error al copiar correo:", err);
    }
  };

  // Auto-attempt copy when modal opens for quick convenience
  useEffect(() => {
    if (isOpen) {
      try {
        navigator.clipboard.writeText(emailAddress);
        setCopied(true);
        const timer = setTimeout(() => setCopied(false), 2500);
        return () => clearTimeout(timer);
      } catch {
        // clipboard may require direct gesture
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-[#FAF9F6] border border-[#c5a880]/40 shadow-2xl rounded-sm p-6 sm:p-8 z-10 text-[#120002] overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-500 hover:text-[#8c1d27] bg-white/80 hover:bg-white rounded-full border border-stone-200 transition-colors cursor-pointer"
            aria-label="Cerrar ventana de contacto"
          >
            <X size={18} />
          </button>

          {/* Header with Emblem */}
          <div className="text-center space-y-3 pb-6 border-b border-[#c5a880]/20">
            <div className="flex justify-center mb-1">
              <Logo variant="emblem" size="sm" theme="original" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#c5a880]/20 text-[#0B192C] text-[10px] font-mono uppercase tracking-widest font-semibold">
              <Sparkles size={11} className="text-[#c5a880]" />
              Atención y Cuidado Personalizado
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-light text-[#0B192C] tracking-wide">
              Contacto por Correo Electrónico
            </h3>
            <p className="text-xs text-stone-600 font-light leading-relaxed max-w-sm mx-auto">
              Escríbanos para cualquier consulta sobre cuidados, nutrición, reservas o asesoramiento para su mascota.
            </p>
          </div>

          {/* Email Address Display Card with 1-Click Copy */}
          <div className="my-6 p-4 rounded-sm bg-white border border-[#c5a880]/30 shadow-2xs space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a880] block font-semibold">
              Correo Oficial Peludos &amp; Co
            </span>
            <div className="flex items-center justify-between gap-3 bg-[#120002]/5 p-3 rounded-xs border border-stone-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#8c1d27]/10 flex items-center justify-center text-[#8c1d27] shrink-0">
                  <Mail size={16} />
                </div>
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#120002] truncate select-all">
                  {emailAddress}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-xs text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copied
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[#120002] hover:bg-[#8c1d27] text-white"
                }`}
                title="Copiar correo al portapapeles"
              >
                {copied ? (
                  <>
                    <Check size={13} />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 pt-1">
                <Check size={11} />
                Dirección copiada al portapapeles con éxito.
              </p>
            )}
          </div>

          {/* Action Options: Gmail Web, Outlook Web, Native Mail, WhatsApp */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 block font-semibold">
              Elija cómo desea enviar su mensaje:
            </span>

            {/* Option 1: Gmail Web (New Tab) */}
            <a
              href={gmailWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xs bg-white hover:bg-red-50/50 border border-stone-200 hover:border-red-300 transition-all duration-200 group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  G
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium text-stone-900 block group-hover:text-red-700 transition-colors">
                    Redactar en Gmail Web
                  </span>
                  <span className="text-[10px] text-stone-500 font-light">
                    Abre Gmail en una nueva pestaña listo para escribir
                  </span>
                </div>
              </div>
              <ExternalLink size={14} className="text-stone-400 group-hover:text-red-600 transition-colors shrink-0" />
            </a>

            {/* Option 2: Native Mail App (mailto) */}
            <a
              href={nativeMailto}
              className="flex items-center justify-between p-3.5 rounded-xs bg-white hover:bg-[#c5a880]/10 border border-stone-200 hover:border-[#c5a880] transition-all duration-200 group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#120002]/10 flex items-center justify-center text-[#8c1d27] shrink-0 group-hover:scale-105 transition-transform">
                  <Mail size={15} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium text-stone-900 block group-hover:text-[#8c1d27] transition-colors">
                    Abrir en App de Correo (Mail de iPhone, Outlook, etc.)
                  </span>
                  <span className="text-[10px] text-stone-500 font-light">
                    Usa la aplicación de correo predeterminada de su dispositivo
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="text-stone-400 group-hover:text-[#8c1d27] transition-colors shrink-0" />
            </a>

            {/* Option 3: Outlook Web (New Tab) */}
            <a
              href={outlookWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xs bg-white hover:bg-blue-50/50 border border-stone-200 hover:border-blue-300 transition-all duration-200 group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  O
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium text-stone-900 block group-hover:text-blue-700 transition-colors">
                    Redactar en Outlook / Hotmail Web
                  </span>
                  <span className="text-[10px] text-stone-500 font-light">
                    Abre correo Outlook Web en una nueva pestaña
                  </span>
                </div>
              </div>
              <ExternalLink size={14} className="text-stone-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </a>

            {/* Option 4: Prefer WhatsApp */}
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-xs bg-[#25D366]/10 hover:bg-[#25D366] text-[#120002] hover:text-white border border-[#25D366]/30 transition-all duration-200 flex items-center justify-center gap-2 text-xs font-medium group"
              >
                <MessageCircle size={15} className="text-[#25D366] group-hover:text-white transition-colors" />
                <span>¿Prefiere contactar por WhatsApp? +34 614 70 47 72</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
