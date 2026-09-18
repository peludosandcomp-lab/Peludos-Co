import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Camera, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  lines?: string[];
  image: string;
  linkText: string;
  year: string;
  objectPosition?: string;
  gradientClass?: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "peludos-company",
    title: "Peludos & Co",
    subtitle: "La tienda de lo último en tecnología y productos innovadores para tu perro o gato",
    description: "Tecnología & Vanguardia: Areneros con diagnóstico renal, puertas con microchip, collares smartwatch y robótica interactiva.\nZona Prioritaria Madrid Norte: Demostraciones, asesoría técnica y puesta a punto en el corredor Valdebebas · Sanchinarro · Las Tablas · Montecarmelo.\nAtención Especializada: Asesoramiento cercano vía WhatsApp (+34 614 70 47 72) y entregas con soporte garantizado.",
    lines: [
      "Tecnología & Vanguardia: Areneros con diagnóstico renal, puertas con microchip, collares smartwatch y robótica interactiva.",
      "Zona Prioritaria Madrid Norte: Demostraciones, asesoría técnica y puesta a punto en el corredor Valdebebas · Sanchinarro · Las Tablas · Montecarmelo.",
      "Atención Especializada: Asesoramiento cercano vía WhatsApp (+34 614 70 47 72) y entregas con soporte garantizado."
    ],
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1600",
    linkText: "Explorar Innovaciones Tech",
    year: "Peludos & Co",
    objectPosition: "object-center",
    gradientClass: "bg-gradient-to-r from-[#0B192C] via-[#0B192C]/85 via-40% to-transparent"
  },
  {
    id: "innovacion-salud",
    title: "Innovación & Salud Preventiva",
    subtitle: "Biotracking veterinario, tests genéticos de ADN y purificación ambiental",
    description: "En Peludos & Co seleccionamos los dispositivos más avanzados del mercado internacional para anticipar cualquier necesidad médica y elevar el confort de tu compañero.",
    lines: [
      "Monitorización Clínica: Arneses de biotracking Invoxia, collares GPS con ECG y fuentes con análisis hídrico.",
      "Genética & Prevención: Tests de ADN Embark y Basepaws para cribado preventivo en consulta veterinaria.",
      "Higiene & Confort: Cepillos deslanadores autoaspirantes, purificadores de aire Dreame FP10 y camas climatizadas."
    ],
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1600",
    linkText: "Solicitar Demostración",
    year: "Salud Tech",
    objectPosition: "object-center",
    gradientClass: "bg-gradient-to-r from-[#0B192C] via-[#0B192C]/85 via-45% to-transparent"
  },
  {
    id: "cobertura-norte",
    title: "Valdebebas · Sanchinarro · Las Tablas · Montecarmelo",
    subtitle: "Asesoría y demostración tecnológica a domicilio en el corredor norte de Madrid",
    description: "Servicio exclusivo para familias del corredor norte: te mostramos el funcionamiento de los productos en tu propio hogar.",
    lines: [
      "Demostración a Domicilio: Instalación guiada y prueba in situ de puertas con microchip, comederos y areneros.",
      "Radar Tecnológico 2026: Seguimiento riguroso de innovaciones emergentes en fase de I+D (CES 2026 / Waitlist USA).",
      "Contacto Directo: Reserva tu asesoría personalizada rápidamente por WhatsApp (+34 614 70 47 72)."
    ],
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1600",
    linkText: "Reservar Asesoría a Domicilio",
    year: "Madrid Norte",
    objectPosition: "object-center",
    gradientClass: "bg-gradient-to-r from-[#0B192C] via-[#0B192C]/85 via-45% to-transparent"
  }
];

interface HeroProps {
  onScrollToCatalog?: () => void;
  onOpenGifting?: () => void;
}

