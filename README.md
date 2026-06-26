# Meta Lead Ads + React Native — Real-Time PoC

A working Proof of Concept (PoC) that demonstrates real-time ingestion of Meta Lead Ads and instant delivery to a React Native (Expo) mobile application using Webhooks and WebSockets (Socket.IO).

---

## 🎬 In Action (Real-Time Architecture)

When a lead is submitted, it travels through the following path to arrive on the mobile device in under a second—without any manual pull-to-refresh:

```
                  ┌───────────────────────────────────────────┐
                  │          Meta Lead Ads webhook            │
                  │       (or simulate-webhook.js script)     │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        │ HTTP POST /webhook
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │    Node.js Backend (Express server)       │
                  │   - Parses lead gen ID                    │
                  │   - Fetches full details via Graph API   │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        │ Socket.IO (io.emit("newLead"))
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │          React Native (Expo) App          │
                  │   - Subscribed to real-time events        │
                  │   - Smooth sliding card animation         │
                  └───────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Meta_Leads_Ad/
├── meta-lead-backend/          # Node.js backend
│   ├── server.js               # Express + Socket.IO Server
│   ├── routes/
│   │   └── webhook.js          # Inbound webhook endpoints (GET/POST)
│   ├── controllers/
│   │   └── webhookController.js # Handles verification & processes leads
│   ├── subscribe.js            # Utility to link app to Facebook Page webhooks
│   ├── simulate-webhook.js     # local webhook simulation utility (CRITICAL for testing)
│   └── .env                    # Environment credentials
│
└── lead-app/                   # React Native mobile client (Expo)
    └── src/
        ├── app/
        │   ├── _layout.tsx     # Navigation & Root Layout
        │   └── index.tsx       # Main leads feed list screen
        ├── components/
        │   └── LeadCard.tsx    # Animated lead container (react-native-reanimated)
        ├── hooks/
        │   └── useLeads.ts     # Real-time Socket.IO hook
        └── constants/
            └── config.ts       # Backend connection settings
```

---

## 🛠️ Step-by-Step Run & Test Guide

To verify the app's functionality, you can run the end-to-end integration flow either **locally (using the simulation script)** or **live (using the Meta Lead Ads Testing Tool and ngrok)**.

---

### Phase A: Setup the Backend

1. **Navigate to the backend directory and install dependencies**:
   ```bash
   cd meta-lead-backend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root of `meta-lead-backend/` (or check the existing one) with the following structure:
   ```env
   PORT=5000
   META_VERIFY_TOKEN=meta_leads_poc_2024
   META_PAGE_ACCESS_TOKEN=your_page_access_token # Generated via Graph API Explorer
   META_APP_ID=your_meta_app_id
   META_APP_SECRET=your_meta_app_secret
   ```

3. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   *The server runs at `http://localhost:5000`.*

---

### Phase B: Setup the Expo App

1. **Navigate to the mobile app directory and install dependencies**:
   ```bash
   cd lead-app
   npm install
   ```

2. **Configure Backend URL**:
   Open [lead-app/src/constants/config.ts](file:///c:/Users/dhay6/Desktop/Meta_Leads_Ad/lead-app/src/constants/config.ts) and verify that `SERVER_URL` matches your local or tunnel connection.
   * If testing on a physical device, set it to your active **ngrok URL**:
     ```ts
     export const SERVER_URL = 'https://mariam-unequable-frumpily.ngrok-free.dev';
     ```
   * If testing on local simulator, you can keep it as `http://localhost:5000` or `10.0.2.2:5000`.

3. **Start the app**:
   ```bash
   npm run start
   ```
   *Scan the QR code using the Expo Go app on your phone, or boot up the Android/iOS simulator.*
   *Verify that the app status bar in the top right displays **● CONNECTED**.*

---

### Phase C: testing the Real-Time Feed

Because Meta's developer accounts have strict verification requirements for sandbox/lead testing tools, you can demo and test using two different methods:

#### Method 1: Local Webhook Simulation (Recommended for quick testing)
To bypass Facebook's sandbox restriction issues, use the included simulation script. This script sends a POST request with the **exact JSON payload structure** that Meta's servers send to your webhook endpoint:

1. Open a new terminal window inside the `meta-lead-backend` folder.
2. Run the simulation tool:
   ```bash
   node simulate-webhook.js
   ```
3. **Verify:** Look at your mobile app. A new lead card containing a mock lead will instantly slide onto your screen in real time.

#### Method 2: Live Meta Integration
To link it to the actual Facebook Lead Ads testing console:

1. **Start the ngrok tunnel** to expose port 5000:
   ```bash
   ngrok http 5000
   ```
2. **Configure Meta Webhook Callback**:
   * **Callback URL:** `https://your-ngrok-url.ngrok-free.dev/webhook`
   * **Verify Token:** `meta_leads_poc_2024`
   * Select the **Page** object subscription and subscribe to the **`leadgen`** field.
3. **Link your App to the Page**:
   Make sure the page is subscribed to the app's webhooks. You can run the automation script in the backend to install the webhook subscription:
   ```bash
   node subscribe.js
   ```
4. **Use the Meta Testing Tool**:
   * Open the [Meta Lead Ads Testing Tool](https://developers.facebook.com/tools/lead-ads-testing/).
   * Select your Page and form.
   * Click **Create lead**.
   * The webhook receives the lead, and your app receives and renders it live.

---

## ⚡ Key Architectural Highlights

* **Socket.IO Transport Layer**: Used for instant bidirectional communication. The client connects with `transports: ['polling', 'websocket']` to ensure connection reliability across emulators and physical devices.
* **Non-blocking Event Loop**: When a webhook payload is received by the backend, it immediately responds with `200 EVENT_RECEIVED` to prevent Meta retries, then processes and emits the event asynchronously.
* **Layout Animations**: Utilizes `react-native-reanimated` to smoothly insert and slide new leads into the list, drawing attention to incoming data without jerking the UI.

---

## 📋 Assumptions

Please refer to [ASSUMPTIONS.md](./ASSUMPTIONS.md) for full context on technical decisions, design choices, and scoping limits.

---

## 📬 Contact

Built for the **Unque** offline developer evaluation.
* **Submitted to:** krishna@unque.me
