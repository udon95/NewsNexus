const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

router.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;
const HUGGINGFACE_KEY = process.env.HUGGINGFACE_KEY;

// const generateFactCheckPrompt = (content, context = "", model = "gpt") => {
//   const today = new Date().toLocaleDateString("en-SG", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
//   return `
// You are a fact-checking assistant. Today's date is **${today}**.

// Review the following article and highlight any false or misleading statements.

// Format:
// - Wrap only the false or misleading text in <mark>...</mark>.
// - Immediately after that, add the explanation in parentheses like this:
//   (This statement is false because...)

// - Do NOT include the explanation inside the <mark> tags.
// - Do NOT remove or alter the rest of the article.
// - If everything is correct, return the original article unchanged (no <mark>, no explanation).

// Here is the article to check:
// ${content}
// ${context ? `\n\nContext:\n${context}` : ""}
// `;
// };

// const generatePerplexityPrompt = (content) => `
// Analyze the content below **only if it makes an objective, verifiable claim** (e.g. statistics, dates, legal facts).
// If the content is clearly a **personal opinion**, reflection, or anecdote (like an interview), do not flag it.

// - If it's unverifiable or personal: respond with "no-issue"
// - If it's potentially misleading: respond with "dubious" or "obviously-fake"
// - Provide a brief explanation only for "dubious" or "obviously-fake"

// Content:
// "${content}"

// `;

// router.post("/factcheck", async (req, res) => {
//   const { userText } = req.body;
//   console.log("Received text:", userText);

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${OPENAI_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               "You're a fact-checking assistant. Review the user's text for factual accuracy.",
//           },
//           { role: "user", content: userText },
//         ],
//         temperature: 0.3,
//       }),
//     });

//     const data = await response.json();
//     console.log("OpenAI response:", data);

//     const result =
//       data.choices?.[0]?.message?.content || "No content returned.";
//     res.json({ result });
//   } catch (err) {
//     console.error("Fact-checking error:", err);
//     res.status(500).json({ error: "Failed to fact-check content" });
//   }
// });

async function moderateText(content) {
  const res = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: content }),
  });
  const data = await res.json();
  return data.results?.[0];
}

//  Image Moderation (Hugging Face - NudeNet)
// async function moderateImage(base64Image) {
//   const res = await fetch(
//     "https://api-inference.huggingface.co/models/NotAI-tech/NudeNet_NSFW",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${HUGGINGFACE_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ inputs: base64Image }),
//     }
//   );
//   const result = await res.json();
//   return result; // typically returns labels like "nsfw", "porn"
// }

const generateCategoryPrompt = (content, category) => `
You are a category validation assistant.

Determine if the following article content is relevant to the category "${category}".

Relevance includes people, places, events, policies, or topics that originate from or strongly affect the category.

Respond with one word only: "yes" or "no".
EXAMPLE 1
Category: Technology  
Article: “Modern GPU architectures push 4 nm transistors, AI inference on-chip…”  
Answer: Yes

EXAMPLE 2
Category: Technology  
Article: “Baking sourdough with wild yeast, tips on kneading dough…”  
Answer: No

NOW EVALUATE
Category: ${category} 
Article:
${content}
Answer:
`;

