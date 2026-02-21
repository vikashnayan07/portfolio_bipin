/**
 * CRA Development Proxy
 *
 * Makes /api/send-reply work locally by loading the Vercel serverless
 * function directly into CRA's webpack-dev-server.
 * In production (Vercel), this file is ignored — Vercel uses api/ directly.
 */
const path = require("path");

module.exports = function (app) {
  /* ── Load env vars so the serverless function can read them ── */
  try {
    require("dotenv").config({
      path: path.resolve(__dirname, "../.env"),
    });
  } catch {
    // dotenv may not be installed — env vars must be set some other way
  }

  /* ── JSON body parser (express.json is available via CRA's express) ── */
  const express = require("express");
  app.use("/api", express.json());

  /* ── Mount the serverless function ── */
  app.post("/api/send-reply", async (req, res) => {
    try {
      const handler = require("../api/send-reply");
      await handler(req, res);
    } catch (err) {
      console.error("Dev proxy error:", err);
      res.status(500).json({ error: err.message });
    }
  });
};
