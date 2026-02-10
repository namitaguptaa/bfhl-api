require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;

/* Utility functions */
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const fibonacciSeries = (n) => {
  let a = 0, b = 1;
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

/* GET /health */
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

/* POST /bfhl */
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Exactly one key required"
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacciSeries(body[key]);
        break;

      case "prime":
        data = body[key].filter(isPrime);
        break;

      case "lcm":
        data = body[key].reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        data = body[key].reduce((a, b) => gcd(a, b));
        break;

      case "AI":
        const aiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: body[key] }] }]
          }
        );
        data = aiRes.data.candidates[0].content.parts[0].text.split(" ")[0];
        break;

      default:
        throw "Invalid key";
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    res.status(400).json({
      is_success: false,
      message: err.toString()
    });
  }
});

/* Start server */
app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
