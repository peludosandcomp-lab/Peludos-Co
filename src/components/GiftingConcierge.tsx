import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Gift, MapPin, Calendar, HelpCircle, ArrowRight, User, RefreshCw } from "lucide-react";
import { ChatMessage, GiftingPreferences } from "../types";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface GiftingConciergeProps {
  onScrollToBoutique: () => void;
}

const PRESET_QUESTIONS = [
  "¿Qué cepillo o cuidado recomiendas para un perro de pelo largo?",
  "¿Cómo elegir el mejor accesorio de paseo y arnés ergonómico?",
  "¿Tenéis champús específicos para pieles sensibles en gatos o perros?",
  "¿Cómo solicitar una cita de cuidado o asesoría a domicilio?"
];

export default function GiftingConcierge({ onScrollToBoutique }: GiftingConciergeProps) {
  // Wizard states
  const [preferences, setPreferences] = useState<GiftingPreferences>({
    category: "",
    recipient: "",
    occasion: "",
    budget: ""
  });
  const [wizardCompleted, setWizardCompleted] = useState(false);

  // Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "concierge",
      text: "¡Bienvenido a Peludos & Co! Es un placer recibirle. Soy su Asesora Virtual de Cuidado y Bienestar para mascotas. Estoy a su disposición para recomendarle el mejor producto, cosmética, nutrición o cuidados personalizados para su perro o gato. ¿En qué puedo ayudarle hoy?",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handlePreferenceChange = (key: keyof GiftingPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const startConsultation = async () => {
    setWizardCompleted(true);
    setIsLoading(true);

    const initialMessage = `Hola. Me gustaría que me aconsejes como asesor experto en bienestar y novedades de Peludos & Co para mi mascota. Mis preferencias iniciales son:\n` +
      `- Destinatario / Mascota: ${preferences.recipient || "Perro o Gato"}\n` +
      `- Ocasión o Necesidad: ${preferences.occasion || "Bienestar diario o cuidado preventivo"}\n` +
      `- Categoría de interés: ${preferences.category || "Cualquiera (tecnología, salud, nutrición...)"}\n` +
      `- Presupuesto estimado: ${preferences.budget || "Sin límite"}`;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: `Deseo recibir recomendaciones personalizadas de Peludos & Co para mi mascota: ${preferences.recipient ? "para " + preferences.recipient : "un cuidado especial"}, enfocado en ${preferences.occasion ? preferences.occasion : "su óptima salud y bienestar"}.`,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch("/api/gift-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: initialMessage,
          chatHistory: [], // first message, so empty history
          preferences
        })
      });

      const data = await response.json();
      
      const conciergeResponse: ChatMessage = {
        id: Math.random().toString(),
        sender: "concierge",
        text: data.text || "Disculpe mi estimada clienta, he tenido un desvío momentáneo. ¿Podría volver a indicarme su deseo?",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistory(prev => [...prev, conciergeResponse]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: "error",
        sender: "concierge",
        text: "Estimada clienta, mis disculpas más sinceras. En este momento el canal de comunicación con la Maison está temporalmente saturado. No obstante, le aconsejo examinar nuestra colección LOVE o Trinity, o bien reservar una cita privada para recibir una atención personalizada con nuestras expertas.",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };

    // Keep actual history for backend format (sender must be 'user' or 'concierge')
    const nextHistory = [...chatHistory, userMessage];
    setChatHistory(nextHistory);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gift-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: nextHistory.map(m => ({ sender: m.sender, text: m.text })),
          preferences: wizardCompleted ? preferences : null
        })
      });

      const data = await response.json();
      
      const conciergeResponse: ChatMessage = {
        id: Math.random().toString(),
        sender: "concierge",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistory(prev => [...prev, conciergeResponse]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Math.random().toString(),
        sender: "concierge",
        text: "Disculpe, temporalmente no he podido procesar la consulta técnica. Puede escribirnos directamente a nuestro WhatsApp (+34 614 70 47 72) o reservar una cita en el formulario inferior.",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssistant = () => {
    setPreferences({
      category: "",
      recipient: "",
      occasion: "",
      budget: ""
    });
    setWizardCompleted(false);
    setChatHistory([
      {
        id: "initial",
        sender: "concierge",
        text: "¡Bienvenido a Peludos & Co! Es un placer recibirle. Soy su Asesora Virtual de Cuidado y Bienestar para mascotas. Estoy a su disposición para recomendarle el mejor producto, cosmética, nutrición o cuidados personalizados para su perro o gato. ¿En qué puedo ayudarle hoy?",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <section id="gifting-concierge" className="bg-[#0B192C] text-[#FAF9F6] py-20 px-6 border-t border-b border-[#c5a880]/30 relative overflow-hidden">
      
      {/* Background radial shimmer */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E3E62]/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left column: Narrative & Gifting Wizard */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-[#c5a880] animate-pulse" />
              <span className="font-mono text-xs tracking-[0.3em] text-[#c5a880] uppercase">
                Atención Peludos &amp; Co
              </span>
            </div>
            <h3 className="font-serif text-3xl md:text-5xl font-light tracking-wide leading-tight">
              Asesoría de Bienestar
            </h3>
            <p className="font-sans text-xs md:text-sm font-light text-[#FAF9F6]/75 leading-relaxed tracking-wide">
              Orientación especializada para su mascota. Indique el perfil de su compañero o converse con nuestra Asesora Virtual para resolver dudas sobre cuidados, productos o agendar su visita.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!wizardCompleted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 bg-black/30 p-6 border border-[#c5a880]/20 rounded-sm"
              >
                <div className="flex items-center gap-2 border-b border-[#c5a880]/15 pb-3">
                  <Gift size={16} className="text-[#c5a880]" />
                  <h4 className="font-serif text-sm tracking-widest uppercase text-[#FAF9F6]">
                    Perfil y Necesidades
                  </h4>
                </div>

                {/* Destination / Recipient selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-[#FAF9F6]/60">¿Para quién es la consulta?</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {["Perro", "Gato", "Cachorro"].map((val) => (
                      <button
                        key={val}
                        onClick={() => handlePreferenceChange("recipient", val)}
                        className={`py-2 px-1 border transition-all cursor-pointer text-center ${
                          preferences.recipient === val 
                            ? "bg-[#FAF9F6] text-[#0B192C] border-[#FAF9F6] font-medium" 
                            : "bg-transparent text-[#FAF9F6]/70 border-[#FAF9F6]/20 hover:border-[#c5a880]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasion Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-[#FAF9F6]/60">Objetivo Principal</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Higiene / Estilo", "Paseo & Confort", "Salud / Nutrición", "Regalo / Accesorio"].map((val) => (
                      <button
                        key={val}
                        onClick={() => handlePreferenceChange("occasion", val)}
                        className={`py-2 border transition-all cursor-pointer text-center ${
                          preferences.occasion === val 
                            ? "bg-[#FAF9F6] text-[#0B192C] border-[#FAF9F6] font-medium" 
                            : "bg-transparent text-[#FAF9F6]/70 border-[#FAF9F6]/20 hover:border-[#c5a880]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category preference Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-[#FAF9F6]/60">Categoría de Interés</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: "higiene", label: "Higiene" },
                      { id: "paseo", label: "Arneses" },
                      { id: "camas", label: "Descanso" },
                      { id: "ropa", label: "Moda" },
                      { id: "accesorios", label: "Accesorios" },
                      { id: "asesoria", label: "Citas" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handlePreferenceChange("category", item.label)}
                        className={`py-1.5 border transition-all cursor-pointer text-center text-[10px] ${
                          preferences.category === item.label
                            ? "bg-[#FAF9F6] text-[#0B192C] border-[#FAF9F6] font-medium" 
                            : "bg-transparent text-[#FAF9F6]/70 border-[#FAF9F6]/20 hover:border-[#c5a880]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-[#FAF9F6]/60">Rango de Valor estimado</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {["Menos de 100€", "100€ a 200€", "Más de 200€", "Sin Límite"].map((val) => (
                      <button
                        key={val}
                        onClick={() => handlePreferenceChange("budget", val)}
                        className={`py-2 border transition-all cursor-pointer text-center text-[10px] ${
                          preferences.budget === val 
                            ? "bg-[#FAF9F6] text-[#120002] border-[#FAF9F6]" 
                            : "bg-transparent text-[#FAF9F6]/70 border-[#FAF9F6]/20 hover:border-[#c5a880]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Begin Consultation Button */}
                <button
                  onClick={startConsultation}
                  className="w-full bg-[#FAF9F6] hover:bg-[#c5a880] text-[#120002] hover:text-[#120002] transition-colors py-3.5 text-xs font-light tracking-[0.25em] uppercase text-center mt-3 cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  Consultar a la Consejera
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-black/20 p-5 border border-[#c5a880]/30 rounded-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#c5a880]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <Gift size={15} className="text-[#c5a880]" />
                    <span className="font-serif text-xs uppercase tracking-widest text-[#FAF9F6]">Preselección Activa</span>
                  </div>
                  <button
                    onClick={resetAssistant}
                    className="text-[10px] text-[#c5a880] hover:text-[#FAF9F6] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    Reiniciar Filtros
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {preferences.recipient && (
                    <div className="flex justify-between text-[#FAF9F6]/75">
                      <span className="text-[#FAF9F6]/45 uppercase text-[9px] tracking-wider">Destinatario:</span>
                      <span>{preferences.recipient}</span>
                    </div>
                  )}
                  {preferences.occasion && (
                    <div className="flex justify-between text-[#FAF9F6]/75">
                      <span className="text-[#FAF9F6]/45 uppercase text-[9px] tracking-wider">Ocasión:</span>
                      <span>{preferences.occasion}</span>
                    </div>
                  )}
                  {preferences.category && (
                    <div className="flex justify-between text-[#FAF9F6]/75">
                      <span className="text-[#FAF9F6]/45 uppercase text-[9px] tracking-wider">Estilo:</span>
                      <span>{preferences.category}</span>
                    </div>
                  )}
                  {preferences.budget && (
                    <div className="flex justify-between text-[#FAF9F6]/75">
                      <span className="text-[#FAF9F6]/45 uppercase text-[9px] tracking-wider">Valor:</span>
                      <span>{preferences.budget}</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#c5a880]/15 my-2" />
                <p className="text-[10px] italic text-[#FAF9F6]/50">
                  La Consejera ha refinado sus criterios y está priorizando las piezas correspondientes en sus recomendaciones.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Conversational Assistant Chat Box */}
        <div className="lg:col-span-7 flex flex-col h-[520px] bg-black/40 border border-[#c5a880]/20 rounded-sm overflow-hidden shadow-2xl relative">
          
          {/* Chat Header */}
          <div className="p-4 bg-black/60 border-b border-[#c5a880]/15 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-[#120002] border border-[#c5a880] rounded-full flex items-center justify-center">
                  <Logo variant="emblem" size="sm" theme="gold" />
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border border-black rounded-full" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-normal text-[#FAF9F6] tracking-wide">Asesor Virtual Peludos &amp; Co</h4>
                <p className="text-[10px] font-light text-emerald-400">En línea • Especialista en Cuidado &amp; Bienestar</p>
              </div>
            </div>

            {/* Reset chat */}
            <button
              onClick={resetAssistant}
              title="Borrar conversación"
              className="p-2 text-[#FAF9F6]/50 hover:text-red-400 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Messages display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-950/20">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-sm p-4 text-xs leading-relaxed space-y-1.5 ${
                    msg.sender === "user"
                      ? "bg-[#0B192C]/80 text-[#FAF9F6] border border-[#c5a880]/30"
                      : "bg-black/50 text-[#FAF9F6]/90 border border-[#c5a880]/10"
                  }`}
                >
                  {msg.sender === "concierge" && (
                    <div className="flex items-center space-x-1 mb-1">
                       <Sparkles size={11} className="text-[#c5a880]" />
                       <span className="text-[9px] uppercase tracking-widest text-[#c5a880] font-semibold">Peludos &amp; Co</span>
                    </div>
                  )}
                  
                  <p className="whitespace-pre-line font-light tracking-wide">{msg.text}</p>
                  
                  <span className="block text-right text-[8px] text-[#FAF9F6]/30 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/50 rounded-sm p-4 border border-[#c5a880]/10 max-w-[80%] space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles size={11} className="text-[#c5a880] animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-[#c5a880] font-semibold">Buscando en los archivos de la Maison...</span>
                  </div>
                  <div className="flex space-x-1.5 items-center pl-1 py-1">
                    <div className="w-1.5 h-1.5 bg-[#c5a880] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#c5a880] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#c5a880] rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick preset queries */}
          {chatHistory.length === 1 && !isLoading && (
            <div className="p-3 border-t border-[#c5a880]/10 bg-black/40 space-y-1.5">
              <span className="text-[9px] text-[#FAF9F6]/40 uppercase tracking-widest px-1 block">Inicie una conversación sobre el legado:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="bg-black/60 hover:bg-[#8c1d27]/20 border border-[#c5a880]/15 text-left text-[10px] text-[#FAF9F6]/80 px-2.5 py-1.5 rounded-sm transition-all hover:border-[#c5a880] max-w-full cursor-pointer truncate"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <div className="p-4 bg-black/60 border-t border-[#c5a880]/15 flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(userInput)}
              placeholder="Escriba aquí su deseo o pregunta... (ej. ¿Qué regalar por aniversario?)"
              className="flex-1 bg-black/40 border border-[#c5a880]/20 rounded-sm px-4 py-3 text-xs text-[#FAF9F6] placeholder-[#FAF9F6]/40 focus:outline-none focus:border-[#c5a880] transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(userInput)}
              className="p-3 bg-[#c5a880] hover:bg-[#8c1d27] text-[#120002] hover:text-white transition-colors duration-300 rounded-sm cursor-pointer"
              disabled={isLoading || !userInput.trim()}
            >
              <Send size={14} />
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
