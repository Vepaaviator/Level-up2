import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Telegram notification
  app.post("/api/telegram/send", async (req, res) => {
    const { text, parse_mode, disable_web_page_preview } = req.body;

    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram Bot Token or Chat ID is not configured on the server.");
      return res.status(500).json({
        success: false,
        message: "Telegram Bot Token or Chat ID is not configured on the server."
      });
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parse_mode || "HTML",
          disable_web_page_preview: disable_web_page_preview ?? true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram API response error on server:", errorText);
        return res.status(response.status).json({
          success: false,
          message: `Telegram API error: ${errorText}`,
        });
      }

      const data = await response.json();
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("Server error sending telegram notification:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  });

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Serve app using Vite middleware in development or static server in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
