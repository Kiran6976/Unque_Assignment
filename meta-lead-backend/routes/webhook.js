const express = require("express");

const {
  verifyWebhook,
  receiveLead,
} = require("../controllers/webhookController");

const router = express.Router();

router.get("/", verifyWebhook);

router.post("/", receiveLead);

module.exports = router;