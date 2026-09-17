import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
// Safe loader for product catalog data (avoids native ESM file extension resolution issues)
function getProducts(): any[] {
  try {
    const candidates = [
      path.join(process.cwd(), "src", "data", "products.json"),
      path.join(process.cwd(), "public", "products.json"),
      path.join(process.cwd(), "dist", "products.json"),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error("Error reading products.json:", err);
  }
  return [];
}

// Load environment variables from .env.local (preferred for local development) and .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
dotenv.config();

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const PRODUCTS = getProducts();

async function startServer() {
  const app = express();

  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");

  app.use(express.json({ limit: "30mb" }));

  // Health check endpoint for Cloud Run and monitoring
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Endpoint to upload a slide hero image
  app.post("/api/upload-hero-image", (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "No se proporcionó imagen" });
      }
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      
      const targetName = filename || "katty-prive-concierge.jpg";
      const publicPath = path.join(process.cwd(), "public", "images", targetName);
      const distPath = path.join(process.cwd(), "dist", "images", targetName);
      
      fs.mkdirSync(path.dirname(publicPath), { recursive: true });
      fs.writeFileSync(publicPath, buffer);
      
      try {
        if (fs.existsSync(path.dirname(distPath))) {
          fs.writeFileSync(distPath, buffer);
        }
      } catch (_) {}
      
      console.log(`[Upload] Image successfully written to ${publicPath}`);
      res.json({ success: true, url: `/images/${targetName}?t=${Date.now()}` });
    } catch (err: any) {
      console.error("[Upload] Error writing image:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to fetch products
  app.get("/api/products", (req, res) => {
    res.json(getProducts());
  });

  // AI Gifting Concierge / Assistant Endpoint
  app.post("/api/gift-consultant", async (req, res) => {
    try {
      const { message, chatHistory, preferences } = req.body;

      const ai = getGenAI();
      if (!ai) {
        return res.json({
          text: "Bienvenido a Peludos & Co. En este momento nuestra consejería virtual se encuentra en modo catálogo. Por favor, explore nuestros productos y servicios o contáctenos por WhatsApp (+34 614 70 47 72) para una atención personalizada.",
        });
      }

      // Build conversation context
      const initialInstruction = `Eres la "Consejera y Asesora de Bienestar de Peludos & Co", una especialista en cuidado, nutrición, confort, higiene y estilismo de mascotas de alta calidad (perros y gatos).
Tu tono de voz es cálido, profesional, respetuoso, empático y afectuoso con los animales y sus familias.
Te diriges a quien te consulta con amabilidad y dedicación ("Estimada familia", "Estimado amante de los animales", "Bienvenido a Peludos & Co").

Tu misión es aconsejar y guiar a cada cliente para encontrar el mejor cuidado, producto, accesorio o atención especializada para su perro o gato en Peludos & Co.
Puedes orientar sobre cuidados del pelaje, accesorios de paseo y descanso, higiene de calidad y cómo concertar una cita personalizada o a domicilio.

Teléfono y WhatsApp de contacto directo: +34 614 70 47 72.
Correo electrónico: peludosandcomp@gmail.com.
Atención directa online y a domicilio (sin dirección fiscal física abierta al público por el momento).

Aquí tienes la base de productos y servicios disponibles:
${JSON.stringify(PRODUCTS, null, 2)}

Directrices:
1. Responde SIEMPRE en español con cercanía, profesionalidad y afecto por los animales.
2. Si el cliente menciona necesidades específicas para su perro o gato (raza, edad, necesidades de pelaje, accesorios o cuidados), proporciona sugerencias claras y adaptadas.
3. Recomienda productos o servicios específicos de la lista anterior cuando sea oportuno.
4. Mantén las respuestas claras, amables y de extensión adecuada (máximo 3 párrafos).
5. Siempre menciona con gentileza que pueden escribir al WhatsApp +34 614 70 47 72 para cualquier cita o consulta inmediata.`;

      // Format chat history for Gemini
      const formattedContents = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const item of chatHistory) {
          formattedContents.push({
            role: item.sender === "user" ? "user" : "model",
            parts: [{ text: item.text }]
          });
        }
      }
      
      // Add current user preferences to prompt helper if available
      let currentPrompt = message;
      if (preferences) {
        const { category, recipient, occasion, budget } = preferences;
        currentPrompt = `[Preferencias actuales del cliente - Categoría: ${category || "Cualquiera"}, Destinatario: ${recipient || "No especificado"}, Ocasión: ${occasion || "No especificada"}, Presupuesto aproximado: ${budget ? budget + "€" : "Sin límite"}]. 

Mensaje del cliente: ${message}`;
      }

      formattedContents.push({
        role: "user",
        parts: [{ text: currentPrompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: formattedContents,
        config: {
          systemInstruction: initialInstruction,
          temperature: 0.7,
        }
      });

      res.json({
        text: response.text || "Disculpe, mi estimado cliente, he tenido un momento de distracción. ¿Podría repetirme su deseo?",
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: "Ocurrió un error al procesar su solicitud. Por favor, intente de nuevo.",
        details: error.message
      });
    }
  });

  // Serve public directory statically if it exists
  const publicPath = path.join(process.cwd(), "public");
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  // Serve static assets in production, otherwise mount Vite in development
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Endpoint not found" });
      }
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application build not found");
      }
    });
  }

  const PORT = 3000;
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Katty Privé server running on http://0.0.0.0:${PORT}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing HTTP server gracefully");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
