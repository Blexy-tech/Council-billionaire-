// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var isProduction = process.env.NODE_ENV === "production";
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json());
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
app.get("/api/download-source", (req, res) => {
  const zipPath = path.resolve(__dirname, "app-source.zip");
  try {
    if (!fs.existsSync(zipPath)) {
      execSync(`python3 -c "import os, zipfile; zip_path = 'app-source.zip'; with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf: for root, dirs, files in os.walk('.'): dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', '.gemini']]; for file in files: if file == 'app-source.zip': continue; filepath = os.path.join(root, file); zipf.write(filepath, os.path.relpath(filepath, '.'))"`, { cwd: __dirname });
    }
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="council-app-source.zip"');
    res.download(zipPath, "council-app-source.zip", (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: "Failed to send ZIP file" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate source archive: " + err.message });
  }
});
async function startServer() {
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  let memoryAccessRequests = [
    {
      id: "req-1",
      full_name: "Dr. Helena Vance",
      business_email: "h.vance@apexmobility.com",
      company: "Apex Mobility",
      job_title: "Chief Operating Officer",
      website: "https://apexmobility.com",
      company_size: "1000+",
      business_problem: "Managing 14,200 transit assets and requiring unified risk intelligence.",
      phone: "+1 (555) 382-9100",
      status: "active",
      tier: "enterprise",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  const personalEmailDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
    "live.com",
    "msn.com",
    "mail.com",
    "zoho.com",
    "proton.me",
    "protonmail.com",
    "ymail.com"
  ];
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  app.post("/api/access/request", async (req, res) => {
    try {
      const { full_name, business_email, company, job_title, website, company_size, business_problem, phone, tier, payment_code, company_valuation, net_worth } = req.body;
      if (!full_name || !business_email || !company || !job_title || !website || !company_size || !business_problem) {
        return res.status(400).json({ error: "All required fields must be completed." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(business_email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }
      const emailLower = business_email.toLowerCase().trim();
      const emailDomain = emailLower.split("@")[1];
      const isTestEmail = !isProduction && emailLower === "test@example.com";
      if (!isTestEmail && (!emailDomain || personalEmailDomains.includes(emailDomain))) {
        return res.status(400).json({ error: "Please use your business email." });
      }
      const newRequest = {
        id: "req-" + Math.random().toString(36).substring(7),
        full_name: full_name.trim(),
        business_email: business_email.trim(),
        company: company.trim(),
        job_title: job_title.trim(),
        website: website.trim(),
        company_size: company_size.trim(),
        business_problem: business_problem.trim(),
        phone: phone ? phone.trim() : "",
        tier: tier || "starter",
        payment_code: payment_code ? payment_code.trim() : null,
        company_valuation: company_valuation ? company_valuation.trim() : null,
        net_worth: net_worth ? net_worth.trim() : null,
        status: "pending_verification",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      memoryAccessRequests.unshift(newRequest);
      res.json({
        success: true,
        message: "Application recorded. Verification pending.",
        request: newRequest
      });
    } catch (err) {
      res.status(500).json({ error: "APPLICATION COULD NOT BE SUBMITTED. Please try again." });
    }
  });
  app.get("/api/access/requests", (req, res) => {
    res.json({ requests: memoryAccessRequests, databaseConfigured: hasSupabase, isProduction });
  });
  let customerMetricsStore = {
    "org-1": [
      { id: "m-1", metric: "Active Transit Units", value: "14,200", change: "+2.4%", status: "nominal" },
      { id: "m-2", metric: "Telemetry Latency", value: "42ms", change: "-5ms", status: "optimal" },
      { id: "m-3", metric: "Financial Exposure Risk", value: "$1.42M", change: "-12.8%", status: "warning" },
      { id: "m-4", metric: "Security Incident Index", value: "0.00%", change: "0%", status: "secure" }
    ]
  };
  app.get("/api/customer/metrics/:orgId", (req, res) => {
    const { orgId } = req.params;
    const metrics = customerMetricsStore[orgId] || customerMetricsStore["org-1"];
    res.json({ metrics });
  });
  app.post("/api/csv/upload", (req, res) => {
    try {
      const { csvData, organizationId } = req.body;
      const orgId = organizationId || "org-1";
      const lines = csvData ? csvData.split("\n").filter(Boolean) : [];
      const newMetrics = lines.map((line, idx) => {
        const parts = line.split(",");
        return {
          id: "imported-" + idx,
          metric: parts[0]?.trim() || `Metric ${idx + 1}`,
          value: parts[1]?.trim() || "N/A",
          change: parts[2]?.trim() || "0%",
          status: "nominal"
        };
      });
      if (newMetrics.length > 0) {
        customerMetricsStore[orgId] = newMetrics;
      }
      res.json({
        success: true,
        message: `Successfully processed and imported ${newMetrics.length} metrics records.`,
        metrics: customerMetricsStore[orgId]
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to process CSV upload: " + err.message });
    }
  });
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!ai) {
        return res.json({
          response: {
            fact: "DEMO MODE: Gemini API key not configured. Displaying simulated executive analysis.",
            inference: "Operating in offline simulation model with high confidence baseline.",
            hypothesis: "System signals remain stable under current simulated thresholds.",
            missingEvidence: "Live telemetry feed and cloud infrastructure logs not connected.",
            recommendation: "Configure GEMINI_API_KEY in environment or AI Studio secrets for live AI intelligence.",
            confidence: "85%",
            sources: ["SIMULATED INTERNAL TELEMETRY", "HISTORICAL BASELINE"]
          }
        });
      }
      const model = "gemini-2.5-flash";
      const systemInstruction = `You are COUNCIL AI, an elite B2B executive intelligence platform.
Core promise: 'See operational problems, financial exposure and unusual business signals before they become expensive.'`;
      const response = await ai.models.generateContent({
        model,
        contents: [prompt],
        config: { systemInstruction, temperature: 0.2 }
      });
      res.json({ result: response.text });
    } catch (error) {
      res.status(500).json({ error: error.message || "AI processing error" });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "operational",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      aiEnabled: !!ai,
      supabaseConfigured: hasSupabase,
      isProduction
    });
  });
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`COUNCIL operating system running on port ${PORT} (${isProduction ? "Production" : "Development"})`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
