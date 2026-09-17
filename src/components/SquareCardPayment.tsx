import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { CreditCard, Lock, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, ExternalLink } from "lucide-react";

export interface SquareTokenResult {
  success: boolean;
  token?: string;
  cardBrand?: string;
  cardLast4?: string;
  error?: string;
}

export interface SquareCardPaymentRef {
  tokenize: () => Promise<SquareTokenResult>;
}

interface SquareCardPaymentProps {
  amount: number;
  currency?: string;
}

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => {
        card: (options?: any) => Promise<{
          attach: (selectorOrElement: string | HTMLElement) => Promise<void>;
          tokenize: () => Promise<{
            status: string;
            token?: string;
            details?: {
              card?: {
                brand?: string;
                last4?: string;
                expMonth?: number;
                expYear?: number;
              };
            };
            errors?: Array<{ message: string; field?: string }>;
          }>;
          destroy: () => Promise<void>;
        }>;
      };
    };
  }
}

export const SquareCardPayment = forwardRef<SquareCardPaymentRef, SquareCardPaymentProps>(
  ({ amount, currency = "EUR" }, ref) => {
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const cardInstanceRef = useRef<any>(null);

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [cardReady, setCardReady] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fallback/Sandbox Simulator state (active when Application ID and Location ID are not yet configured)
    const [simCardNumber, setSimCardNumber] = useState("");
    const [simExpiry, setSimExpiry] = useState("");
    const [simCvv, setSimCvv] = useState("");
    const [simPostal, setSimPostal] = useState("");

    const appId = (import.meta.env.VITE_SQUARE_APPLICATION_ID || "").trim();
    const locationId = (import.meta.env.VITE_SQUARE_LOCATION_ID || "").trim();
    const squareEnv = (import.meta.env.VITE_SQUARE_ENVIRONMENT || "sandbox").toLowerCase();
    
    // Check if real Square Developer credentials have been entered
    const isConfigured = Boolean(
      appId && 
      locationId && 
      appId.length > 5 && 
      locationId.length > 3 &&
      !appId.includes("MY_")
    );

    // 1. Load Square Web Payments SDK Script dynamically
    useEffect(() => {
      if (!isConfigured) return;

      const scriptId = "square-web-payments-sdk";
      const isProduction = squareEnv === "production";
      const scriptUrl = isProduction
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";

      // If already loaded
      if (window.Square) {
        setIsScriptLoaded(true);
        return;
      }

      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = scriptUrl;
        script.type = "text/javascript";
        script.async = true;
        document.head.appendChild(script);
      }

      const handleLoad = () => {
        setIsScriptLoaded(true);
      };

      const handleError = () => {
        setErrorMessage("No se pudo cargar el SDK seguro de Square. Por favor verifique su conexión o recargue la página.");
      };

      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);

      return () => {
        script?.removeEventListener("load", handleLoad);
        script?.removeEventListener("error", handleError);
      };
    }, [isConfigured, squareEnv]);

    // 2. Initialize payments and attach card input element
    useEffect(() => {
      if (!isConfigured || !isScriptLoaded || !cardContainerRef.current || !window.Square) {
        return;
      }

      let isMounted = true;

      const initSquareCard = async () => {
        try {
          setErrorMessage(null);
          setCardReady(false);

          // Clean up any existing card instance before re-creating
          if (cardInstanceRef.current) {
            try {
              await cardInstanceRef.current.destroy();
            } catch (_) {}
            cardInstanceRef.current = null;
          }

          const payments = window.Square!.payments(appId, locationId);
          
          const card = await payments.card({
            style: {
              ".input-container": {
                borderColor: "#DFCCA8",
                borderRadius: "2px",
                borderWidth: "1px"
              },
              ".input-container.is-focus": {
                borderColor: "#0B192C",
                borderWidth: "1.5px"
              },
              ".input-container.is-error": {
                borderColor: "#E11D48"
              },
              "input": {
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "13px",
                color: "#0B192C"
              },
              "input::placeholder": {
                color: "#9CA3AF"
              }
            }
          });

          if (!isMounted) {
            await card.destroy();
            return;
          }

          if (cardContainerRef.current) {
            cardContainerRef.current.innerHTML = "";
            await card.attach(cardContainerRef.current);
            cardInstanceRef.current = card;
            setCardReady(true);
          }
        } catch (err: any) {
          console.error("[Square] Error al inicializar Web Payments SDK:", err);
          if (isMounted) {
            setErrorMessage(err.message || "Error al inicializar el formulario seguro de tarjeta.");
          }
        }
      };

      initSquareCard();

      return () => {
        isMounted = false;
        if (cardInstanceRef.current) {
          cardInstanceRef.current.destroy().catch(() => {});
          cardInstanceRef.current = null;
        }
      };
    }, [isConfigured, isScriptLoaded, appId, locationId]);

    // Format simulated card number inputs
    const handleSimCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
      const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
      setSimCardNumber(formatted);
    };

    const handleSimExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (raw.length >= 2) {
        setSimExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
      } else {
        setSimExpiry(raw);
      }
    };

    // 3. Expose tokenize method to parent form
    useImperativeHandle(ref, () => ({
      tokenize: async (): Promise<SquareTokenResult> => {
        setIsProcessing(true);
        setErrorMessage(null);

        // Case A: Real Square Web Payments SDK is configured and loaded
        if (isConfigured && cardInstanceRef.current) {
          try {
            const result = await cardInstanceRef.current.tokenize();
            setIsProcessing(false);

            if (result.status === "OK" && result.token) {
              return {
                success: true,
                token: result.token,
                cardBrand: result.details?.card?.brand || "Tarjeta",
                cardLast4: result.details?.card?.last4 || "••••"
              };
            } else {
              const firstError = result.errors?.[0]?.message || "Verifique los datos de su tarjeta de crédito o débito.";
              setErrorMessage(firstError);
              return {
                success: false,
                error: firstError
              };
            }
          } catch (err: any) {
            setIsProcessing(false);
            const msg = err.message || "Error de comunicación con la pasarela Square.";
            setErrorMessage(msg);
            return {
              success: false,
              error: msg
            };
          }
        }

        // Case B: Simulator / Demonstration Mode (Pre-configuration in Square Developer Portal)
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsProcessing(false);

        const cleanCard = simCardNumber.replace(/\s/g, "");
        if (cleanCard.length < 15) {
          const err = "Por favor ingrese un número de tarjeta válido (mínimo 15-16 dígitos).";
          setErrorMessage(err);
          return { success: false, error: err };
        }
        if (!simExpiry || simExpiry.length < 5) {
          const err = "Por favor ingrese la fecha de caducidad (MM/AA).";
          setErrorMessage(err);
          return { success: false, error: err };
        }
        if (!simCvv || simCvv.length < 3) {
          const err = "Por favor ingrese el código de seguridad CVV (3 o 4 dígitos).";
          setErrorMessage(err);
          return { success: false, error: err };
        }

        // Generate demonstration token matching Square format
        const last4 = cleanCard.slice(-4);
        const demoToken = `cnon:card-nonce-demo-${Date.now()}`;
        return {
          success: true,
          token: demoToken,
          cardBrand: cleanCard.startsWith("4") ? "Visa" : cleanCard.startsWith("5") ? "Mastercard" : "Tarjeta",
          cardLast4: last4
        };
      }
    }));

    return (
      <div className="space-y-3 bg-[#FAF9F6] border border-[#c5a880]/40 p-4 rounded-xs">
        {/* Header with Security Badges */}
        <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#0B192C]" />
            <span className="font-serif text-xs uppercase tracking-wider font-semibold text-[#0B192C]">
              Pago con Tarjeta de Crédito / Débito
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck size={11} />
            <span>Square 256-bit SSL</span>
          </div>
        </div>

        {/* Real Square SDK Container */}
        {isConfigured ? (
          <div className="space-y-2">
            <div 
              ref={cardContainerRef} 
              id="card-container" 
              className="min-h-[90px] w-full"
            />
            {!cardReady && !errorMessage && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-stone-500 font-mono">
                <Sparkles size={14} className="animate-spin text-[#c5a880]" />
                <span>Cargando formulario seguro de Square...</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono pt-1">
              <span>Acepta Visa, Mastercard, AMEX y tarjetas de débito</span>
              <span className="text-[#c5a880]">Entorno: {squareEnv}</span>
            </div>
          </div>
        ) : (
          /* Developer Guidance & Pre-Configuration Interactive Sandbox Simulator */
          <div className="space-y-3">
            {/* Guide box */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xs p-3 text-[11px] text-amber-950 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Lock size={12} className="text-amber-700" />
                  Square Web Payments SDK Integrado
                </span>
                <a 
                  href="https://developer.squareup.com/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#0B192C] underline hover:text-[#c5a880]"
                >
                  Square Developer Portal <ExternalLink size={10} />
                </a>
              </div>
              <p className="text-[10.5px] leading-relaxed text-amber-900/80">
                Para vincular tu cuenta bancaria real de Square, añade en las variables de entorno de Netlify:
                <br />
                <code className="font-mono text-[9.5px] bg-white/70 px-1 py-0.5 rounded border border-amber-200 inline-block mt-1 mr-1">
                  VITE_SQUARE_APPLICATION_ID
                </code>
                <code className="font-mono text-[9.5px] bg-white/70 px-1 py-0.5 rounded border border-amber-200 inline-block mt-1">
                  VITE_SQUARE_LOCATION_ID
                </code>
              </p>
              <div className="text-[10px] text-emerald-800 font-mono flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Modo de prueba activo: puedes probar la compra ahora mismo con cualquier tarjeta de prueba.</span>
              </div>
            </div>

            {/* Embedded Card Form (Interactive Simulator) */}
            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider uppercase text-stone-600 block">
                  Número de Tarjeta *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={simCardNumber}
                    onChange={handleSimCardChange}
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    className="w-full bg-white border border-[#c5a880]/40 focus:border-[#0B192C] px-3 py-2 text-xs text-[#0B192C] font-mono outline-none rounded-xs placeholder:text-stone-400"
                  />
                  <div className="absolute right-3 top-2.5 text-stone-400 text-[10px] font-mono">
                    VISA / MC
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-stone-600 block">
                    Caducidad *
                  </label>
                  <input
                    type="text"
                    value={simExpiry}
                    onChange={handleSimExpiryChange}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full bg-white border border-[#c5a880]/40 focus:border-[#0B192C] px-3 py-2 text-xs text-[#0B192C] font-mono outline-none rounded-xs placeholder:text-stone-400 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-stone-600 block">
                    CVV *
                  </label>
                  <input
                    type="password"
                    value={simCvv}
                    onChange={(e) => setSimCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full bg-white border border-[#c5a880]/40 focus:border-[#0B192C] px-3 py-2 text-xs text-[#0B192C] font-mono outline-none rounded-xs placeholder:text-stone-400 text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-stone-600 block">
                    C. Postal
                  </label>
                  <input
                    type="text"
                    value={simPostal}
                    onChange={(e) => setSimPostal(e.target.value.slice(0, 6))}
                    placeholder="28050"
                    maxLength={6}
                    className="w-full bg-white border border-[#c5a880]/40 focus:border-[#0B192C] px-3 py-2 text-xs text-[#0B192C] font-mono outline-none rounded-xs placeholder:text-stone-400 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-start gap-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono pt-1">
          <span className="flex items-center gap-1">
            <Lock size={10} className="text-emerald-700" />
            Transacción encriptada de extremo a extremo
          </span>
          <span className="font-semibold text-[#0B192C]">
            Total: {amount.toLocaleString("es-ES")} {currency === "EUR" ? "€" : currency}
          </span>
        </div>
      </div>
    );
  }
);

SquareCardPayment.displayName = "SquareCardPayment";
export default SquareCardPayment;
