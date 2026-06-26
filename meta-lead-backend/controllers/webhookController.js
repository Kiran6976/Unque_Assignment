exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(`[Webhook] Verification — mode: ${mode}, token: ${token}`);

  if (
    mode === "subscribe" &&
    token === process.env.META_VERIFY_TOKEN   // ✅ Fixed: was VERIFY_TOKEN
  ) {
    console.log("[Webhook] ✅ Verified successfully");
    return res.status(200).send(challenge);
  }

  console.warn("[Webhook] ❌ Verification failed — token mismatch");
  console.warn(`Expected: ${process.env.META_VERIFY_TOKEN}, Got: ${token}`);
  return res.sendStatus(403);
};

exports.receiveLead = (req, res) => {
  const io = req.app.get("io");

  // Always respond quickly so Meta doesn't retry
  res.status(200).send("EVENT_RECEIVED");

  console.log("[Webhook] 📩 Lead payload received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const body = req.body;

    if (body.object !== "page") return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "leadgen") continue;

        const { leadgen_id, page_id, form_id, created_time } = change.value;

        const leadData = {
          id: leadgen_id || Date.now().toString(),
          pageId: page_id,
          formId: form_id,
          adName: "Meta Lead Ad",
          name: `Lead #${String(leadgen_id).slice(-5)}`,
          email: "",
          phone: "",
          city: "",
          createdAt: created_time
            ? new Date(created_time * 1000).toISOString()
            : new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          isTest: false,
        };

        console.log("[Webhook] ✅ Emitting lead via Socket.IO:", leadData.name);
        io.emit("newLead", leadData);
      }
    }
  } catch (err) {
    console.error("[Webhook] Error processing lead:", err.message);
  }
};