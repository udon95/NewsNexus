const express = require("express");
const fetch = require("node-fetch"); 
const router = express.Router();

router.post("/factcheck", async (req, res) => {
  const { userText } = req.body;
  console.log("Received text:", userText);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You're a fact-checking assistant. Review the user's text for factual accuracy.",
          },
          { role: "user", content: userText },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    const result =
      data.choices?.[0]?.message?.content || "No content returned.";
    res.json({ result });
  } catch (err) {
    console.error("Fact-checking error:", err);
    res.status(500).json({ error: "Failed to fact-check content" });
  }
});

module.exports = router;
