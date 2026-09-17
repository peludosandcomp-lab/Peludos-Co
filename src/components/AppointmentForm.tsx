import React, { useState } from "react";
import { Appointment } from "../types";
import { Calendar, MapPin, Clock, User, Phone, Mail, FileText, CheckCircle, ArrowRight, MessageCircle, Check, ChevronDown, ChevronUp, Layers, Send, CalendarPlus, Instagram, Music2, Share2, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";

interface AppointmentFormProps {
  onAddAppointment: (appointment: Appointment) => void;
}

const MODALITY_OPTIONS = [
  { 
    id: "domicilio-norte", 
    name: "Demostración a Domicilio — Valdebebas / Sanchinarro / Las Tablas / Montecarmelo", 
    label: "Demostración a Domicilio — Corredor Norte (Valdebebas, Sanchinarro, Las Tablas, Montecarmelo)" 
  },
  { 
    id: "domicilio-madrid", 
    name: "Asesoría Tech a Domicilio en Madrid", 
    label: "Asesoría e Instalación Tech a Domicilio (Resto de Madrid)" 
  },
  { 
    id: "whatsapp", 
    name: "Asistencia y Asesoría Online vía WhatsApp", 
    label: "Asesoramiento Online y Consultas Técnicas vía WhatsApp (+34 614 70 47 72)" 
  }
];

const SERVICES = [
  "Demostración de Puertas Inteligentes con Lector de Microchip",
  "Puesta a Punto de Areneros con Diagnóstico Renal (PETKIT / Litter-Robot)",
  "Prueba de Lanzador IA iFetch & Estimulación Cognitiva (Wicked Ball)",
  "Configuración de Arnés Biotracker Veterinario & Collares Smartwatch GPS",
  "Asesoramiento sobre Tests de ADN Genético (Embark / Basepaws)",
  "Demostración de Cepillo Autoaspirante & Purificador Dreame FP10",
  "Configuración de Cama Climatizada y Ecosistema Integral Conectado"
];

const AVAILABLE_TIMES = [
  "10:30", "11:30", "12:30", "13:30", "15:30", "16:30", "17:30", "18:30"
];

export default function AppointmentForm({ onAddAppointment }: AppointmentFormProps) {
  const [boutique, setBoutique] = useState(MODALITY_OPTIONS[0].name);
  const [selectedServices, setSelectedServices] = useState<string[]>([SERVICES[0]]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(AVAILABLE_TIMES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [bookingCompleted, setBookingCompleted] = useState<Appointment | null>(null);
  const [previousBooking, setPreviousBooking] = useState<Appointment | null>(null);

  const isWhatsAppSelected = boutique.includes("WhatsApp");
  const isHomeVisitSelected = boutique.includes("domicilio");

  const toggleService = (srv: string) => {
    setSelectedServices(prev => {
      if (prev.includes(srv)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(item => item !== srv);
      } else {
        return [...prev, srv];
      }
    });
  };

  const selectAllServices = () => {
    if (selectedServices.length === SERVICES.length) {
      setSelectedServices([SERVICES[0]]);
    } else {
      setSelectedServices([...SERVICES]);
    }
  };

  const generateWhatsAppUrl = (appt: Appointment, isModification = false) => {
    const header = isModification
      ? "⚠️ *AVISO DE MODIFICACIÓN DE CITA - PELUDOS & CO*"
      : "✨ *NUEVA RESERVA DE CITA / ASESORÍA - PELUDOS & CO*";

    const message = `${header}

👤 *Cliente:* ${appt.clientName}
📞 *Teléfono:* ${appt.clientPhone}
📧 *Email:* ${appt.clientEmail}
📍 *Modalidad:* ${appt.boutique}
🐾 *Servicios Seleccionados:* ${appt.service}
📅 *Fecha:* ${appt.date}
⏰ *Hora:* ${appt.time} hs
${appt.notes ? `📝 *Notas / Mascota / Dirección:* ${appt.notes}` : ""}

_Notificación enviada desde la web oficial de Peludos & Co_`;

    return `https://wa.me/34614704772?text=${encodeURIComponent(message)}`;
  };

  const generateGoogleCalendarUrl = (appt: Appointment) => {
    const cleanDate = appt.date ? appt.date.replace(/-/g, "") : "20260901";
    const [hours, minutes] = (appt.time || "11:00").split(":");
    const startH = parseInt(hours || "11", 10);
    const endH = startH + 1;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const startFormatted = `${cleanDate}T${pad(startH)}${minutes || "00"}00`;
    const endFormatted = `${cleanDate}T${pad(endH)}${minutes || "00"}00`;

    const title = encodeURIComponent(`Cita Peludos & Co - ${appt.clientName}`);
    const details = encodeURIComponent(
      `Reserva de asesoría y cuidado en Peludos & Co.\n\n• Modalidad: ${appt.boutique}\n• Servicios: ${appt.service}\n• Cliente: ${appt.clientName} (${appt.clientPhone}, ${appt.clientEmail})\n• Notas: ${appt.notes || "Sin notas adicionales"}`
    );
    const location = encodeURIComponent(
      appt.boutique.includes("domicilio")
        ? appt.notes || "Domicilio del cliente"
        : "Peludos & Co - Asesoría Especializada"
    );

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !date) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }

    const isMod = !!previousBooking;

    const newAppointment: Appointment = {
      id: Math.random().toString(),
      boutique,
      service: selectedServices.join(" • "),
      date,
      time,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      notes,
      status: "scheduled"
    };

    onAddAppointment(newAppointment);
    setBookingCompleted(newAppointment);
    setPreviousBooking(newAppointment);

    // Open WhatsApp directly with notification to Katty (+34632892657)
    const waUrl = generateWhatsAppUrl(newAppointment, isMod);
    try {
      window.open(waUrl, "_blank");
    } catch {
      // If popup blocked, user has the direct button in confirmation
    }

    // Reset fields
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
  };

  const handleModifyAppointment = () => {
    if (bookingCompleted) {
      // Pre-fill fields with the appointment data for editing
      setName(bookingCompleted.clientName);
      setEmail(bookingCompleted.clientEmail);
      setPhone(bookingCompleted.clientPhone);
      setNotes(bookingCompleted.notes || "");
      setDate(bookingCompleted.date);
      setTime(bookingCompleted.time);
      setBoutique(bookingCompleted.boutique);

      // Notify modification to Katty's company WhatsApp
      const modifyWaUrl = generateWhatsAppUrl(
        {
          ...bookingCompleted,
          notes: `${bookingCompleted.notes || ""} (Solicita modificación)`
        },
        true
      );
      try {
        window.open(modifyWaUrl, "_blank");
      } catch {
        // Fallback
      }
    }
    setBookingCompleted(null);
  };

  return (
    <section id="boutiques" className="max-w-4xl mx-auto px-6 py-20">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-14">
        <div className="flex justify-center mb-2">
          <Logo variant="emblem" size="md" theme="gold" />
        </div>
        <span className="font-mono text-xs tracking-[0.3em] text-[#c5a880] uppercase font-medium">
          Demostración &amp; Asesoría Tecnológica
        </span>
        <h3 className="font-serif text-3xl md:text-5xl font-light tracking-wider text-[#0B192C]">
          Reserve su Demostración o Puesta a Punto
        </h3>
        <p className="font-sans text-xs md:text-sm font-light text-[#121212]/70 max-w-2xl mx-auto tracking-wide">
          Atención personalizada y demostraciones in situ en el corredor <strong className="font-medium text-[#0B192C]">Valdebebas · Sanchinarro · Las Tablas · Montecarmelo</strong> y toda la Comunidad de Madrid.
        </p>
        <div className="h-0.5 w-12 bg-[#c5a880]/40 mx-auto mt-4" />
      </div>

      <AnimatePresence mode="wait">
        {!bookingCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#FAF9F6] border border-[#c5a880]/20 rounded-sm overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12"
          >
            {/* Left side detail panel */}
            <div className="md:col-span-5 bg-[#0B192C] text-[#FAF9F6] p-8 md:p-10 flex flex-col justify-between space-y-8 relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=600')" }} />
              
              <div className="space-y-6 relative z-10">
                <h4 className="font-serif text-2xl font-light text-[#c5a880] tracking-wide">
                  Asesoría Tech Peludos &amp; Co
                </h4>
                <p className="text-xs font-light text-[#FAF9F6]/80 leading-relaxed tracking-wider">
                  Especialistas en lo último en tecnología y bienestar para perros y gatos. Le asesoramos y mostramos el funcionamiento de areneros inteligentes, arneses biométricos, puertas con microchip y robótica interactiva con servicio prioritario a domicilio en el corredor <span className="text-[#c5a880] font-medium">Valdebebas · Sanchinarro · Las Tablas · Montecarmelo</span>.
                </p>
                
                <div className="space-y-4 pt-4 border-t border-[#c5a880]/20 text-xs font-light">
                  <div className="flex items-start gap-3">
                    <Clock className="text-[#c5a880] shrink-0 mt-0.5" size={15} />
                    <div>
                      <p className="font-semibold uppercase text-[#c5a880]">Horario de Atención</p>
                      <p className="text-[11px] text-[#FAF9F6]/70 mt-1">Lunes a Sábado: 10:00 - 20:00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-[#c5a880]/15">
                    <Phone className="text-[#c5a880] shrink-0 mt-0.5" size={15} />
                    <div>
                      <p className="font-semibold uppercase text-[#c5a880]">Teléfono &amp; WhatsApp</p>
                      <a href="https://wa.me/34614704772" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#FAF9F6]/90 hover:text-[#c5a880] transition-colors mt-0.5 block font-mono">
                        +34 614 70 47 72
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-[#c5a880]/15">
                    <Mail className="text-[#c5a880] shrink-0 mt-0.5" size={15} />
                    <div>
                      <p className="font-semibold uppercase text-[#c5a880]">Email / Correo Electrónico</p>
                      <a 
                        href="mailto:peludosandcomp@gmail.com" 
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent("katty_open_email_modal"));
                        }}
                        className="text-[11px] text-[#FAF9F6]/90 hover:text-[#c5a880] transition-colors mt-0.5 block font-mono break-all cursor-pointer"
                        title="Escribir correo a peludosandcomp@gmail.com"
                      >
                        peludosandcomp@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-[#c5a880]/15">
                    <Share2 className="text-[#c5a880] shrink-0 mt-0.5" size={15} />
                    <div>
                      <p className="font-semibold uppercase text-[#c5a880]">Redes Sociales Oficiales</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <a 
                          href="https://www.instagram.com/peludos_company/?__pwa=1" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title="Instagram @peludos_company"
                          className="text-[11px] text-[#FAF9F6]/85 hover:text-[#c5a880] flex items-center gap-1 transition-colors"
                        >
                          <Instagram size={12} className="text-[#c5a880]" />
                          <span>Instagram</span>
                        </a>
                        <a 
                          href="https://www.tiktok.com/@peludosandcompany?lang=es" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title="TikTok @peludosandcompany"
                          className="text-[11px] text-[#FAF9F6]/85 hover:text-[#c5a880] flex items-center gap-1 transition-colors"
                        >
                          <Music2 size={12} className="text-[#c5a880]" />
                          <span>TikTok</span>
                        </a>
                        <a 
                          href="https://www.facebook.com/people/Peludosandcompany-Company/pfbid02vcq4aifLN8pjLcefCuJeMYmXQ6nYt28gRVYCdwFWjTMakzM6sLQYskvK2RvshbV4l/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title="Facebook Peludos & Co"
                          className="text-[11px] text-[#FAF9F6]/85 hover:text-[#c5a880] flex items-center gap-1 transition-colors"
                        >
                          <Facebook size={12} className="text-[#c5a880]" />
                          <span>Facebook</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#c5a880]/80 relative z-10 flex items-center gap-1.5">
                <MessageCircle size={12} className="text-[#25D366]" />
                <span>Asistencia personalizada opcional directa via Whatsapp.</span>
              </div>
            </div>

            {/* Right side form */}
            <form onSubmit={handleSubmit} className="md:col-span-7 p-8 md:p-10 space-y-6 bg-white">
              <div className="grid grid-cols-1 gap-5">
                
                {/* Modality / Boutique Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-[#121212]/70 font-semibold block">
                    SELECCIONE UNA MODALIDAD
                  </label>
                  <div className="relative">
                    <select
                      value={boutique}
                      onChange={(e) => setBoutique(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-3 px-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27] appearance-none cursor-pointer"
                    >
                      {MODALITY_OPTIONS.map((b, idx) => (
                        <option key={idx} value={b.name}>{b.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#c5a880]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* WhatsApp Quick Access Highlight if selected */}
                {isWhatsAppSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 bg-[#25D366]/10 border border-[#25D366]/30 rounded-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#128C7E] flex items-center gap-1.5">
                        <MessageCircle size={14} className="text-[#25D366]" />
                        Atención Inmediata por WhatsApp
                      </span>
                      <span className="text-[10px] font-mono text-[#128C7E] font-bold">+34 614 70 47 72</span>
                    </div>
                    <p className="text-[10px] text-[#121212]/70 leading-relaxed font-light">
                      Puede iniciar la conversación directamente haciendo clic en el botón inferior o completar el formulario para agendar una cita o consulta en fecha y hora específica.
                    </p>
                    <a
                      href="https://wa.me/34614704772?text=Hola%2C%20solicito%20asistencia%20personalizada%20con%20Peludos%20%26%20Co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 text-[11px] font-medium tracking-wider uppercase rounded-xs transition-colors shadow-xs mt-1"
                    >
                      <MessageCircle size={15} />
                      Abrir WhatsApp (+34 614 70 47 72)
                    </a>
                  </motion.div>
                )}

                {/* Home visit notice if selected */}
                {isHomeVisitSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[#c5a880]/10 border border-[#c5a880]/30 rounded-sm text-[11px] text-[#120002] leading-relaxed font-light space-y-1"
                  >
                    <p className="font-semibold text-[#8c1d27] uppercase text-[10px] tracking-wider">
                      Servicio Exclusivo a Domicilio
                    </p>
                    <p className="text-[10px] text-[#121212]/70">
                      Nuestras especialistas se desplazarán a su residencia con el muestrario seleccionado. Por favor, indique su dirección en las notas de contacto.
                    </p>
                  </motion.div>
                )}

                {/* Multi-Select Service Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] tracking-widest uppercase text-[#121212]/70 font-semibold flex items-center gap-1.5">
                      <Layers size={12} className="text-[#8c1d27]" />
                      Tipo de Consulta o Servicio (Selección Múltiple)
                    </label>
                    <button
                      type="button"
                      onClick={selectAllServices}
                      className="text-[10px] font-mono text-[#8c1d27] hover:underline cursor-pointer"
                    >
                      {selectedServices.length === SERVICES.length ? "Desmarcar todos" : "Seleccionar todos"}
                    </button>
                  </div>

                  {/* Collapsible / Interactive Dropdown Container */}
                  <div className="border border-[#c5a880]/30 rounded-sm bg-[#FAF9F6] p-3 space-y-2.5">
                    {/* Header trigger summary */}
                    <button
                      type="button"
                      onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                      className="w-full flex items-center justify-between text-left text-xs cursor-pointer py-0.5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#120002]">
                          {selectedServices.length} {selectedServices.length === 1 ? "sección seleccionada" : "secciones seleccionadas"}
                        </span>
                        <span className="text-[10px] text-[#8c1d27] bg-[#8c1d27]/10 px-2 py-0.5 rounded-full font-mono">
                          {selectedServices.length === SERVICES.length ? "Catálogo Completo" : "Colecciones Específicas"}
                        </span>
                      </div>
                      <div className="text-[#8c1d27] shrink-0 ml-2">
                        {isServiceDropdownOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>

                    {/* Quick selection chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#c5a880]/15">
                      {SERVICES.map((s) => {
                        const isChecked = selectedServices.includes(s);
                        const shortName = s.split(" ")[0];
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => toggleService(s)}
                            className={`text-[11px] px-2.5 py-1 rounded-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                              isChecked
                                ? "bg-[#8c1d27] text-white border-[#8c1d27] shadow-xs"
                                : "bg-white text-[#121212]/70 border-[#c5a880]/30 hover:border-[#8c1d27]"
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                              isChecked ? "border-white bg-white/20 text-white" : "border-stone-400 bg-white"
                            }`}>
                              {isChecked && <Check size={10} className="stroke-[3]" />}
                            </span>
                            <span>{shortName}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Expanded full options list */}
                    {isServiceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 space-y-1.5 border-t border-[#c5a880]/20 mt-2"
                      >
                        {SERVICES.map((s) => {
                          const isChecked = selectedServices.includes(s);
                          return (
                            <label
                              key={s}
                              onClick={() => toggleService(s)}
                              className="flex items-center gap-2.5 p-2 bg-white hover:bg-[#c5a880]/10 rounded-xs cursor-pointer text-xs transition-colors border border-[#c5a880]/15"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by label click
                                className="w-3.5 h-3.5 accent-[#8c1d27] cursor-pointer rounded-xs"
                              />
                              <span className={`text-xs ${isChecked ? "font-medium text-[#8c1d27]" : "text-[#121212]/80"}`}>
                                {s}
                              </span>
                            </label>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Date & Time Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest uppercase text-[#121212]/50 font-semibold block">Fecha Preferida</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-3 px-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest uppercase text-[#121212]/50 font-semibold block">Hora del Encuentro</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-3 px-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27] cursor-pointer"
                    >
                      {AVAILABLE_TIMES.map((t, idx) => (
                        <option key={idx} value={t}>{t} hs</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="h-px bg-[#c5a880]/15 my-1" />

                {/* Personal Details */}
                <div className="space-y-4">
                  <label className="text-[10px] tracking-widest uppercase text-[#121212]/50 font-semibold block">Datos de Contacto Privados</label>
                  
                  {/* Name */}
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-[#c5a880]">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      value={name}
                      required
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-3 pl-10 pr-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[#c5a880]">
                        <Mail size={14} />
                      </span>
                      <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-3 pl-10 pr-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27]"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-[#c5a880]">
                        <Phone size={14} />
                      </span>
                      <input
                        type="tel"
                        placeholder="Teléfono de Contacto"
                        value={phone}
                        required
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-3 pl-10 pr-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27]"
                      />
                    </div>
                  </div>

                  {/* Notes / Requests */}
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[#c5a880]">
                      <FileText size={14} />
                    </span>
                    <textarea
                      placeholder={
                        isHomeVisitSelected
                          ? "Indique la dirección de su domicilio, piso, código postal y detalles de acceso..."
                          : "Peticiones particulares, piezas de interés o notas de protocolo..."
                      }
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#c5a880]/30 rounded-sm py-2.5 pl-10 pr-4 text-xs text-[#121212] focus:outline-none focus:border-[#8c1d27]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#120002] hover:bg-[#8c1d27] text-white py-4 text-xs font-light tracking-[0.25em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 shadow"
                >
                  Confirmar Reserva de Cita
                  <ArrowRight size={14} />
                </button>

              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#c5a880] p-8 md:p-12 text-center rounded-sm max-w-xl mx-auto space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Elegant watermark */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-[#c5a880]/10 flex items-center justify-center text-stone-100 font-serif text-9xl">P</div>

            <div className="w-16 h-16 bg-[#c5a880]/10 border border-[#c5a880] rounded-full flex items-center justify-center mx-auto text-[#0B192C]">
              <CheckCircle size={32} />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[9px] tracking-[0.3em] text-[#c5a880] uppercase font-medium">Reserva Formalizada</span>
              <h4 className="font-serif text-3xl font-light text-[#0B192C]">¡Su cita ha sido Agendada!</h4>
              <p className="text-xs font-light text-[#121212]/70 max-w-md mx-auto leading-relaxed">
                Le agradecemos su confianza en Peludos &amp; Co. Hemos reservado un espacio de atención prioritaria para usted y su mascota. Nos pondremos en contacto vía WhatsApp (+34 614 70 47 72) para ultimar los detalles.
              </p>
            </div>

            {/* Boarding pass summary */}
            <div className="bg-[#FAF9F6] border border-[#c5a880]/20 p-4 text-left text-xs space-y-3 font-light tracking-wide rounded-sm">
              <div className="flex justify-between border-b border-[#c5a880]/15 pb-2 text-[10px] tracking-widest text-[#121212]/50 uppercase font-semibold">
                <span>Resumen de la Cita</span>
                <span className="text-[#0B192C]">Peludos &amp; Co</span>
              </div>
              <div>
                <span className="text-[#121212]/50 block text-[9px] uppercase">Servicio</span>
                <span className="font-medium text-[#120002]">{bookingCompleted.service}</span>
              </div>
              <div>
                <span className="text-[#121212]/50 block text-[9px] uppercase">Modalidad / Ubicación</span>
                <span className="font-medium text-[#120002]">{bookingCompleted.boutique}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#c5a880]/15 pt-2">
                <div>
                  <span className="text-[#121212]/50 block text-[9px] uppercase">Fecha</span>
                  <span className="font-semibold text-[#8c1d27]">{bookingCompleted.date}</span>
                </div>
                <div>
                  <span className="text-[#121212]/50 block text-[9px] uppercase">Hora</span>
                  <span className="font-semibold text-[#8c1d27]">{bookingCompleted.time} hs</span>
                </div>
              </div>
            </div>

            {/* Status confirmation note */}
            <div className="pt-2 text-[11px] text-[#121212]/50 font-light tracking-wide">
              Los detalles de su encuentro han sido registrados en nuestro sistema de atención privada.
            </div>

            <button
              onClick={handleModifyAppointment}
              className="border border-[#c5a880] text-[#120002] hover:bg-[#FAF9F6] transition-colors py-3 px-8 text-xs font-light tracking-widest uppercase cursor-pointer block mx-auto mt-2"
            >
              Agendar otra Cita o Modificar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
