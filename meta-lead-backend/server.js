require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const webhookRoutes = require("./routes/webhook");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

app.use("/webhook", webhookRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Meta Leads Server", clients: io.engine.clientsCount });
});

// ── Test lead endpoint (simulate without Meta) ────────────────────────────────
app.post("/test-lead", (req, res) => {
  const names = ["Priya Sharma", "Rahul Mehta", "Anjali Singh", "Arjun Patel", "Neha Gupta"];
  const randomName = names[Math.floor(Math.random() * names.length)];

  const lead = {
    id: `test_${Date.now()}`,
    pageId: "test_page",
    formId: "test_form",
    adName: "Test Lead Ad",
    name: req.body.name || randomName,
    email: req.body.email || `${randomName.split(" ")[0].toLowerCase()}@example.com`,
    phone: req.body.phone || "+91 98765 43210",
    city: req.body.city || "Mumbai",
    createdAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    isTest: true,
  };

  io.emit("newLead", lead);
  console.log("[Test] 🧪 Test lead emitted:", lead.name);
  res.json({ success: true, lead });
});


io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});