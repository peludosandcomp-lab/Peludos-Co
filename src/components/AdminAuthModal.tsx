import React, { useState } from "react";
import { Lock, X, KeyRound, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clave fácil y segura para la dueña
    const validKeys = ["katty2026", "katty", "admin", "1234"];
    if (validKeys.includes(password.trim().toLowerCase())) {
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#120002]/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-[#FAF9F6] border border-[#c5a880]/40 shadow-2xl p-6 rounded-xs z-10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#8c1d27]/10 border border-[#8c1d27]/30 flex items-center justify-center text-[#8c1d27]">
            <Lock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase block">
              Peludos &amp; Co • Dirección
            </span>
            <h3 className="font-serif text-lg text-[#0B192C]">
              Acceso Privado de Administración
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-5">
          Este acceso es exclusivo para ti como dueña. Al activarlo, aparecerán en cada artículo los botones privados para <strong>publicar en redes sociales</strong> y modificar datos o precios sin que tus clientes lo vean.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-1.5">
              Introduce tu Clave de Acceso
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Escribe tu clave..."
                autoFocus
                className="w-full px-3 py-2.5 bg-white border border-[#c5a880]/40 rounded-xs text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#8c1d27]"
              />
              <KeyRound size={15} className="absolute right-3 top-3 text-stone-400" />
            </div>
            {error && (
              <p className="text-xs text-rose-700 mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                Clave incorrecta. (Clave por defecto: <strong className="font-mono">katty2026</strong>)
              </p>
            )}
            <p className="text-[10px] text-stone-400 font-mono mt-1">
              * Clave predeterminada configurada: <strong>katty2026</strong>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#120002] hover:bg-[#8c1d27] text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-sm"
            >
              Entrar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