async function factCheck(content, topicName) {
  const catRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a category validation assistant." },
        { role: "user", content: generateCategoryPrompt(content, topicName) },
      ],
      temperature: 0.2,
    }),
  });

  const catData = await catRes.json();
  console.log("🟢 Category check raw response:", JSON.stringify(catData, null, 2));
  const rawCategory = catData.choices?.[0]?.message?.content;
  const categoryMatch = rawCategory ? rawCategory.trim().toLowerCase() : "";
  console.log("🟢 Category assistant says:", categoryMatch);

  if (categoryMatch.startsWith("y")) {
  } else {
    throw {
      status: 400,
      error: `Article content does not match category: ${topicName}`,
    };
  }

  // 2️⃣ Perplexity factual check
  try {
    const pxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `
 You are a fact-checking assistant. 

Please review the following article and verify its factual accuracy using up-to-date knowledge as of today.

 For any false, misleading, or dubious claims:
 - Wrap only the false or misleading text in <mark> tags.
 - Immediately after each <mark> section, on a new line preceded by a <br> tag, provide an explanation in parentheses that details why the text is inaccurate.

 In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 0 means it is entirely inaccurate.

 Return your output in valid JSON format exactly as follows:
 {"accuracy": <percentage between 0 and 100>, "feedback": "<Your explanation including any <mark> annotations if applicable>"}
  
 Article:
 ${content}
 `,
          },
          { role: "user", content },
        ],
      }),
    });
    const pxData = await pxRes.json();
    const reply = pxData.choices?.[0]?.message?.content.trim();
    const result = JSON.parse(reply);
    if (result.accuracy < 75) {
      throw { status: 400, error: "Article failed fact-checking.", ...result };
    }
    return result;
  } catch (err) {
    // Fallback to GPT
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant.
                 Review the following article and highlight any **false or misleading** statements.
                 For any inaccuracies, describe the issues. 
                 Then, provide an overall factual accuracy score as a number between 0 and 100.
                 If some parts are ambiguous but overall the article is largely accurate, note this in your score.
                 Return your response in valid JSON format in this exact structure:
                {"accuracy": <percentage between 0 and 100>, "feedback": "<Your explanation>"}`,
          },
          { role: "user", content },
        ],
        temperature: 0.2,
      }),
    });
    const gptData = await gptRes.json();
    const parsed = JSON.parse(gptData.choices[0].message.content);
    if (parsed.accuracy < 75) {
      throw { status: 400, error: "Article failed fact-checking.", ...parsed };
    }
    return parsed;
  }
}

router.post("/submit-article", async (req, res) => {
  console.log("body", req.body);
  const { title, content, authorId, topicid, topicName } = req.body;

  if (!title || !content || !authorId || !topicid || !topicName) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const modResult = await moderateText(content);
  if (modResult?.flagged) {
    return res.status(400).json({
      error: "Content flagged as inappropriate by text moderation.",
      categories: modResult.categories,
    });
  }

  // if (imageBase64) {
  //   const imageMod = await moderateImage(imageBase64);
  //   if (
  //     imageMod?.[0]?.label?.toLowerCase().includes("nsfw") &&
  //     imageMod?.[0]?.score > 0.8
  //   ) {
  //     return res.status(400).json({ error: "Image flagged as NSFW." });
  //   }
  // }

  try {
    await factCheck(content, topicName);
  } catch (err) {
    console.error("Fact-check error:", err);
    return res.status(err.status || 400).json({
      error: err.error,
      ...(err.feedback && { feedback: err.feedback }),
    });
  }

  // Insert into `articles`
  const { data, error } = await supabase.from("articles").insert([
    {
      title,
      text: content,
      userid: authorId,
      topicid,
    },
  ]);

  if (error) {
    console.error("General insert error:", error);
    return res.status(500).json({ error: error.message });
  }
  return res.json({
    message: "Factual article saved successfully.",
    article: data[0],
  });

  //   if (type === "opinion") {
  //     await supabase
  //       .from("room_articles")
  //       .insert([{ title, content, authorid: authorId }]);
  //     return res.json({ message: "Opinion article saved successfully." });
  //   }

  //   try {
  //     // Step 1: Check category match via GPT
  //     const catRes = await fetch("https://api.openai.com/v1/chat/completions", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${OPENAI_KEY}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         model: "gpt-3.5-turbo",
  //         messages: [
  //           {
  //             role: "system",
  //             content: "You are a category validation assistant.",
  //           },
  //           { role: "user", content: generateCategoryPrompt(content, topicName) },
  //         ],
  //         temperature: 0.2,
  //       }),
  //     });

  //     const catData = await catRes.json();
  //     const categoryMatch = catData.choices?.[0]?.message?.content
  //       .trim()
  //       .toLowerCase();

  //     if (!categoryMatch.includes("yes")) {
  //       return res.status(400).json({
  //         error: `Article content does not match the category "${topicName}".`,
  //       });
  //     }

  //     // Step 2: Real-time context via Perplexity
  //     let verdict = "";
  //     let explanation = "";
  //     let usedGPT = false;
  //     let gptMessage = "";

  //     try {
  //       const pxRes = await fetch("https://api.perplexity.ai/chat/completions", {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${PERPLEXITY_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           model: "sonar",
  //           messages: [
  //             {
  //               role: "system",
  //               content: `
  // You are a fact-checking assistant.

  // Please review the following article and verify its factual accuracy using up-to-date knowledge as of today.

  // For any false, misleading, or dubious claims:
  // - Wrap only the false or misleading text in <mark> tags.
  // - Immediately after each <mark> section, on a new line preceded by a <br> tag, provide an explanation in parentheses that details why the text is inaccurate.

  // In addition, analyze the overall factual correctness of the article and assign a numerical accuracy score between 0 and 100, where 100 means the article is completely accurate and 0 means it is entirely inaccurate.

  // Return your output in valid JSON format exactly as follows:
  // {"accuracy": <percentage between 0 and 100>, "feedback": "<Your explanation including any <mark> annotations if applicable>"}

  // Article:
  // ${content}
  // `,
  //             },
  //             {
  //               role: "user",
  //               content: content,
  //             },
  //           ],
  //         }),
  //       });

  //       const pxData = await pxRes.json();
  //       console.log("🟣 Perplexity raw:", pxData);
  //       const perplexityReply = pxData.choices?.[0]?.message?.content?.trim();
  //       const lowerReply = perplexityReply?.toLowerCase() || "";
  //       let factCheckResult;
  //       try {
  //         factCheckResult = JSON.parse(perplexityReply);
  //       } catch (error) {
  //         throw new Error("Perplexity returned an invalid JSON format.");
  //       }
  //       if (
  //         !perplexityReply ||
  //         lowerReply.includes("i'm not sure") ||
  //         lowerReply.includes("unknown") ||
  //         lowerReply.includes("cannot verify")
  //       ) {
  //         throw new Error("Perplexity returned unsure result.");
  //       }

  //       // If <mark> present, treat as failed check
  //       const failed = perplexityReply.includes("<mark>");

  //       if (failed) {
  //         return res.status(400).json({
  //           verdict: "failed",
  //           source: "perplexity",
  //           highlightedHTML: perplexityReply,
  //         });
  //       }
  //       const { accuracy, feedback } = factCheckResult;
  //       // Define a threshold (for example, 80) below which the article fails the fact-check
  //       const threshold = 75;
  //       if (accuracy < threshold) {
  //         return res.status(400).json({
  //           error: "Article failed fact-checking.",
  //           accuracy,
  //           feedback,
  //           source: "perplexity",
  //         });
  //       }

  //       return res.json({
  //         verdict: "passed",
  //         source: "perplexity",
  //         accuracy,
  //         feedback,
  //       });
  //     } catch (err) {
  //       console.warn("Perplexity failed or unsure — falling back to GPT.");

  //       usedGPT = true;

  //       const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${OPENAI_KEY}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           model: "gpt-3.5-turbo",
  //           messages: [
  //             {
  //               role: "system",
  //               content: `You are a fact-checking assistant.
  //                 Review the following article and highlight any **false or misleading** statements.
  //                 For any inaccuracies, describe the issues.
  //                 Then, provide an overall factual accuracy score as a number between 0 and 100.
  //                 If some parts are ambiguous but overall the article is largely accurate, note this in your score.
  //                 Return your response in valid JSON format in this exact structure:
  //                 {"accuracy": <percentage between 0 and 100>, "feedback": "<Your explanation>"}`,

  //               // Format:
  //               // - Wrap only the false or misleading **text** in "<mark>...</mark><br>".
  //               // - Directly after the marked text, add the explanation in **parentheses** like this:
  //               //   "(This statement is false because...)"
  //               // - Do NOT include the explanation inside the "<mark>" tags.
  //               // - Do NOT remove or alter the rest of the article.
  //               // - If everything is correct, return the original article **unchanged** (no <mark>, no explanation).

  //               //   Return the **entire article** with these annotations applied.
  //               // `,
  //             },
  //             {
  //               role: "user",
  //               content: content,
  //             },
  //           ],
  //           temperature: 0.2,
  //         }),
  //       });

  //       const gptData = await gptRes.json();
  //       const gptMessage = gptData.choices?.[0]?.message?.content || "";
  //       console.log(gptMessage);
  //       const explanation = gptMessage;
  //       const lowerMsg = gptMessage.toLowerCase();
  //       const containsFalseKeywords = [
  //         "false",
  //         "obviously-fake",
  //         "this is false",
  //         "not true",
  //         "misleading",
  //         "dubious",
  //         "<mark>",
  //       ];

  //       verdict = containsFalseKeywords.some((k) => lowerMsg.includes(k))
  //         ? "false"
  //         : "true";

  //       console.log("💬 GPT Verdict:", verdict);
  //       console.log("📝 GPT Explanation:", gptMessage);

  //       let factCheckResult;
  //       try {
  //         factCheckResult = JSON.parse(gptMessage);
  //       } catch (error) {
  //         console.error("Failed to parse GPT output as JSON:", error);
  //         return res
  //           .status(500)
  //           .json({ error: "Invalid response format from fact-checking." });
  //       }

  //       const accuracy = factCheckResult.accuracy;
  //       const feedback = factCheckResult.feedback;
  //       const threshold = 75; // Define your acceptance threshold

  //       if (accuracy < threshold) {
  //         return res.status(400).json({
  //           error: "Article failed fact-checking.",
  //           accuracy,
  //           feedback,
  //         });
  //       }

  //       if (verdict === "false") {
  //         return res.status(400).json({
  //           error: "Article failed fact-checking.",
  //           verdict,
  //           highlightedHTML: gptMessage,
  //         });
  //       }
  //     }

  // Step 3: Final fact-check
  // const factRes = await fetch("https://api.openai.com/v1/chat/completions", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${OPENAI_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     model: "gpt-3.5-turbo",
  //     messages: [
  //       {
  //         role: "system",
  //         content:
  //           "You are a fact-checking assistant. Respond with true, dubious, or false and a short reason.",
  //       },
  //       { role: "user", content: generateFactCheckPrompt(content, context) },
  //     ],
  //     temperature: 0.2,
  //   }),
  // });

  // const factData = await factRes.json();
  // const verdict = factData.choices?.[0]?.message?.content
  //   .trim()
  //   .toLowerCase();

  //   if (verdict.includes("false") || verdict.includes("dubious")) {
  //     return res.status(400).json({
  //       error: "Article failed fact-checking.",
  //       verdict,
  //       highlightedHTML: gptMessage,
  //     });
  //   }

  //   // Save to Supabase
  //   await supabase
  //     .from("articles")
  //     .insert([
  //       { title, text: content, userid: authorId, topicid, accuracy_score },
  //     ]);

  //   return res.json({
  //     message: "Factual article saved successfully.",
  //     verdict,
  //     accuracy: typeof accuracy !== "undefined" ? accuracy : undefined,
  //     feedback:
  //       explanation && explanation.includes("<mark>")
  //         ? explanation
  //         : explanation || null,
  //   });
  // } catch (err) {
  //   console.error("Article submission error:", err);
  //   res.status(500).json({ error: "Failed to submit article." });
  // }
});

