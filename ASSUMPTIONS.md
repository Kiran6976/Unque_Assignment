# Assumptions

The following assumptions were made while building this Proof of Concept:

## 1. Real-time Transport: Socket.IO (not Firebase)
Firebase Firestore (commonly used for real-time sync) requires billing/credit card details.
Socket.IO was chosen instead — it is completely free, requires no external service or account,
and runs on the same local Node.js server. This is architecturally simpler and more
transparent for a PoC.

## 2. Local Backend + ngrok Tunnel
The backend runs locally on the developer's machine and is exposed to the internet via ngrok
(free tier). In a production setup, this would be deployed to a cloud provider (e.g., AWS,
Railway, Render). For this PoC, ngrok is sufficient.

## 3. Lead Form Data
When Meta fires a webhook, it only sends a `leadgen_id` — not the actual form fields (name,
email, phone). Retrieving full field data requires an additional Graph API call with a
Page Access Token. This is implemented in the backend (webhookController.js) but the
display shows the leadgen_id-based identifier when the token is not provided. The
"Send Test Lead" button uses hardcoded test data to demonstrate the full UI.

## 4. No Real Meta Ad Spend
The Meta Lead Ads Testing Tool was used to simulate lead submissions. No real ad campaign
or budget was required.

## 5. Android Emulator
The demo was recorded on an Android emulator (API Level 35 — VanillaIceCream / Android 15)
running via Android Studio. The app works on iOS and physical devices as well.

## 6. Single Screen App
The assignment required a "leads list screen" — the app is a single-screen experience
focused entirely on the real-time leads feed. No authentication, user management, or
additional screens were built (out of scope for a PoC).

## 7. App Security
No authentication is implemented on the WebSocket connection or the webhook endpoint
(beyond Meta's verify token). This is acceptable for a PoC/demo but would need
proper security in production.

## 8. Ngrok URL Must Be Updated
Every time ngrok is restarted, it generates a new URL (free tier). The Meta webhook
callback URL and the app's `SERVER_URL` config must be updated accordingly.
A paid ngrok plan provides a stable static URL.
