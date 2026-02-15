const express = require("express");
const router = express.Router();

// POST /api/sales-ai/session
router.post("/session", async (req, res) => {
  try {
    // TODO: replace with your real session creation logic
    return res.status(200).json({
      ok: true,
      message: "sales-ai session endpoint is live",
      received: req.body ?? null,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
});

module.exports = router;
