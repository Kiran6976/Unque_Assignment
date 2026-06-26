const http = require('http');

const payload = {
  object: "page",
  entry: [
    {
      id: "153125381133",
      time: Math.floor(Date.now() / 1000),
      changes: [
        {
          field: "leadgen",
          value: {
            leadgen_id: "99999" + Math.floor(10000 + Math.random() * 90000),
            page_id: "153125381133",
            form_id: "88888",
            adgroup_id: "77777",
            ad_id: "66666",
            created_time: Math.floor(Date.now() / 1000)
          }
        }
      ]
    }
  ]
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log("Simulating a Meta Webhook request to http://localhost:5000/webhook...");

const req = http.request(options, (res) => {
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${responseBody}`);
    if (res.statusCode === 200 && responseBody === 'EVENT_RECEIVED') {
      console.log("Webhook simulation sent successfully!");
    } else {
      console.error("Failed to simulate webhook.");
    }
  });
});

req.on('error', (error) => {
  console.error('Error sending request:', error.message);
});

req.write(data);
req.end();