export default function Hero({ onScrollToCatalog: _onScrollToCatalog, onOpenGifting: _onOpenGifting }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleGoToSlide = (e: Event) => {
      const customEvent = e as CustomEvent<{ index: number }>;
      if (typeof customEvent.detail?.index === "number") {
        const targetIndex = customEvent.detail.index;
        if (targetIndex >= 0 && targetIndex < HERO_SLIDES.length) {
          setCurrentSlide(targetIndex);
          const heroElem = document.getElementById("hero-slider");
          if (heroElem) {
            heroElem.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }
    };
    window.addEventListener("peludos_goto_slide", handleGoToSlide);
    return () => window.removeEventListener("peludos_goto_slide", handleGoToSlide);
  }, []);
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("peludos_slider_images_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const activeSlide = HERO_SLIDES[currentSlide];
  const currentImageSrc = customImages[activeSlide.id] || activeSlide.image;

  const handleFileChange = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;

      const updated = { ...customImages, [activeSlide.id]: base64 };
      setCustomImages(updated);
      try {
        localStorage.setItem("peludos_slider_images_v1", JSON.stringify(updated));
      } catch (_) {}

      setUploadNotice("Fotografía actualizada y adaptada al slider");
      setTimeout(() => setUploadNotice(null), 4000);

      // Persist to backend server so it stays permanently in public/images
      try {
        const filename = activeSlide.id === "atencion-personalizada"
          ? "peludos-concierge.jpg"
          : activeSlide.id === "peludos-company"
          ? "peludos-hero.jpg"
          : `${activeSlide.id}.jpg`;
        await fetch("/api/upload-hero-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, base64Data: base64 })
        });
      } catch (err) {
        console.warn("Could not save to backend disk:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      id="hero-slider"
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative h-[85vh] w-full overflow-hidden bg-[#0c0b0a] border-b border-[#c5a880]/15 select-none"
    >
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*,.jfif" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
        }}
      />
      
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Degradado hacia la izquierda adaptativo y velo de contraste */}
          <div className={`absolute inset-0 ${activeSlide.gradientClass || "bg-gradient-to-r from-black/85 via-black/50 to-transparent"} z-10`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 z-10" />
          
          <img
            src={currentImageSrc}
            alt={activeSlide.title}
            className={`w-full h-full object-cover ${activeSlide.objectPosition || "object-center"}`}
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12">
          
          {/* Slide Description Panel */}
          <div className="max-w-3xl flex flex-col justify-center space-y-6 text-[#FAF9F6]">
            
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs tracking-[0.3em] text-[#c5a880] uppercase font-semibold">
                Peludos &amp; Co • Premium Pet Care
              </span>
              <div className="h-px w-8 bg-[#c5a880]/40" />
              <span className="font-mono text-xs tracking-[0.2em] text-[#FAF9F6]/70">
                Vanguardia &amp; Bienestar
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl font-light tracking-wider leading-tight text-white drop-shadow-sm">
                  {activeSlide.title}
                </h2>
                <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#c5a880] font-light leading-relaxed">
                  {activeSlide.subtitle}
                </p>
                {activeSlide.lines ? (
                  <div className="space-y-3 max-w-2xl pt-2">
                    {activeSlide.lines.map((line, idx) => {
                      const [boldPart, ...rest] = line.split(":");
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(197,168,128,0.6)]" />
                          <p className="font-sans text-xs md:text-sm font-light text-[#FAF9F6]/90 leading-relaxed tracking-wider">
                            {rest.length > 0 ? (
                              <>
                                <strong className="text-[#c5a880] font-medium tracking-wider uppercase text-[11px] md:text-xs">
                                  {boldPart}:
                                </strong>{" "}
                                <span className="text-[#FAF9F6]/85">{rest.join(":")}</span>
                              </>
                            ) : (
                              line
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-sans text-xs md:text-sm font-light text-[#FAF9F6]/70 max-w-xl leading-relaxed tracking-wider">
                    {activeSlide.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Subtle notification when photo is loaded/dropped */}
      {uploadNotice && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-[#161412]/95 border border-[#c5a880]/50 text-[#FAF9F6] text-xs font-light px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md">
          <Check size={14} className="text-[#c5a880]" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Button to replace slide photo directly if desired */}
      <div className="absolute top-6 right-6 z-20 opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Cambiar o arrastrar fotografía de esta diapositiva"
          className="flex items-center gap-2 text-[11px] font-sans tracking-widest uppercase bg-black/40 hover:bg-black/80 border border-white/20 hover:border-[#c5a880]/60 text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-all cursor-pointer backdrop-blur-sm"
        >
          <Camera size={13} className="text-[#c5a880]" />
          <span className="hidden sm:inline">Cambiar foto</span>
        </button>
      </div>

      {/* Navigation Controls (Bottom Right / Left) */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center space-x-4">
        
        {/* Slide Counter */}
        <span className="font-mono text-xs text-[#FAF9F6]/40 tracking-widest mr-4">
          0{currentSlide + 1} / 0{HERO_SLIDES.length}
        </span>

        {/* Arrow left */}
        <button
          onClick={prevSlide}
          className="p-3 border border-[#FAF9F6]/20 text-[#FAF9F6] hover:bg-[#FAF9F6]/10 hover:border-[#c5a880] transition-colors cursor-pointer"
          aria-label="Anterior"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Arrow right */}
        <button
          onClick={nextSlide}
          className="p-3 border border-[#FAF9F6]/20 text-[#FAF9F6] hover:bg-[#FAF9F6]/10 hover:border-[#c5a880] transition-colors cursor-pointer"
          aria-label="Siguiente"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Slide Indicators (Left Edge) */}
      <div className="absolute left-8 bottom-8 z-20 hidden md:flex items-center space-x-3">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
              idx === currentSlide ? "w-8 bg-[#c5a880]" : "w-2 bg-[#FAF9F6]/30"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
