import React, { useState } from "react";
import { Mail, ArrowRight, Check, Phone, MessageCircle, Globe, Share2, Clock, Instagram, Music2, Lock, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface FooterProps {
  onSelectSlide?: (slideIndex: number) => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
  onLogoutAdmin?: () => void;
  onOpenEmailModal?: () => void;
}

export default function Footer({ onSelectSlide, onOpenAdmin, isAdmin = false, onLogoutAdmin, onOpenEmailModal }: FooterProps = {}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNavigateToSlide = (index: number) => {
    if (onSelectSlide) {
      onSelectSlide(index);
    }
    window.dispatchEvent(new CustomEvent("katty_goto_slide", { detail: { index } }));
    const heroElem = document.getElementById("hero-slider");
    if (heroElem) {
      heroElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0B192C] text-[#FAF9F6] border-t border-[#c5a880]/30 font-light tracking-wide pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-[#c5a880]/15 pb-16">
        
        {/* Brand narrative (Col 1-4) with Official Emblem */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center">
            <Logo variant="horizontal" size="lg" theme="original" />
          </div>
          
          <p className="text-xs text-[#FAF9F6]/75 leading-relaxed max-w-md tracking-wider">
            Cuidado y bienestar exclusivo para mascotas. En <strong className="text-[#c5a880] font-medium">Peludos &amp; Co</strong> nos dedicamos con devoción y profesionalidad al confort y atención de perros y gatos. Atención personalizada, cita previa y asesoría especializada.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-[11px] text-[#FAF9F6]/70 space-y-1">
            <div className="flex items-center gap-1.5 text-[#c5a880] font-medium text-xs">
              <Clock size={13} />
              <span>Modalidad de Atención</span>
            </div>
            <p>Atención directa online, por WhatsApp y visitas a domicilio concertadas.</p>
            <p className="text-[10px] text-[#FAF9F6]/50 italic">Sin dirección fiscal física abierta al público por el momento.</p>
          </div>

          {/* Direct Contact Cards */}
          <div className="space-y-3 pt-2">
            <h5 className="font-serif text-xs uppercase tracking-widest text-[#c5a880] font-semibold flex items-center gap-2">
              <Phone size={13} className="text-[#c5a880]" />
              Atención y Asesoramiento Directo
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* WhatsApp Card */}
              <a
                href="https://wa.me/34614704772?text=Hola,%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20Peludos%20%26%20Co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded bg-white/5 border border-[#c5a880]/20 hover:border-[#c5a880] hover:bg-white/10 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#c5a880] block font-mono">WhatsApp &amp; Tel</span>
                  <span className="text-xs text-[#FAF9F6] font-mono font-medium">+34 614 70 47 72</span>
                </div>
              </a>

              {/* Email Card */}
              <a
                href="mailto:peludosandcomp@gmail.com"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenEmailModal) {
                    onOpenEmailModal();
                  } else {
                    window.dispatchEvent(new CustomEvent("katty_open_email_modal"));
                  }
                }}
                className="flex items-center gap-2.5 p-2.5 rounded bg-white/5 border border-[#c5a880]/20 hover:border-[#c5a880] hover:bg-white/10 transition-all group cursor-pointer"
                title="Escribir correo a peludosandcomp@gmail.com"
              >
                <div className="w-8 h-8 rounded-full bg-[#c5a880]/20 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#c5a880] block font-mono">Correo Electrónico</span>
                  <span className="text-xs text-[#FAF9F6] break-all">peludosandcomp@gmail.com</span>
                </div>
              </a>
            </div>
          </div>
          
          {/* Newsletter subscription */}
          <div className="space-y-3 pt-4">
            <h5 className="font-serif text-xs uppercase tracking-widest text-[#c5a880] font-semibold">
              Suscripción a la Maison
            </h5>
            <p className="text-[10px] text-[#FAF9F6]/50">
              Reciba noticias de nuevas piezas de colección e invitaciones a eventos privados.
            </p>

            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="subscribe"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubscribe} 
                  className="flex items-center space-x-2 border-b border-[#c5a880]/40 pb-2 max-w-md"
                >
                  <Mail size={14} className="text-[#c5a880] shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="Su correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-[#FAF9F6] placeholder-[#FAF9F6]/30 focus:outline-none border-none py-1"
                  />
                  <button type="submit" className="text-[#c5a880] hover:text-[#FAF9F6] transition-colors cursor-pointer">
                    <ArrowRight size={16} />
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-2 text-xs text-[#c5a880] font-medium bg-[#c5a880]/10 p-3 rounded-sm border border-[#c5a880]/20"
                >
                  <Check size={14} />
                  <span>¡Inscripción formalizada con éxito!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Links Grid (Col 6-12) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <h5 className="font-serif text-xs uppercase tracking-[0.15em] text-[#c5a880] font-semibold">
              Servicios Exclusivos
            </h5>
            <ul className="text-[11px] text-[#FAF9F6]/60 space-y-2.5">
              <li><a href="#boutiques" className="hover:text-[#c5a880] transition-colors">Solicitar Cita / Asesoría</a></li>
              <li><a href="https://wa.me/34614704772" target="_blank" rel="noopener noreferrer" className="hover:text-[#c5a880] transition-colors">Asesoría Directa por WhatsApp</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Envíos de cortesía asegurados en todo el territorio nacional e internacional."); }} className="hover:text-[#c5a880] transition-colors">Envíos y Entregas Privadas</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Cada producto de Peludos & Co se entrega con embalaje premium y asesoría personalizada."); }} className="hover:text-[#c5a880] transition-colors">El Arte del Cuidado Peludos &amp; Co</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Garantía oficial y asesoramiento continuo en todos nuestros productos de salud y tecnología."); }} className="hover:text-[#c5a880] transition-colors">Garantía de Calidad Peludos &amp; Co</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h5 className="font-serif text-xs uppercase tracking-[0.15em] text-[#c5a880] font-semibold">
              Peludos &amp; Co Care
            </h5>
            <ul className="text-[11px] text-[#FAF9F6]/60 space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigateToSlide(0)}
                  className="hover:text-[#c5a880] transition-all cursor-pointer flex items-center gap-2 group text-left w-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]/40 group-hover:bg-[#c5a880] group-hover:scale-125 transition-all shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform font-medium">Peludos &amp; Co</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigateToSlide(1)}
                  className="hover:text-[#c5a880] transition-all cursor-pointer flex items-center gap-2 group text-left w-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]/40 group-hover:bg-[#c5a880] group-hover:scale-125 transition-all shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform font-medium">Atención Personalizada</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigateToSlide(2)}
                  className="hover:text-[#c5a880] transition-all cursor-pointer flex items-center gap-2 group text-left w-full"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]/40 group-hover:bg-[#c5a880] group-hover:scale-125 transition-all shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform font-medium">El Arte del Estilo</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Canales Digitales y Redes */}
          <div className="space-y-4">
            <h5 className="font-serif text-xs uppercase tracking-[0.15em] text-[#c5a880] font-semibold">
              Redes Sociales &amp; Presencia
            </h5>
            
            <div className="space-y-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/peludos_company/?__pwa=1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Peludos & Co"
                className="group flex items-center justify-between bg-white/[0.04] hover:bg-[#c5a880]/15 border border-white/10 hover:border-[#c5a880]/40 rounded p-2 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#c5a880]/30 to-[#8c1d27]/40 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform">
                    <Instagram size={13} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#c5a880] font-mono block">Instagram</span>
                    <span className="text-xs text-[#FAF9F6] font-medium group-hover:text-[#c5a880] transition-colors">@peludos_company</span>
                  </div>
                </div>
                <ArrowRight size={13} className="text-[#FAF9F6]/30 group-hover:text-[#c5a880] group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@peludosandcompany?lang=es"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de Peludos & Co"
                className="group flex items-center justify-between bg-white/[0.04] hover:bg-[#c5a880]/15 border border-white/10 hover:border-[#c5a880]/40 rounded p-2 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#FAF9F6]/10 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform">
                    <Music2 size={13} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#c5a880] font-mono block">TikTok</span>
                    <span className="text-xs text-[#FAF9F6] font-medium group-hover:text-[#c5a880] transition-colors">@peludosandcompany</span>
                  </div>
                </div>
                <ArrowRight size={13} className="text-[#FAF9F6]/30 group-hover:text-[#c5a880] group-hover:translate-x-0.5 transition-all" />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/Peludosandcompany-Company/pfbid02vcq4aifLN8pjLcefCuJeMYmXQ6nYt28gRVYCdwFWjTMakzM6sLQYskvK2RvshbV4l/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Peludos & Co"
                className="group flex items-center justify-between bg-white/[0.04] hover:bg-[#c5a880]/15 border border-white/10 hover:border-[#c5a880]/40 rounded p-2 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform">
                    <Facebook size={13} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#c5a880] font-mono block">Facebook</span>
                    <span className="text-xs text-[#FAF9F6] font-medium group-hover:text-[#c5a880] transition-colors">Peludos &amp; Company</span>
                  </div>
                </div>
                <ArrowRight size={13} className="text-[#FAF9F6]/30 group-hover:text-[#c5a880] group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Copy-writing & Social Pill Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#FAF9F6]/40 tracking-wider">
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
          <p>© 2026 Peludos &amp; Co. Todos los derechos reservados.</p>
          <span className="text-[#c5a880]/30 hidden sm:inline">•</span>
          {isAdmin ? (
            <button
              onClick={onLogoutAdmin}
              className="text-[#c5a880] hover:underline cursor-pointer flex items-center gap-1 font-mono text-[9px] bg-white/5 px-2 py-0.5 rounded border border-[#c5a880]/30"
              title="Cerrar el modo privado de gestión"
            >
              <Lock size={9} />
              <span>Modo Boutique Activo (Cerrar Sesión)</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="text-[#FAF9F6]/30 hover:text-[#c5a880] transition-colors cursor-pointer flex items-center gap-1 font-mono text-[9px]"
              title="Acceso exclusivo para la dirección"
            >
              <Lock size={9} />
              <span>Acceso Privado Dirección</span>
            </button>
          )}
        </div>
        
        {/* Quick Social Icon Badges */}
        <div className="flex items-center gap-3">
          <span className="text-[#c5a880]/60 uppercase tracking-widest text-[9px]">Síguenos:</span>
          <a 
            href="https://www.instagram.com/peludos_company/?__pwa=1" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="Instagram @peludos_company"
            className="text-[#FAF9F6]/60 hover:text-[#c5a880] transition-colors p-1"
          >
            <Instagram size={14} />
          </a>
          <a 
            href="https://www.tiktok.com/@peludosandcompany?lang=es" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="TikTok @peludosandcompany"
            className="text-[#FAF9F6]/60 hover:text-[#c5a880] transition-colors p-1"
          >
            <Music2 size={14} />
          </a>
          <a 
            href="https://www.facebook.com/people/Peludosandcompany-Company/pfbid02vcq4aifLN8pjLcefCuJeMYmXQ6nYt28gRVYCdwFWjTMakzM6sLQYskvK2RvshbV4l/" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="Facebook Peludos & Co"
            className="text-[#FAF9F6]/60 hover:text-[#c5a880] transition-colors p-1"
          >
            <Facebook size={14} />
          </a>
        </div>

        <p className="font-serif italic text-[#c5a880]/70">"Dedicación y amor por el bienestar de su mascota" — Peludos &amp; Co</p>
      </div>

    </footer>
  );
}