router.post("/rooms/:roomid/articles", async (req, res) => {
  const { roomid } = req.params;
  const { title, content, authorId, type, topicName, imageBase64 } = req.body;

  // Validate required
  if (!roomid || !title || !content || !authorId || !type) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  // Moderate text/image
  const textMod = await moderateText(content);
  if (textMod.flagged)
    return res.status(400).json({ error: "Content flagged." });
  if (imageBase64) {
    const imgMod = await moderateImage(imageBase64);
    if (
      imgMod[0]?.label?.toLowerCase().includes("nsfw") &&
      imgMod[0].score > 0.8
    )
      return res.status(400).json({ error: "Image flagged as NSFW." });
  }

  // Opinion flow: direct save
  if (type === "opinion") {
    const { data, error } = await supabase.from("room_articles").insert([
      {
        roomid,
        userid: authorId,
        title,
        content,
        status: "Published",
        is_general: false,
      },
    ]);
    if (error) {
      console.error("Room opinion insert error:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.json({
      message: "Opinion article saved in room.",
      article: data[0],
    });
  }

  // Factual in room: need topicName for category check
  if (!topicName) {
    return res.status(400).json({
      error: "Missing required field: topicName for factual room post.",
    });
  }
  try {
    await factCheck(content, topicName);
  } catch (fcErr) {
    console.error("Room fact-check error:", fcErr);
    return res.status(fcErr.status || 400).json({ error: fcErr.error });
  }

  // Insert factual room article
  const { data, error } = await supabase.from("room_articles").insert([
    {
      roomid,
      userid: authorId,
      title,
      content,
      status: "Published",
      is_general: true,
    },
  ]);
  if (error) {
    console.error("Room factual insert error:", error);
    return res.status(500).json({ error: error.message });
  }
  return res.json({
    message: "Factual article saved in room.",
    article: data[0],
  });
});

module.exports = router;
