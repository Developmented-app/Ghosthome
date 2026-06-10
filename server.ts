import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the standard @google/genai SDK on the server with User-Agent custom header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Stay Recommendations using Gemini AI (3.5-flash)
  app.post("/api/recommend-stay", async (req, res) => {
    try {
      const { guestName, guestHistory, crmNotes, rooms } = req.body;

      if (!guestName) {
        return res.status(400).json({ error: "Missing guestName configuration." });
      }

      // Filter rooms that represent upgrade opportunities (different/VIP/premium classes)
      const roomSummary = rooms ? rooms.map((r: any) => ({
        type: r.type,
        floor: r.floor,
        capacity: r.capacity,
        daily_price: r.daily_price,
        status: r.status
      })) : [];

      const prompt = `
You are Sorya Guesthouse's premium digital AI Concierge.
Please review the guest's profile, stay history, and internal CRM logs, then formulate a personalized room upgrade choice from Sorya's catalog.

Guest Name: ${guestName}
Guest Chronicle/History: ${guestHistory || "No historical stays logged yet."}
Special CRM Incident, Request, & Complaint logs for this guest:
${JSON.stringify(crmNotes || [])}

Sorya Guesthouse Room Offerings Catalog:
${JSON.stringify(roomSummary)}

Recommendations Criteria:
1. Suggest exactly ONE premium room type that fits this guest's behavior or resolves their past concerns (e.g. if they had Wi-Fi issues on the 1st floor, recommend a 2nd floor double VIP or penthouse President with a high-capacity Dedicated Fiber AP; if they prefer tranquility, suggest a higher floor deluxe suite).
2. Formulate a personalized, charming, but highly professional argument. Address them directly by name.
3. Suggest a creative, non-mock checkout upgrade rate or highlight a complimentary benefit (e.g., free full breakfast, spa coupon, complimentary organic tea).

Format the output strictly as a single JSON object with the exact keys:
- recommendedRoomType (string, e.g., 'Double VIP' or 'Penthouse President' or 'Family Suite')
- reasoning (string, direct concierge response addressing the guest SoC)
- upgradeIncentive (string, special incentive value and details, e.g. "We are waiving 15% of the standard delta price as a special return of trust")
- poeticVibe (string, single atmospheric sentence describing the stay mood)
- priorityBulletpoints (array of exactly 3 strings, showcasing benefits of the upgrade)
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedRoomType: {
                type: Type.STRING
              },
              reasoning: {
                type: Type.STRING
              },
              upgradeIncentive: {
                type: Type.STRING
              },
              poeticVibe: {
                type: Type.STRING
              },
              priorityBulletpoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["recommendedRoomType", "reasoning", "upgradeIncentive", "poeticVibe", "priorityBulletpoints"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("concierge received an empty stream.");
      }

      const recommendation = JSON.parse(responseText.trim());
      res.json({ success: true, recommendation });
    } catch (error: any) {
      console.error("AI Upgrade Error:", error);
      res.status(500).json({
        success: false,
        error: "Our digital AI concierge is nesting momentarily. Please browse Sorya's direct catalogs!",
        details: error?.message || ""
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
