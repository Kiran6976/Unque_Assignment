const https = require('https');
require('dotenv').config();

const token = process.env.META_PAGE_ACCESS_TOKEN;
if (!token) {
  console.error("Error: META_PAGE_ACCESS_TOKEN is not defined in your .env file");
  process.exit(1);
}

const path = `/v19.0/me/subscribed_apps?subscribed_fields=leadgen&access_token=${encodeURIComponent(token)}`;

const options = {
  hostname: 'graph.facebook.com',
  port: 443,
  path: path,
  method: 'POST'
};

console.log("Subscribing app to page webhooks...");

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log("Response from Meta:", response);
      if (response.success) {
        console.log("✅ Successfully subscribed page to your app!");
      } else {
        console.error("❌ Subscription failed. See the error response above.");
      }
    } catch (e) {
      console.error("Failed to parse response:", data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
